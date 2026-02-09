// ============================================
// ACTION EXECUTORS - DB modifications for action templates
// Each executor: validates payload, modifies DB, returns change log
// ============================================

import { db } from '@/lib/db';
import { cityPricing, loyaltyConfig, specialItemFees, warehouses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type {
  CityFeeChangePayload,
  DeliveryTimeChangePayload,
  LoyaltyRateChangePayload,
  NewSpecialItemPayload,
  ModifySpecialItemPayload,
  RemoveSpecialItemPayload,
  NewWarehousePayload,
  ModifyWarehousePayload,
  CloseWarehousePayload,
} from './templates-v2';

export interface ActionChange {
  table: string;
  action: 'update' | 'insert' | 'deactivate';
  identifier: string; // city name, item name, etc.
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export interface ActionResult {
  success: boolean;
  changes: ActionChange[];
  error?: string;
}

// ─── MAIN DISPATCHER ────────────────────────────────────────────

export async function executeAction(
  templateId: string,
  payload: Record<string, any>,
  adminId: number
): Promise<ActionResult> {
  switch (templateId) {
    case 'city_fee_change':
      return executeCityFeeChange(payload as CityFeeChangePayload);
    case 'delivery_time_change':
      return executeDeliveryTimeChange(payload as DeliveryTimeChangePayload);
    case 'loyalty_rate_change':
      return executeLoyaltyRateChange(payload as LoyaltyRateChangePayload, adminId);
    case 'new_special_item':
      return executeNewSpecialItem(payload as NewSpecialItemPayload, adminId);
    case 'modify_special_item':
      return executeModifySpecialItem(payload as ModifySpecialItemPayload);
    case 'remove_special_item':
      return executeRemoveSpecialItem(payload as RemoveSpecialItemPayload);
    case 'new_warehouse':
      return executeNewWarehouse(payload as NewWarehousePayload);
    case 'modify_warehouse':
      return executeModifyWarehouse(payload as ModifyWarehousePayload);
    case 'close_warehouse':
      return executeCloseWarehouse(payload as CloseWarehousePayload);
    default:
      return { success: false, changes: [], error: `Unknown action template: ${templateId}` };
  }
}

// ─── CITY FEE CHANGE ────────────────────────────────────────────

async function executeCityFeeChange(payload: CityFeeChangePayload): Promise<ActionResult> {
  const changes: ActionChange[] = [];

  for (const city of payload.cities) {
    const [existing] = await db
      .select()
      .from(cityPricing)
      .where(eq(cityPricing.city, city.city))
      .limit(1);

    if (!existing) {
      return { success: false, changes, error: `City "${city.city}" not found in pricing table` };
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    const oldValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};

    if (city.oldServiceFee !== city.newServiceFee) {
      updateData.serviceFee = city.newServiceFee.toFixed(2);
      oldValues.serviceFee = city.oldServiceFee;
      newValues.serviceFee = city.newServiceFee;
    }
    if (city.oldPricePerLb !== city.newPricePerLb) {
      updateData.pricePerLb = city.newPricePerLb.toFixed(2);
      oldValues.pricePerLb = city.oldPricePerLb;
      newValues.pricePerLb = city.newPricePerLb;
    }

    if (Object.keys(oldValues).length > 0) {
      await db
        .update(cityPricing)
        .set(updateData)
        .where(eq(cityPricing.city, city.city));

      changes.push({
        table: 'city_pricing',
        action: 'update',
        identifier: city.city,
        oldValues,
        newValues,
      });
    }
  }

  return { success: true, changes };
}

// ─── DELIVERY TIME CHANGE ───────────────────────────────────────

async function executeDeliveryTimeChange(payload: DeliveryTimeChangePayload): Promise<ActionResult> {
  const [existing] = await db
    .select()
    .from(cityPricing)
    .where(eq(cityPricing.city, payload.city))
    .limit(1);

  if (!existing) {
    return { success: false, changes: [], error: `City "${payload.city}" not found` };
  }

  await db
    .update(cityPricing)
    .set({
      deliveryDaysMin: payload.newDeliveryDaysMin,
      deliveryDaysMax: payload.newDeliveryDaysMax,
      perfumeDaysMin: payload.newPerfumeDaysMin,
      perfumeDaysMax: payload.newPerfumeDaysMax,
      updatedAt: new Date(),
    })
    .where(eq(cityPricing.city, payload.city));

  return {
    success: true,
    changes: [{
      table: 'city_pricing',
      action: 'update',
      identifier: payload.city,
      oldValues: {
        deliveryDaysMin: payload.oldDeliveryDaysMin,
        deliveryDaysMax: payload.oldDeliveryDaysMax,
        perfumeDaysMin: payload.oldPerfumeDaysMin,
        perfumeDaysMax: payload.oldPerfumeDaysMax,
      },
      newValues: {
        deliveryDaysMin: payload.newDeliveryDaysMin,
        deliveryDaysMax: payload.newDeliveryDaysMax,
        perfumeDaysMin: payload.newPerfumeDaysMin,
        perfumeDaysMax: payload.newPerfumeDaysMax,
      },
    }],
  };
}

// ─── LOYALTY RATE CHANGE ────────────────────────────────────────

async function executeLoyaltyRateChange(payload: LoyaltyRateChangePayload, adminId: number): Promise<ActionResult> {
  const changes: ActionChange[] = [];

  for (const change of payload.changes) {
    const [existing] = await db
      .select()
      .from(loyaltyConfig)
      .where(eq(loyaltyConfig.key, change.key));

    if (existing) {
      await db
        .update(loyaltyConfig)
        .set({
          value: change.newValue.toFixed(2),
          updatedBy: adminId,
          updatedAt: new Date(),
        })
        .where(eq(loyaltyConfig.key, change.key));
    } else {
      await db.insert(loyaltyConfig).values({
        key: change.key,
        value: change.newValue.toFixed(2),
        updatedBy: adminId,
      });
    }

    changes.push({
      table: 'loyalty_config',
      action: existing ? 'update' : 'insert',
      identifier: change.key,
      oldValues: { value: change.oldValue },
      newValues: { value: change.newValue },
    });
  }

  return { success: true, changes };
}

// ─── NEW SPECIAL ITEM ───────────────────────────────────────────

async function executeNewSpecialItem(payload: NewSpecialItemPayload, adminId: number): Promise<ActionResult> {
  const [created] = await db
    .insert(specialItemFees)
    .values({
      category: payload.category,
      brand: payload.brand,
      itemName: payload.itemName,
      minModel: payload.minModel || null,
      maxModel: payload.maxModel || null,
      fixedFee: payload.fixedFee.toFixed(2),
      description: payload.description || null,
      createdBy: adminId,
    })
    .returning();

  return {
    success: true,
    changes: [{
      table: 'special_item_fees',
      action: 'insert',
      identifier: `${payload.brand} ${payload.itemName}`,
      newValues: {
        category: payload.category,
        brand: payload.brand,
        itemName: payload.itemName,
        fixedFee: payload.fixedFee,
      },
    }],
  };
}

// ─── MODIFY SPECIAL ITEM ────────────────────────────────────────

async function executeModifySpecialItem(payload: ModifySpecialItemPayload): Promise<ActionResult> {
  const [existing] = await db
    .select()
    .from(specialItemFees)
    .where(eq(specialItemFees.id, payload.itemId))
    .limit(1);

  if (!existing) {
    return { success: false, changes: [], error: `Special item #${payload.itemId} not found` };
  }

  const updateData: Record<string, any> = { updatedAt: new Date() };
  const oldValues: Record<string, any> = {};
  const newValues: Record<string, any> = {};

  if (payload.oldFixedFee !== payload.newFixedFee) {
    updateData.fixedFee = payload.newFixedFee.toFixed(2);
    oldValues.fixedFee = payload.oldFixedFee;
    newValues.fixedFee = payload.newFixedFee;
  }
  if (payload.newMinModel !== undefined && payload.oldMinModel !== payload.newMinModel) {
    updateData.minModel = payload.newMinModel;
    oldValues.minModel = payload.oldMinModel;
    newValues.minModel = payload.newMinModel;
  }
  if (payload.newMaxModel !== undefined && payload.oldMaxModel !== payload.newMaxModel) {
    updateData.maxModel = payload.newMaxModel;
    oldValues.maxModel = payload.oldMaxModel;
    newValues.maxModel = payload.newMaxModel;
  }

  await db
    .update(specialItemFees)
    .set(updateData)
    .where(eq(specialItemFees.id, payload.itemId));

  return {
    success: true,
    changes: [{
      table: 'special_item_fees',
      action: 'update',
      identifier: payload.itemName,
      oldValues,
      newValues,
    }],
  };
}

// ─── REMOVE SPECIAL ITEM ────────────────────────────────────────

async function executeRemoveSpecialItem(payload: RemoveSpecialItemPayload): Promise<ActionResult> {
  const [existing] = await db
    .select()
    .from(specialItemFees)
    .where(eq(specialItemFees.id, payload.itemId))
    .limit(1);

  if (!existing) {
    return { success: false, changes: [], error: `Special item #${payload.itemId} not found` };
  }

  await db
    .update(specialItemFees)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(specialItemFees.id, payload.itemId));

  return {
    success: true,
    changes: [{
      table: 'special_item_fees',
      action: 'deactivate',
      identifier: `${payload.brand} ${payload.itemName}`,
      oldValues: { isActive: true },
      newValues: { isActive: false },
    }],
  };
}

// ─── NEW WAREHOUSE ──────────────────────────────────────────────

async function executeNewWarehouse(payload: NewWarehousePayload): Promise<ActionResult> {
  const [created] = await db
    .insert(warehouses)
    .values({
      name: payload.name,
      city: payload.city,
      address: payload.address,
      latitude: '0', // Admin should update via direct DB or map tool
      longitude: '0',
      phone: payload.phone || null,
      openingHours: payload.openingHours || null,
    })
    .returning();

  return {
    success: true,
    changes: [{
      table: 'warehouses',
      action: 'insert',
      identifier: payload.name,
      newValues: {
        name: payload.name,
        city: payload.city,
        address: payload.address,
      },
    }],
  };
}

// ─── MODIFY WAREHOUSE ───────────────────────────────────────────

async function executeModifyWarehouse(payload: ModifyWarehousePayload): Promise<ActionResult> {
  console.log('🔧 executeModifyWarehouse called with payload:', JSON.stringify(payload, null, 2));

  const [existing] = await db
    .select()
    .from(warehouses)
    .where(eq(warehouses.id, payload.warehouseId))
    .limit(1);

  if (!existing) {
    console.error(`❌ Warehouse #${payload.warehouseId} not found`);
    return { success: false, changes: [], error: `Warehouse #${payload.warehouseId} not found` };
  }

  console.log('✓ Found existing warehouse:', existing);

  const updateData: Record<string, any> = { updatedAt: new Date() };
  const oldValues: Record<string, any> = {};
  const newValues: Record<string, any> = {};

  // Update name if changed
  if (payload.oldName !== payload.newName) {
    updateData.name = payload.newName;
    oldValues.name = payload.oldName;
    newValues.name = payload.newName;
  }

  // Update city if changed
  if (payload.oldCity !== payload.newCity) {
    updateData.city = payload.newCity;
    oldValues.city = payload.oldCity;
    newValues.city = payload.newCity;
  }

  // Update address if changed
  if (payload.oldAddress !== payload.newAddress) {
    updateData.address = payload.newAddress;
    oldValues.address = payload.oldAddress;
    newValues.address = payload.newAddress;
  }

  // Update phone if changed
  if (payload.oldPhone !== payload.newPhone) {
    updateData.phone = payload.newPhone;
    oldValues.phone = payload.oldPhone;
    newValues.phone = payload.newPhone;
  }

  // Update opening hours if changed
  if (payload.oldOpeningHours !== payload.newOpeningHours) {
    updateData.openingHours = payload.newOpeningHours;
    oldValues.openingHours = payload.oldOpeningHours;
    newValues.openingHours = payload.newOpeningHours;
  }

  // Update latitude if changed AND new value is not null
  // (latitude is NOT NULL in schema, so we never set it to null)
  if (payload.oldLatitude !== payload.newLatitude && payload.newLatitude !== null && payload.newLatitude !== undefined) {
    updateData.latitude = payload.newLatitude;
    oldValues.latitude = payload.oldLatitude;
    newValues.latitude = payload.newLatitude;
  }

  // Update longitude if changed AND new value is not null
  // (longitude is NOT NULL in schema, so we never set it to null)
  if (payload.oldLongitude !== payload.newLongitude && payload.newLongitude !== null && payload.newLongitude !== undefined) {
    updateData.longitude = payload.newLongitude;
    oldValues.longitude = payload.oldLongitude;
    newValues.longitude = payload.newLongitude;
  }

  // Execute the update
  console.log('📝 Updating warehouse with data:', updateData);
  console.log('📊 Changes - Old:', oldValues);
  console.log('📊 Changes - New:', newValues);

  try {
    await db
      .update(warehouses)
      .set(updateData)
      .where(eq(warehouses.id, payload.warehouseId));

    console.log('✅ Warehouse updated successfully');

    return {
      success: true,
      changes: [{
        table: 'warehouses',
        action: 'update',
        identifier: payload.newName,
        oldValues,
        newValues,
      }],
    };
  } catch (error) {
    console.error('❌ Database update failed:', error);
    throw error;
  }
}

// ─── CLOSE WAREHOUSE ────────────────────────────────────────────

async function executeCloseWarehouse(payload: CloseWarehousePayload): Promise<ActionResult> {
  const [existing] = await db
    .select()
    .from(warehouses)
    .where(eq(warehouses.id, payload.warehouseId))
    .limit(1);

  if (!existing) {
    return { success: false, changes: [], error: `Warehouse #${payload.warehouseId} not found` };
  }

  await db
    .update(warehouses)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(warehouses.id, payload.warehouseId));

  return {
    success: true,
    changes: [{
      table: 'warehouses',
      action: 'deactivate',
      identifier: `${payload.name} (${payload.city})`,
      oldValues: { isActive: true },
      newValues: { isActive: false },
    }],
  };
}
