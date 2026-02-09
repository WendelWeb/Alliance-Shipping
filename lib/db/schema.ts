import { pgTable, serial, text, varchar, decimal, timestamp, boolean, integer, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users (synced with Clerk)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  countryCode: varchar('country_code', { length: 10 }).default('+509'), // Haiti by default
  city: varchar('city', { length: 100 }), // User's city (Port-au-Prince, Cap-Haïtien, Port-de-Paix)
  warehouseId: integer('warehouse_id'), // Dépôt de réception choisi par l'utilisateur
  preferredLanguage: varchar('preferred_language', { length: 10 }).default('fr').notNull(),
  expoPushToken: varchar('expo_push_token', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Packages/Parcels
export const packages = pgTable('packages', {
  id: serial('id').primaryKey(),
  trackingNumber: varchar('tracking_number', { length: 100 }).notNull().unique(), // AS-XXXXXXXXXX
  externalTrackingNumber: varchar('external_tracking_number', { length: 255 }), // Tracking du transporteur d'origine (UPS, USPS, FedEx, etc.)
  userId: integer('user_id').references(() => users.id).notNull(),

  // Package Details
  description: text('description').notNull(),
  weight: decimal('weight', { precision: 10, scale: 2 }).notNull(),
  weightUnit: varchar('weight_unit', { length: 10 }).default('lbs').notNull(),
  dimensions: json('dimensions').$type<{ length: number; width: number; height: number }>(),
  category: varchar('category', { length: 100 }),

  // Pricing
  serviceFee: decimal('service_fee', { precision: 10, scale: 2 }).default('5.00').notNull(),
  weightCost: decimal('weight_cost', { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('USD').notNull(),

  // Shipping Details
  senderName: varchar('sender_name', { length: 255 }).notNull(),
  senderAddress: text('sender_address').notNull(),
  senderCity: varchar('sender_city', { length: 100 }).notNull(),
  senderCountry: varchar('sender_country', { length: 100 }).notNull(),
  senderPhone: varchar('sender_phone', { length: 50 }),

  recipientName: varchar('recipient_name', { length: 255 }).notNull(),
  recipientAddress: text('recipient_address').notNull(),
  recipientCity: varchar('recipient_city', { length: 100 }).notNull(),
  recipientCountry: varchar('recipient_country', { length: 100 }).notNull(),
  recipientPhone: varchar('recipient_phone', { length: 50 }),

  // Status & Tracking
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  currentLocation: varchar('current_location', { length: 255 }),
  estimatedDelivery: timestamp('estimated_delivery'),
  actualDelivery: timestamp('actual_delivery'),

  // Special Handling
  isFragile: boolean('is_fragile').default(false).notNull(),
  requiresSignature: boolean('requires_signature').default(false).notNull(),
  specialInstructions: text('special_instructions'),

  // Admin Management
  assignedToAdmin: integer('assigned_to_admin').references(() => admins.id),
  locationDetails: json('location_details').$type<{
    warehouse?: string;
    shelf?: string;
    zone?: string;
    notes?: string;
  }>(),
  specialItemId: integer('special_item_id').references(() => specialItemFees.id),
  priority: varchar('priority', { length: 20 }).default('normal').notNull(), // normal, urgent, express

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Package Tracking History
export const trackingHistory = pgTable('tracking_history', {
  id: serial('id').primaryKey(),
  packageId: integer('package_id').references(() => packages.id).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  location: varchar('location', { length: 255 }),
  description: text('description'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  packageId: integer('package_id').references(() => packages.id),
  type: varchar('type', { length: 50 }).notNull(), // 'package_update', 'delivery', 'payment', etc.
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  packages: many(packages),
  notifications: many(notifications),
}));

export const packagesRelations = relations(packages, ({ one, many }) => ({
  user: one(users, {
    fields: [packages.userId],
    references: [users.id],
  }),
  trackingHistory: many(trackingHistory),
  notifications: many(notifications),
}));

export const trackingHistoryRelations = relations(trackingHistory, ({ one }) => ({
  package: one(packages, {
    fields: [trackingHistory.packageId],
    references: [packages.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  package: one(packages, {
    fields: [notifications.packageId],
    references: [packages.id],
  }),
}));

// ==================== ADMIN SYSTEM TABLES ====================

// Admins
export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  role: varchar('role', { length: 50 }).default('admin').notNull(), // super_admin, admin, moderator
  password: varchar('password', { length: 255 }), // Hashed password (nullable for migration)
  permissions: json('permissions').$type<{
    users?: { read?: boolean; create?: boolean; update?: boolean; delete?: boolean; block?: boolean };
    packages?: { read?: boolean; create?: boolean; update?: boolean; delete?: boolean; assign?: boolean };
    fees?: { read?: boolean; update?: boolean };
    specialItems?: { read?: boolean; create?: boolean; update?: boolean; delete?: boolean };
    announcements?: { read?: boolean; create?: boolean; update?: boolean; delete?: boolean; publish?: boolean };
    analytics?: { read?: boolean; export?: boolean };
  }>(),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Package Requests (demandes avant reception)
export const packageRequests = pgTable('package_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  externalTrackingNumber: varchar('external_tracking_number', { length: 255 }).notNull(), // Tracking du transporteur d'origine (TRÈS IMPORTANT)
  receiptLocation: varchar('receipt_location', { length: 255 }).notNull(), // Lieu de réception du colis (TRÈS IMPORTANT) - Ex: "Miami Warehouse", "Our USA Address"
  description: text('description').notNull(),
  customerNotes: text('customer_notes'), // Message explicant tout ce qu'il y a à savoir (FACULTATIF)
  estimatedWeight: decimal('estimated_weight', { precision: 10, scale: 2 }),
  category: varchar('category', { length: 100 }),

  // Sender Info
  senderInfo: json('sender_info').$type<{
    name: string;
    address: string;
    city: string;
    country: string;
    phone?: string;
  }>().notNull(),

  // Recipient Info
  recipientInfo: json('recipient_info').$type<{
    name: string;
    address: string;
    city: string;
    country: string;
    phone?: string;
  }>().notNull(),

  // Status
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, approved, rejected, converted
  adminNotes: text('admin_notes'),
  reviewedBy: integer('reviewed_by').references(() => admins.id),
  reviewedAt: timestamp('reviewed_at'),

  // Si approuvé, lien vers le package créé
  packageId: integer('package_id').references(() => packages.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// DEPRECATED: Service Fees Configuration - Use cityPricing instead (per-city fees)
export const serviceFees = pgTable('service_fees', {
  id: serial('id').primaryKey(),
  feeType: varchar('fee_type', { length: 50 }).notNull(), // service_fee, per_pound, etc.
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('USD').notNull(),
  description: text('description'),
  effectiveFrom: timestamp('effective_from').defaultNow().notNull(),
  effectiveUntil: timestamp('effective_until'),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: integer('created_by').references(() => admins.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Special Item Fees (iPhone, Samsung, Starlink, etc.)
export const specialItemFees = pgTable('special_item_fees', {
  id: serial('id').primaryKey(),
  category: varchar('category', { length: 50 }).notNull(), // phone, tablet, electronics, satellite, other
  brand: varchar('brand', { length: 100 }).notNull(), // Apple, Samsung, SpaceX
  itemName: varchar('item_name', { length: 255 }).notNull(), // Ex: "iPhone Series"
  minModel: varchar('min_model', { length: 100 }), // Ex: "7"
  maxModel: varchar('max_model', { length: 100 }), // Ex: "17"
  fixedFee: decimal('fixed_fee', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: integer('created_by').references(() => admins.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Announcements/News
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // news, alert, promo, maintenance
  targetAudience: varchar('target_audience', { length: 50 }).default('all').notNull(), // all, users, specific
  specificUserIds: json('specific_user_ids').$type<number[]>(),

  // Action template system
  templateId: varchar('template_id', { length: 100 }), // e.g. city_fee_change, loyalty_rate_change, new_special_item
  actionPayload: json('action_payload').$type<Record<string, any>>(), // Template-specific data (old/new values, cities, items, etc.)
  actionExecutedAt: timestamp('action_executed_at'), // When the DB action was executed

  // Scheduling
  scheduledFor: timestamp('scheduled_for'), // If set, action executes at this time instead of immediately
  scheduledStatus: varchar('scheduled_status', { length: 20 }), // pending, executed, failed, cancelled

  // Publishing
  isPublished: boolean('is_published').default(false).notNull(),
  publishDate: timestamp('publish_date'),
  expiryDate: timestamp('expiry_date'),

  // Display options
  showOnHomepage: boolean('show_on_homepage').default(true).notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  imageUrl: varchar('image_url', { length: 500 }),

  // Multilingual translations { ht: {title, content}, fr: {title, content}, en: {title, content}, es: {title, content} }
  translations: json('translations').$type<Record<string, { title: string; content: string }>>(),

  // Email broadcast tracking
  emailSentAt: timestamp('email_sent_at'),
  emailSentCount: integer('email_sent_count').default(0),

  // Metadata
  createdBy: integer('created_by').references(() => admins.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Delivery Proof
export const deliveryProof = pgTable('delivery_proof', {
  id: serial('id').primaryKey(),
  packageId: integer('package_id').references(() => packages.id).notNull().unique(),
  signatureImageUrl: varchar('signature_image_url', { length: 500 }),
  photoUrl: varchar('photo_url', { length: 500 }),
  recipientName: varchar('recipient_name', { length: 255 }).notNull(),
  deliveredToAlternate: boolean('delivered_to_alternate').default(false).notNull(),
  alternateRecipientName: varchar('alternate_recipient_name', { length: 255 }),
  alternateRecipientRelation: varchar('alternate_recipient_relation', { length: 100 }),
  notes: text('notes'),
  deliveredBy: integer('delivered_by').references(() => admins.id),
  deliveredAt: timestamp('delivered_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Revenue Records
export const revenueRecords = pgTable('revenue_records', {
  id: serial('id').primaryKey(),
  packageId: integer('package_id').references(() => packages.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(), // cash, card, mobile, bank_transfer
  transactionId: varchar('transaction_id', { length: 255 }),
  paymentDate: timestamp('payment_date').defaultNow().notNull(),
  notes: text('notes'),
  recordedBy: integer('recorded_by').references(() => admins.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// City Pricing - Different fees per city
export const cityPricing = pgTable('city_pricing', {
  id: serial('id').primaryKey(),
  city: varchar('city', { length: 100 }).notNull().unique(), // Port-au-Prince, Cap-Haïtien, Port-de-Paix
  serviceFee: decimal('service_fee', { precision: 10, scale: 2 }).notNull().default('5.00'),
  pricePerLb: decimal('price_per_lb', { precision: 10, scale: 2 }).notNull().default('4.00'),
  deliveryDaysMin: integer('delivery_days_min').default(3).notNull(),
  deliveryDaysMax: integer('delivery_days_max').default(6).notNull(),
  perfumeDaysMin: integer('perfume_days_min').default(8).notNull(),
  perfumeDaysMax: integer('perfume_days_max').default(11).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Warehouses / Dépôts de livraison
export const warehouses = pgTable('warehouses', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(), // Nom du dépôt
  city: varchar('city', { length: 100 }).notNull(), // Ville (Port-au-Prince, Cap-Haïtien, etc.)
  address: text('address').notNull(), // Adresse complète
  latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(), // 19.708485
  longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(), // -72.261024
  phone: varchar('phone', { length: 50 }), // Numéro de téléphone du dépôt
  email: varchar('email', { length: 255 }), // Email du dépôt
  openingHours: text('opening_hours'), // Horaires d'ouverture
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Admin Activity Logs
export const adminActivityLogs = pgTable('admin_activity_logs', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id').references(() => admins.id).notNull(),
  action: varchar('action', { length: 100 }).notNull(), // created, updated, deleted, published, etc.
  targetType: varchar('target_type', { length: 50 }).notNull(), // user, package, announcement, fee, etc.
  targetId: integer('target_id'),
  details: json('details').$type<Record<string, any>>(),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Admin Relations
export const adminsRelations = relations(admins, ({ one, many }) => ({
  user: one(users, {
    fields: [admins.userId],
    references: [users.id],
  }),
  createdServiceFees: many(serviceFees),
  createdSpecialItems: many(specialItemFees),
  createdAnnouncements: many(announcements),
  activityLogs: many(adminActivityLogs),
}));

export const packageRequestsRelations = relations(packageRequests, ({ one }) => ({
  user: one(users, {
    fields: [packageRequests.userId],
    references: [users.id],
  }),
  reviewer: one(admins, {
    fields: [packageRequests.reviewedBy],
    references: [admins.id],
  }),
  package: one(packages, {
    fields: [packageRequests.packageId],
    references: [packages.id],
  }),
}));

export const serviceFeesRelations = relations(serviceFees, ({ one }) => ({
  createdBy: one(admins, {
    fields: [serviceFees.createdBy],
    references: [admins.id],
  }),
}));

export const specialItemFeesRelations = relations(specialItemFees, ({ one }) => ({
  createdBy: one(admins, {
    fields: [specialItemFees.createdBy],
    references: [admins.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  createdBy: one(admins, {
    fields: [announcements.createdBy],
    references: [admins.id],
  }),
}));

export const deliveryProofRelations = relations(deliveryProof, ({ one }) => ({
  package: one(packages, {
    fields: [deliveryProof.packageId],
    references: [packages.id],
  }),
  deliveredBy: one(admins, {
    fields: [deliveryProof.deliveredBy],
    references: [admins.id],
  }),
}));

export const revenueRecordsRelations = relations(revenueRecords, ({ one }) => ({
  package: one(packages, {
    fields: [revenueRecords.packageId],
    references: [packages.id],
  }),
  recordedBy: one(admins, {
    fields: [revenueRecords.recordedBy],
    references: [admins.id],
  }),
}));

export const adminActivityLogsRelations = relations(adminActivityLogs, ({ one }) => ({
  admin: one(admins, {
    fields: [adminActivityLogs.adminId],
    references: [admins.id],
  }),
}));

// ==================== REFERRAL & LOYALTY SYSTEM ====================

// Loyalty Configuration (admin-configurable rates)
export const loyaltyConfig = pgTable('loyalty_config', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  updatedBy: integer('updated_by').references(() => admins.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// DEPRECATED: Referral Codes - Referral system being removed
export const referralCodes = pgTable('referral_codes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// DEPRECATED: Referrals - Referral system being removed
export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  referrerId: integer('referrer_id').references(() => users.id).notNull(),
  referredId: integer('referred_id').references(() => users.id).notNull().unique(),
  referralCode: varchar('referral_code', { length: 20 }).notNull(),
  creditAwarded: boolean('credit_awarded').default(false).notNull(),
  creditAmount: decimal('credit_amount', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Loyalty Credits (transaction ledger)
export const loyaltyCredits = pgTable('loyalty_credits', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(), // positive = earn, negative = redeem (in dollars)
  points: integer('points').default(0).notNull(), // points earned/spent
  type: varchar('type', { length: 50 }).notNull(), // referral, shipment, weight, redemption, admin_adjustment, spending
  description: text('description'),
  referenceId: integer('reference_id'), // packageId or referralId
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Loyalty Relations
export const referralCodesRelations = relations(referralCodes, ({ one }) => ({
  user: one(users, { fields: [referralCodes.userId], references: [users.id] }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, { fields: [referrals.referrerId], references: [users.id] }),
  referred: one(users, { fields: [referrals.referredId], references: [users.id] }),
}));

export const loyaltyCreditsRelations = relations(loyaltyCredits, ({ one }) => ({
  user: one(users, { fields: [loyaltyCredits.userId], references: [users.id] }),
}));

// Types - Users & Packages
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Package = typeof packages.$inferSelect;
export type NewPackage = typeof packages.$inferInsert;

export type TrackingHistory = typeof trackingHistory.$inferSelect;
export type NewTrackingHistory = typeof trackingHistory.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// Types - Admin System
export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;

export type PackageRequest = typeof packageRequests.$inferSelect;
export type NewPackageRequest = typeof packageRequests.$inferInsert;

export type ServiceFee = typeof serviceFees.$inferSelect;
export type NewServiceFee = typeof serviceFees.$inferInsert;

export type SpecialItemFee = typeof specialItemFees.$inferSelect;
export type NewSpecialItemFee = typeof specialItemFees.$inferInsert;

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;

export type DeliveryProof = typeof deliveryProof.$inferSelect;
export type NewDeliveryProof = typeof deliveryProof.$inferInsert;

export type RevenueRecord = typeof revenueRecords.$inferSelect;
export type NewRevenueRecord = typeof revenueRecords.$inferInsert;

export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type NewAdminActivityLog = typeof adminActivityLogs.$inferInsert;

// Types - Referral & Loyalty
export type LoyaltyConfig = typeof loyaltyConfig.$inferSelect;
export type ReferralCode = typeof referralCodes.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type LoyaltyCredit = typeof loyaltyCredits.$inferSelect;
