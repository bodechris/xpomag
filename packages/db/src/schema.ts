import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import type { ComposerDocument, DesignElementNode } from "@xpomag/magazine";

export const accessEnum = pgEnum("page_access", ["public", "member"]);
export const publicationStatusEnum = pgEnum("publication_status", ["draft", "review", "scheduled", "published", "archived"]);

export const cities = pgTable("cities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  countryCode: text("country_code").notNull(),
  slug: text("slug").notNull().unique(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  isLaunchCity: boolean("is_launch_city").default(false).notNull()
});

export const issues = pgTable("issues", {
  id: uuid("id").defaultRandom().primaryKey(),
  cityId: uuid("city_id").references(() => cities.id).notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  status: publicationStatusEnum("status").default("draft").notNull(),
  globalConfig: jsonb("global_config"),
  publishedAt: timestamp("published_at", { withTimezone: true })
});

export const magazinePages = pgTable("magazine_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  issueId: uuid("issue_id").references(() => issues.id).notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  pageNumber: integer("page_number").notNull(),
  access: accessEnum("access").default("member").notNull(),
  kind: text("kind").default("article").notNull(),
  layoutId: text("layout_id").default("utility-full").notNull(),
  resourceManifest: jsonb("resource_manifest"),
  pageStyles: jsonb("page_styles"),
  backgroundDesign: jsonb("background_design").$type<DesignElementNode>().notNull(),
  designTree: jsonb("design_tree").$type<DesignElementNode>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const reactionTypeEnum = pgEnum("reaction_type", ["like", "love", "insightful", "celebrate"]);

export const magazineSections = pgTable("magazine_sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  pageId: uuid("page_id").references(() => magazinePages.id).notNull(),
  slug: text("slug").notNull(),
  title: text("title"),
  kind: text("kind"),
  slot: text("slot").notNull(),
  order: integer("order").notNull(),
  resourceManifest: jsonb("resource_manifest"),
  designElements: jsonb("design_elements").$type<DesignElementNode[]>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const sectionReactions = pgTable("section_reactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sectionId: uuid("section_id").references(() => magazineSections.id).notNull(),
  userId: uuid("user_id").notNull(),
  reaction: reactionTypeEnum("reaction").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const sectionComments = pgTable("section_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  sectionId: uuid("section_id").references(() => magazineSections.id).notNull(),
  userId: uuid("user_id").notNull(),
  parentId: uuid("parent_id"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const collections = pgTable("collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const collectionSections = pgTable("collection_sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  collectionId: uuid("collection_id").references(() => collections.id).notNull(),
  sectionId: uuid("section_id").references(() => magazineSections.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});


export const pageCompositions = pgTable("page_compositions", {
  id: uuid("id").defaultRandom().primaryKey(),
  issueSlug: text("issue_slug").notNull(),
  pageSlug: text("page_slug").notNull(),
  draftDocument: jsonb("draft_document").$type<ComposerDocument>(),
  publishedDocument: jsonb("published_document").$type<ComposerDocument>(),
  draftUpdatedAt: timestamp("draft_updated_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  issuePageUnique: uniqueIndex("page_compositions_issue_page_unique").on(table.issueSlug, table.pageSlug),
}));


export const pageCompositionRevisions = pgTable("page_composition_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  issueSlug: text("issue_slug").notNull(),
  pageSlug: text("page_slug").notNull(),
  state: text("state").notNull(),
  label: text("label").notNull(),
  document: jsonb("document").$type<ComposerDocument>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Section engagement is keyed by published magazine identity rather than by the
// current relational magazine_sections table because demo/composer sections use
// stable string IDs before publication rows exist. This keeps engagement durable
// across the editor -> publish pipeline and can be backfilled to relational IDs.
export const sectionEngagementReactions = pgTable("section_engagement_reactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  issueSlug: text("issue_slug").notNull(),
  pageSlug: text("page_slug").notNull(),
  sectionId: text("section_id").notNull(),
  userId: text("user_id").notNull(),
  reaction: text("reaction").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userTargetUnique: uniqueIndex("section_engagement_reactions_user_target_unique").on(table.issueSlug, table.pageSlug, table.sectionId, table.userId),
}));

export const sectionEngagementComments = pgTable("section_engagement_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  issueSlug: text("issue_slug").notNull(),
  pageSlug: text("page_slug").notNull(),
  sectionId: text("section_id").notNull(),
  userId: text("user_id").notNull(),
  parentId: uuid("parent_id"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sectionEngagementShares = pgTable("section_engagement_shares", {
  id: uuid("id").defaultRandom().primaryKey(),
  issueSlug: text("issue_slug").notNull(),
  pageSlug: text("page_slug").notNull(),
  sectionId: text("section_id").notNull(),
  userId: text("user_id").notNull(),
  channel: text("channel").default("copy").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sectionEngagementSaves = pgTable("section_engagement_saves", {
  id: uuid("id").defaultRandom().primaryKey(),
  issueSlug: text("issue_slug").notNull(),
  pageSlug: text("page_slug").notNull(),
  sectionId: text("section_id").notNull(),
  userId: text("user_id").notNull(),
  collectionName: text("collection_name").default("Saved").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userTargetUnique: uniqueIndex("section_engagement_saves_user_target_unique").on(table.issueSlug, table.pageSlug, table.sectionId, table.userId),
}));
