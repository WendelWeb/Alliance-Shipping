CREATE TABLE "city_pricing" (
	"id" serial PRIMARY KEY NOT NULL,
	"city" varchar(100) NOT NULL,
	"service_fee" numeric(10, 2) DEFAULT '5.00' NOT NULL,
	"price_per_lb" numeric(10, 2) DEFAULT '4.00' NOT NULL,
	"delivery_days_min" integer DEFAULT 3 NOT NULL,
	"delivery_days_max" integer DEFAULT 6 NOT NULL,
	"perfume_days_min" integer DEFAULT 8 NOT NULL,
	"perfume_days_max" integer DEFAULT 11 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "city_pricing_city_unique" UNIQUE("city")
);
--> statement-breakpoint
CREATE TABLE "loyalty_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"description" text,
	"updated_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "loyalty_credits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text,
	"reference_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_codes_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "referral_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_id" integer NOT NULL,
	"referred_id" integer NOT NULL,
	"referral_code" varchar(20) NOT NULL,
	"credit_awarded" boolean DEFAULT false NOT NULL,
	"credit_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referrals_referred_id_unique" UNIQUE("referred_id")
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"address" text NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"phone" varchar(50),
	"email" varchar(255),
	"opening_hours" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "template_id" varchar(100);--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "action_payload" json;--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "action_executed_at" timestamp;--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "scheduled_for" timestamp;--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "scheduled_status" varchar(20);--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "translations" json;--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "email_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "email_sent_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country_code" varchar(10) DEFAULT '+509';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "warehouse_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "expo_push_token" varchar(255);--> statement-breakpoint
ALTER TABLE "loyalty_config" ADD CONSTRAINT "loyalty_config_updated_by_admins_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_credits" ADD CONSTRAINT "loyalty_credits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_users_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;