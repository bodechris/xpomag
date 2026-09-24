CREATE TYPE "public"."page_access" AS ENUM('public', 'member');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('draft', 'review', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."reaction_type" AS ENUM('like', 'love', 'insightful', 'celebrate');--> statement-breakpoint
CREATE TABLE "cities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"country_code" text NOT NULL,
	"slug" text NOT NULL,
	"latitude" text,
	"longitude" text,
	"is_launch_city" boolean DEFAULT false NOT NULL,
	CONSTRAINT "cities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "collection_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"global_config" jsonb,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "magazine_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"page_number" integer NOT NULL,
	"access" "page_access" DEFAULT 'member' NOT NULL,
	"kind" text DEFAULT 'article' NOT NULL,
	"layout_id" text DEFAULT 'utility-full' NOT NULL,
	"resource_manifest" jsonb,
	"page_styles" jsonb,
	"background_design" jsonb NOT NULL,
	"design_tree" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magazine_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text,
	"kind" text,
	"slot" text NOT NULL,
	"order" integer NOT NULL,
	"resource_manifest" jsonb,
	"design_elements" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_composition_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_slug" text NOT NULL,
	"page_slug" text NOT NULL,
	"state" text NOT NULL,
	"label" text NOT NULL,
	"document" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_compositions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_slug" text NOT NULL,
	"page_slug" text NOT NULL,
	"draft_document" jsonb,
	"published_document" jsonb,
	"draft_updated_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "section_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"parent_id" uuid,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "section_engagement_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_slug" text NOT NULL,
	"page_slug" text NOT NULL,
	"section_id" text NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" uuid,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "section_engagement_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_slug" text NOT NULL,
	"page_slug" text NOT NULL,
	"section_id" text NOT NULL,
	"user_id" text NOT NULL,
	"reaction" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "section_engagement_saves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_slug" text NOT NULL,
	"page_slug" text NOT NULL,
	"section_id" text NOT NULL,
	"user_id" text NOT NULL,
	"collection_name" text DEFAULT 'Saved' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "section_engagement_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_slug" text NOT NULL,
	"page_slug" text NOT NULL,
	"section_id" text NOT NULL,
	"user_id" text NOT NULL,
	"channel" text DEFAULT 'copy' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "section_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"reaction" "reaction_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collection_sections" ADD CONSTRAINT "collection_sections_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_sections" ADD CONSTRAINT "collection_sections_section_id_magazine_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."magazine_sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magazine_pages" ADD CONSTRAINT "magazine_pages_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magazine_sections" ADD CONSTRAINT "magazine_sections_page_id_magazine_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."magazine_pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_comments" ADD CONSTRAINT "section_comments_section_id_magazine_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."magazine_sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_reactions" ADD CONSTRAINT "section_reactions_section_id_magazine_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."magazine_sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "page_compositions_issue_page_unique" ON "page_compositions" USING btree ("issue_slug","page_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "section_engagement_reactions_user_target_unique" ON "section_engagement_reactions" USING btree ("issue_slug","page_slug","section_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "section_engagement_saves_user_target_unique" ON "section_engagement_saves" USING btree ("issue_slug","page_slug","section_id","user_id");