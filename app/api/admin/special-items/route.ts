import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { specialItemFees, adminActivityLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/auth/admin';

// GET - Liste tous les articles spéciaux (admin seulement)
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await db
      .select()
      .from(specialItemFees)
      .orderBy(specialItemFees.itemName);

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error: any) {
    console.error('[GET /api/admin/special-items] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch special items',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel article spécial
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      category,
      brand,
      itemName,
      minModel,
      maxModel,
      fixedFee,
      description,
      imageUrl,
      isActive,
      // Traductions
      itemName_fr,
      itemName_ht,
      itemName_es,
      description_fr,
      description_ht,
      description_es,
    } = body;

    // Validation
    if (!category || !brand || !itemName || !fixedFee) {
      return NextResponse.json(
        { error: 'Missing required fields: category, brand, itemName, fixedFee' },
        { status: 400 }
      );
    }

    if (isNaN(parseFloat(fixedFee)) || parseFloat(fixedFee) <= 0) {
      return NextResponse.json(
        { error: 'fixedFee must be a positive number' },
        { status: 400 }
      );
    }

    // Créer l'article
    const [newItem] = await db
      .insert(specialItemFees)
      .values({
        category,
        brand,
        itemName,
        minModel: minModel || null,
        maxModel: maxModel || null,
        fixedFee: parseFloat(fixedFee).toFixed(2),
        description: description || null,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: session.adminId,
        itemName_fr: itemName_fr || null,
        itemName_ht: itemName_ht || null,
        itemName_es: itemName_es || null,
        description_fr: description_fr || null,
        description_ht: description_ht || null,
        description_es: description_es || null,
      })
      .returning();

    // Log l'activité
    await db.insert(adminActivityLogs).values({
      adminId: session.adminId,
      action: 'created_special_item',
      targetType: 'special_item',
      targetId: newItem.id,
      details: {
        itemName: newItem.itemName,
        brand: newItem.brand,
        fixedFee: newItem.fixedFee,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      item: newItem,
    });
  } catch (error: any) {
    console.error('[POST /api/admin/special-items] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create special item',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
