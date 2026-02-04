CREATE TABLE "admin_activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"action" varchar(100) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" integer,
	"details" json,
	"ip_address" varchar(50),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar(50) DEFAULT 'admin' NOT NULL,
	"password" varchar(255),
	"permissions" json,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"target_audience" varchar(50) DEFAULT 'all' NOT NULL,
	"specific_user_ids" json,
	"is_published" boolean DEFAULT false NOT NULL,
	"publish_date" timestamp,
	"expiry_date" timestamp,
	"show_on_homepage" boolean DEFAULT true NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"image_url" varchar(500),
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_proof" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" integer NOT NULL,
	"signature_image_url" varchar(500),
	"photo_url" varchar(500),
	"recipient_name" varchar(255) NOT NULL,
	"delivered_to_alternate" boolean DEFAULT false NOT NULL,
	"alternate_recipient_name" varchar(255),
	"alternate_recipient_relation" varchar(100),
	"notes" text,
	"delivered_by" integer,
	"delivered_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_proof_package_id_unique" UNIQUE("package_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"package_id" integer,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"external_tracking_number" varchar(255) NOT NULL,
	"receipt_location" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"customer_notes" text,
	"estimated_weight" numeric(10, 2),
	"category" varchar(100),
	"sender_info" json NOT NULL,
	"recipient_info" json NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"package_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"tracking_number" varchar(100) NOT NULL,
	"external_tracking_number" varchar(255),
	"user_id" integer NOT NULL,
	"description" text NOT NULL,
	"weight" numeric(10, 2) NOT NULL,
	"weight_unit" varchar(10) DEFAULT 'lbs' NOT NULL,
	"dimensions" json,
	"category" varchar(100),
	"service_fee" numeric(10, 2) DEFAULT '5.00' NOT NULL,
	"weight_cost" numeric(10, 2) NOT NULL,
	"total_cost" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"sender_name" varchar(255) NOT NULL,
	"sender_address" text NOT NULL,
	"sender_city" varchar(100) NOT NULL,
	"sender_country" varchar(100) NOT NULL,
	"sender_phone" varchar(50),
	"recipient_name" varchar(255) NOT NULL,
	"recipient_address" text NOT NULL,
	"recipient_city" varchar(100) NOT NULL,
	"recipient_country" varchar(100) NOT NULL,
	"recipient_phone" varchar(50),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"current_location" varchar(255),
	"estimated_delivery" timestamp,
	"actual_delivery" timestamp,
	"is_fragile" boolean DEFAULT false NOT NULL,
	"requires_signature" boolean DEFAULT false NOT NULL,
	"special_instructions" text,
	"assigned_to_admin" integer,
	"location_details" json,
	"special_item_id" integer,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "packages_tracking_number_unique" UNIQUE("tracking_number")
);
--> statement-breakpoint
CREATE TABLE "revenue_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"transaction_id" varchar(255),
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"recorded_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_fees" (
	"id" serial PRIMARY KEY NOT NULL,
	"fee_type" varchar(50) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"description" text,
	"effective_from" timestamp DEFAULT now() NOT NULL,
	"effective_until" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "special_item_fees" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(50) NOT NULL,
	"brand" varchar(100) NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"min_model" varchar(100),
	"max_model" varchar(100),
	"fixed_fee" numeric(10, 2) NOT NULL,
	"description" text,
	"image_url" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracking_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" integer NOT NULL,
	"status" varchar(50) NOT NULL,
	"location" varchar(255),
	"description" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"phone" varchar(50),
	"preferred_language" varchar(10) DEFAULT 'fr' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "admin_activity_logs" ADD CONSTRAINT "admin_activity_logs_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_proof" ADD CONSTRAINT "delivery_proof_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_proof" ADD CONSTRAINT "delivery_proof_delivered_by_admins_id_fk" FOREIGN KEY ("delivered_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_requests" ADD CONSTRAINT "package_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_requests" ADD CONSTRAINT "package_requests_reviewed_by_admins_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_requests" ADD CONSTRAINT "package_requests_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_assigned_to_admin_admins_id_fk" FOREIGN KEY ("assigned_to_admin") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_special_item_id_special_item_fees_id_fk" FOREIGN KEY ("special_item_id") REFERENCES "public"."special_item_fees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_records" ADD CONSTRAINT "revenue_records_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_records" ADD CONSTRAINT "revenue_records_recorded_by_admins_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_fees" ADD CONSTRAINT "service_fees_created_by_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "special_item_fees" ADD CONSTRAINT "special_item_fees_created_by_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_history" ADD CONSTRAINT "tracking_history_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;