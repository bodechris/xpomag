"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountRelations = exports.sessionRelations = exports.userRelations = exports.userCategoryInterests = exports.userCityInterests = exports.categories = exports.cities = exports.userProfiles = exports.verification = exports.account = exports.session = exports.user = void 0;
var drizzle_orm_1 = require("drizzle-orm");
var pg_core_1 = require("drizzle-orm/pg-core");
exports.user = (0, pg_core_1.pgTable)("user", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    emailVerified: (0, pg_core_1.boolean)("email_verified").default(false).notNull(),
    image: (0, pg_core_1.text)("image"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.session = (0, pg_core_1.pgTable)("session", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    token: (0, pg_core_1.text)("token").notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
    ipAddress: (0, pg_core_1.text)("ip_address"),
    userAgent: (0, pg_core_1.text)("user_agent"),
    userId: (0, pg_core_1.text)("user_id")
        .notNull()
        .references(function () { return exports.user.id; }, { onDelete: "cascade" }),
}, function (table) { return [(0, pg_core_1.index)("session_userId_idx").on(table.userId)]; });
exports.account = (0, pg_core_1.pgTable)("account", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    accountId: (0, pg_core_1.text)("account_id").notNull(),
    providerId: (0, pg_core_1.text)("provider_id").notNull(),
    userId: (0, pg_core_1.text)("user_id")
        .notNull()
        .references(function () { return exports.user.id; }, { onDelete: "cascade" }),
    accessToken: (0, pg_core_1.text)("access_token"),
    refreshToken: (0, pg_core_1.text)("refresh_token"),
    idToken: (0, pg_core_1.text)("id_token"),
    accessTokenExpiresAt: (0, pg_core_1.timestamp)("access_token_expires_at"),
    refreshTokenExpiresAt: (0, pg_core_1.timestamp)("refresh_token_expires_at"),
    scope: (0, pg_core_1.text)("scope"),
    password: (0, pg_core_1.text)("password"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, function (table) { return [(0, pg_core_1.index)("account_userId_idx").on(table.userId)]; });
exports.verification = (0, pg_core_1.pgTable)("verification", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    identifier: (0, pg_core_1.text)("identifier").notNull(),
    value: (0, pg_core_1.text)("value").notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, function (table) { return [(0, pg_core_1.index)("verification_identifier_idx").on(table.identifier)]; });
exports.userProfiles = (0, pg_core_1.pgTable)("user_profiles", {
    userId: (0, pg_core_1.text)("user_id")
        .primaryKey()
        .references(function () { return exports.user.id; }, { onDelete: "cascade" }),
    emailVerifiedAt: (0, pg_core_1.timestamp)("email_verified_at", { withTimezone: true }),
    onboardingCompletedAt: (0, pg_core_1.timestamp)("onboarding_completed_at", {
        withTimezone: true,
    }),
    detectedCity: (0, pg_core_1.text)("detected_city"),
    detectedRegion: (0, pg_core_1.text)("detected_region"),
    detectedCountryCode: (0, pg_core_1.text)("detected_country_code"),
    locationSource: (0, pg_core_1.text)("location_source"),
});
exports.cities = (0, pg_core_1.pgTable)("cities", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    region: (0, pg_core_1.text)("region"),
    countryCode: (0, pg_core_1.text)("country_code"),
    slug: (0, pg_core_1.text)("slug").notNull(),
    active: (0, pg_core_1.boolean)("active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
}, function (table) { return ({
    slugUnique: (0, pg_core_1.uniqueIndex)("cities_slug_idx").on(table.slug),
}); });
exports.categories = (0, pg_core_1.pgTable)("categories", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    slug: (0, pg_core_1.text)("slug").notNull(),
    description: (0, pg_core_1.text)("description"),
    active: (0, pg_core_1.boolean)("active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
}, function (table) { return ({
    slugUnique: (0, pg_core_1.uniqueIndex)("categories_slug_idx").on(table.slug),
}); });
exports.userCityInterests = (0, pg_core_1.pgTable)("user_city_interests", {
    userId: (0, pg_core_1.text)("user_id")
        .notNull()
        .references(function () { return exports.user.id; }, { onDelete: "cascade" }),
    cityId: (0, pg_core_1.uuid)("city_id")
        .notNull()
        .references(function () { return exports.cities.id; }, { onDelete: "cascade" }),
    source: (0, pg_core_1.text)("source").notNull().default("selected"),
    isPrimary: (0, pg_core_1.boolean)("is_primary").notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
}, function (table) { return ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.cityId] }),
}); });
exports.userCategoryInterests = (0, pg_core_1.pgTable)("user_category_interests", {
    userId: (0, pg_core_1.text)("user_id")
        .notNull()
        .references(function () { return exports.user.id; }, { onDelete: "cascade" }),
    categoryId: (0, pg_core_1.uuid)("category_id")
        .notNull()
        .references(function () { return exports.categories.id; }, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
}, function (table) { return ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.categoryId] }),
}); });
exports.userRelations = (0, drizzle_orm_1.relations)(exports.user, function (_a) {
    var many = _a.many;
    return ({
        sessions: many(exports.session),
        accounts: many(exports.account),
    });
});
exports.sessionRelations = (0, drizzle_orm_1.relations)(exports.session, function (_a) {
    var one = _a.one;
    return ({
        user: one(exports.user, {
            fields: [exports.session.userId],
            references: [exports.user.id],
        }),
    });
});
exports.accountRelations = (0, drizzle_orm_1.relations)(exports.account, function (_a) {
    var one = _a.one;
    return ({
        user: one(exports.user, {
            fields: [exports.account.userId],
            references: [exports.user.id],
        }),
    });
});
