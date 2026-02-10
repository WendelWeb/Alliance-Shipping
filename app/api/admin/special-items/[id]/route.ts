import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { specialItemFees, adminActivityLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/auth/admin';

// GET - Récupérer un article spécial spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    const [item] = await db
      .select()
      .from(specialItemFees)
      .where(eq(specialItemFees.id, itemId));

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error: any) {
    console.error('[GET /api/admin/special-items/[id]] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch special item',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Modifier un article spécial existant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    // Vérifier que l'item existe
    const [existingItem] = await db
      .select()
      .from(specialItemFees)
      .where(eq(specialItemFees.id, itemId));

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
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
    if (fixedFee !== undefined) {
      if (isNaN(parseFloat(fixedFee)) || parseFloat(fixedFee) <= 0) {
        return NextResponse.json(
          { error: 'fixedFee must be a positive number' },
          { status: 400 }
        );
      }
    }

    // Construire l'objet de mise à jour (uniquement les champs fournis)
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (category !== undefined) updateData.category = category;
    if (brand !== undefined) updateData.brand = brand;
    if (itemName !== undefined) updateData.itemName = itemName;
    if (minModel !== undefined) updateData.minModel = minModel || null;
    if (maxModel !== undefined) updateData.maxModel = maxModel || null;
    if (fixedFee !== undefined) updateData.fixedFee = parseFloat(fixedFee).toFixed(2);
    if (description !== undefined) updateData.description = description || null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Traductions
    if (itemName_fr !== undefined) updateData.itemName_fr = itemName_fr || null;
    if (itemName_ht !== undefined) updateData.itemName_ht = itemName_ht || null;
    if (itemName_es !== undefined) updateData.itemName_es = itemName_es || null;
    if (description_fr !== undefined) updateData.description_fr = description_fr || null;
    if (description_ht !== undefined) updateData.description_ht = description_ht || null;
    if (description_es !== undefined) updateData.description_es = description_es || null;

    // Mettre à jour l'article
    const [updatedItem] = await db
      .update(specialItemFees)
      .set(updateData)
      .where(eq(specialItemFees.id, itemId))
      .returning();

    // Log l'activité
    await db.insert(adminActivityLogs).values({
      adminId: session.adminId,
      action: 'updated_special_item',
      targetType: 'special_item',
      targetId: itemId,
      details: {
        itemName: updatedItem.itemName,
        changes: Object.keys(updateData).filter(k => k !== 'updatedAt'),
        oldFixedFee: existingItem.fixedFee,
        newFixedFee: updatedItem.fixedFee,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      item: updatedItem,
    });
  } catch (error: any) {
    console.error('[PUT /api/admin/special-items/[id]] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update special item',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Désactiver (soft delete) un article spécial
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    // Vérifier que l'item existe
    const [existingItem] = await db
      .select()
      .from(specialItemFees)
      .where(eq(specialItemFees.id, itemId));

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Soft delete: désactiver l'item au lieu de le supprimer
    const [deletedItem] = await db
      .update(specialItemFees)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(specialItemFees.id, itemId))
      .returning();

    // Log l'activité
    await db.insert(adminActivityLogs).values({
      adminId: session.adminId,
      action: 'deleted_special_item',
      targetType: 'special_item',
      targetId: itemId,
      details: {
        itemName: deletedItem.itemName,
        brand: deletedItem.brand,
        fixedFee: deletedItem.fixedFee,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Item deactivated successfully',
      item: deletedItem,
    });
  } catch (error: any) {
    console.error('[DELETE /api/admin/special-items/[id]] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete special item',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
