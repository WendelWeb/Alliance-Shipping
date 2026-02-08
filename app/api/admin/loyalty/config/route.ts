import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loyaltyConfig, admins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

// Default config keys and their values
const DEFAULT_CONFIGS: Record<string, { value: string; description: string }> = {
  credit_per_referral: {
    value: '5.00',
    description: 'Credit (in $) given to referrer when someone signs up',
  },
  credit_per_shipment: {
    value: '1.00',
    description: 'Credit (in $) earned per completed shipment',
  },
  credit_per_lb: {
    value: '0.10',
    description: 'Credit (in $) earned per pound shipped on delivered packages',
  },
  points_per_dollar_spent: {
    value: '50',
    description: 'Points earned for every dollar spent on shipments',
  },
  points_to_dollar_rate: {
    value: '1000',
    description: 'Points needed to convert to 1 dollar of credit',
  },
};

// GET - Get all loyalty config values
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all config entries from DB
    const configs = await db
      .select()
      .from(loyaltyConfig);

    // Build a map of existing configs
    const configMap: Record<string, any> = {};
    for (const config of configs) {
      configMap[config.key] = {
        id: config.id,
        key: config.key,
        value: parseFloat(config.value),
        description: config.description,
        updatedBy: config.updatedBy,
        updatedAt: config.updatedAt,
      };
    }

    // Fill in defaults for any missing keys
    for (const [key, defaults] of Object.entries(DEFAULT_CONFIGS)) {
      if (!configMap[key]) {
        configMap[key] = {
          id: null,
          key,
          value: parseFloat(defaults.value),
          description: defaults.description,
          updatedBy: null,
          updatedAt: null,
          isDefault: true,
        };
      }
    }

    return NextResponse.json({
      success: true,
      configs: Object.values(configMap),
    });
  } catch (error) {
    console.error('Error fetching loyalty config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty configuration' },
      { status: 500 }
    );
  }
}

// PUT - Update loyalty config values
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { configs } = body;

    if (!configs || !Array.isArray(configs) || configs.length === 0) {
      return NextResponse.json(
        { error: 'configs array is required' },
        { status: 400 }
      );
    }

    // Validate the admin exists
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, parseInt(adminId)));

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const updatedConfigs = [];

    for (const configItem of configs) {
      const { key, value, description } = configItem;

      if (!key || value === undefined || value === null) {
        continue; // Skip invalid entries
      }

      const numericValue = parseFloat(value);
      if (isNaN(numericValue) || numericValue < 0) {
        return NextResponse.json(
          { error: `Invalid value for key "${key}": must be a non-negative number` },
          { status: 400 }
        );
      }

      // Check if this config key already exists
      const [existing] = await db
        .select()
        .from(loyaltyConfig)
        .where(eq(loyaltyConfig.key, key));

      if (existing) {
        // Update existing config
        const [updated] = await db
          .update(loyaltyConfig)
          .set({
            value: numericValue.toFixed(2),
            description: description || existing.description,
            updatedBy: admin.id,
            updatedAt: new Date(),
          })
          .where(eq(loyaltyConfig.key, key))
          .returning();

        updatedConfigs.push(updated);
      } else {
        // Insert new config
        const [created] = await db
          .insert(loyaltyConfig)
          .values({
            key,
            value: numericValue.toFixed(2),
            description: description || DEFAULT_CONFIGS[key]?.description || null,
            updatedBy: admin.id,
          })
          .returning();

        updatedConfigs.push(created);
      }
    }

    return NextResponse.json({
      success: true,
      configs: updatedConfigs.map((c) => ({
        id: c.id,
        key: c.key,
        value: parseFloat(c.value),
        description: c.description,
        updatedBy: c.updatedBy,
        updatedAt: c.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error updating loyalty config:', error);
    return NextResponse.json(
      { error: 'Failed to update loyalty configuration' },
      { status: 500 }
    );
  }
}
