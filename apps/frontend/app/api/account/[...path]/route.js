"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamic = exports.runtime = void 0;
exports.GET = GET;
exports.POST = POST;
var drizzle_orm_1 = require("drizzle-orm");
var auth_server_1 = require("../../../../lib/auth-server");
var auth_schema_1 = require("../../../../lib/auth-schema");
exports.runtime = "nodejs";
exports.dynamic = "force-dynamic";
var defaultCategories = [
    ["Business & Entrepreneurship", "business-entrepreneurship"],
    ["Technology & AI", "technology-ai"],
    ["Design & Creativity", "design-creativity"],
    ["Food & Dining", "food-dining"],
    ["Property & Real Estate", "property-real-estate"],
    ["Health & Wellness", "health-wellness"],
    ["Fashion & Beauty", "fashion-beauty"],
    ["Culture & Entertainment", "culture-entertainment"],
    ["Travel & Hospitality", "travel-hospitality"],
    ["Finance & Investing", "finance-investing"],
    ["Careers & Work", "careers-work"],
    ["Community & Events", "community-events"],
];
function json(data, status) {
    if (status === void 0) { status = 200; }
    return Response.json(data, { status: status });
}
function slugify(value) {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}
function decode(value) {
    if (!value)
        return null;
    try {
        return decodeURIComponent(value);
    }
    catch (_a) {
        return value;
    }
}
function detectLocation(request) {
    var _a, _b, _c, _d, _e, _f, _g;
    var city = (_b = (_a = decode(request.headers.get("x-vercel-ip-city"))) !== null && _a !== void 0 ? _a : decode(request.headers.get("cf-ipcity"))) !== null && _b !== void 0 ? _b : decode(request.headers.get("x-geo-city"));
    var region = (_d = (_c = decode(request.headers.get("x-vercel-ip-country-region"))) !== null && _c !== void 0 ? _c : decode(request.headers.get("cf-region"))) !== null && _d !== void 0 ? _d : decode(request.headers.get("x-geo-region"));
    var countryCode = (_f = (_e = request.headers.get("x-vercel-ip-country")) !== null && _e !== void 0 ? _e : request.headers.get("cf-ipcountry")) !== null && _f !== void 0 ? _f : request.headers.get("x-geo-country");
    return {
        city: city,
        region: region,
        countryCode: (_g = countryCode === null || countryCode === void 0 ? void 0 : countryCode.toUpperCase()) !== null && _g !== void 0 ? _g : null,
        source: request.headers.get("x-vercel-ip-country")
            ? "vercel"
            : request.headers.get("cf-ipcountry")
                ? "cloudflare"
                : city || region || countryCode
                    ? "proxy"
                    : null,
    };
}
function getSession(request) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, auth_server_1.auth.api.getSession({
                    headers: request.headers,
                })];
        });
    });
}
function ensureCategories() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, auth_server_1.authDb
                        .insert(auth_schema_1.categories)
                        .values(defaultCategories.map(function (_a) {
                        var name = _a[0], slug = _a[1];
                        return ({ name: name, slug: slug });
                    }))
                        .onConflictDoNothing()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function ensureProfile(userId, request) {
    return __awaiter(this, void 0, void 0, function () {
        var existing, location, created;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, auth_server_1.authDb
                        .select()
                        .from(auth_schema_1.userProfiles)
                        .where((0, drizzle_orm_1.eq)(auth_schema_1.userProfiles.userId, userId))
                        .limit(1)];
                case 1:
                    existing = (_a.sent())[0];
                    if (existing)
                        return [2 /*return*/, existing];
                    location = detectLocation(request);
                    return [4 /*yield*/, auth_server_1.authDb
                            .insert(auth_schema_1.userProfiles)
                            .values({
                            userId: userId,
                            detectedCity: location.city,
                            detectedRegion: location.region,
                            detectedCountryCode: location.countryCode,
                            locationSource: location.source,
                        })
                            .returning()];
                case 2:
                    created = (_a.sent())[0];
                    return [2 /*return*/, created];
            }
        });
    });
}
function endpoint(request) {
    return request.nextUrl.pathname
        .replace(/^\/api\/account\/?/, "")
        .replace(/\/+$/, "");
}
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var session, profile, availableCategories, selectedCities, selectedCategories, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, (0, auth_server_1.ensureAuthInfrastructure)()];
                case 1:
                    _a.sent();
                    if (!(endpoint(request) === "health")) return [3 /*break*/, 3];
                    return [4 /*yield*/, auth_server_1.authDb.execute((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["select 1"], ["select 1"]))))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, json({ ok: true, service: "xpomag-auth", origin: request.nextUrl.origin })];
                case 3: return [4 /*yield*/, getSession(request)];
                case 4:
                    session = _a.sent();
                    if (!(session === null || session === void 0 ? void 0 : session.user)) {
                        return [2 /*return*/, json({
                                error: "UNAUTHENTICATED",
                                message: "No authenticated XPOMAG session was found.",
                            }, 401)];
                    }
                    return [4 /*yield*/, ensureProfile(session.user.id, request)];
                case 5:
                    profile = _a.sent();
                    if (endpoint(request) === "status") {
                        return [2 /*return*/, json({
                                user: session.user,
                                verified: Boolean(profile.emailVerifiedAt),
                                onboardingCompleted: Boolean(profile.onboardingCompletedAt),
                            })];
                    }
                    if (!(endpoint(request) === "onboarding")) return [3 /*break*/, 10];
                    if (!profile.emailVerifiedAt) {
                        return [2 /*return*/, json({
                                error: "EMAIL_VERIFICATION_REQUIRED",
                                message: "Verify your email before onboarding.",
                            }, 403)];
                    }
                    return [4 /*yield*/, ensureCategories()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, auth_server_1.authDb
                            .select({
                            id: auth_schema_1.categories.id,
                            name: auth_schema_1.categories.name,
                            slug: auth_schema_1.categories.slug,
                        })
                            .from(auth_schema_1.categories)
                            .where((0, drizzle_orm_1.eq)(auth_schema_1.categories.active, true))
                            .orderBy((0, drizzle_orm_1.asc)(auth_schema_1.categories.name))];
                case 7:
                    availableCategories = _a.sent();
                    return [4 /*yield*/, auth_server_1.authDb
                            .select({
                            id: auth_schema_1.cities.id,
                            name: auth_schema_1.cities.name,
                            region: auth_schema_1.cities.region,
                            countryCode: auth_schema_1.cities.countryCode,
                            isPrimary: auth_schema_1.userCityInterests.isPrimary,
                        })
                            .from(auth_schema_1.userCityInterests)
                            .innerJoin(auth_schema_1.cities, (0, drizzle_orm_1.eq)(auth_schema_1.userCityInterests.cityId, auth_schema_1.cities.id))
                            .where((0, drizzle_orm_1.eq)(auth_schema_1.userCityInterests.userId, session.user.id))];
                case 8:
                    selectedCities = _a.sent();
                    return [4 /*yield*/, auth_server_1.authDb
                            .select({ id: auth_schema_1.userCategoryInterests.categoryId })
                            .from(auth_schema_1.userCategoryInterests)
                            .where((0, drizzle_orm_1.eq)(auth_schema_1.userCategoryInterests.userId, session.user.id))];
                case 9:
                    selectedCategories = _a.sent();
                    return [2 /*return*/, json({
                            detectedLocation: {
                                city: profile.detectedCity,
                                region: profile.detectedRegion,
                                countryCode: profile.detectedCountryCode,
                                source: profile.locationSource,
                            },
                            selectedCities: selectedCities,
                            selectedCategoryIds: selectedCategories.map(function (item) { return item.id; }),
                            categories: availableCategories,
                        })];
                case 10: return [2 /*return*/, json({ error: "NOT_FOUND", message: "Unknown account endpoint." }, 404)];
                case 11:
                    error_1 = _a.sent();
                    console.error("[XPOMAG account] GET failed", error_1);
                    return [2 /*return*/, json({
                            error: "ACCOUNT_API_FAILED",
                            message: error_1 instanceof Error
                                ? error_1.message
                                : "The account service could not complete the request.",
                        }, 500)];
                case 12: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var session_1, path, profile, body, otp, profile, body, cityInputs, categoryIds, normalizedCities_1, validCategories_1, error_2;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 16, , 17]);
                    return [4 /*yield*/, (0, auth_server_1.ensureAuthInfrastructure)()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, getSession(request)];
                case 2:
                    session_1 = _b.sent();
                    if (!(session_1 === null || session_1 === void 0 ? void 0 : session_1.user)) {
                        return [2 /*return*/, json({
                                error: "UNAUTHENTICATED",
                                message: "Sign in before continuing.",
                            }, 401)];
                    }
                    path = endpoint(request);
                    if (!(path === "send-verification-code")) return [3 /*break*/, 5];
                    return [4 /*yield*/, ensureProfile(session_1.user.id, request)];
                case 3:
                    profile = _b.sent();
                    if (profile.emailVerifiedAt) {
                        return [2 /*return*/, json({ ok: true, alreadyVerified: true })];
                    }
                    return [4 /*yield*/, auth_server_1.auth.api.sendVerificationOTP({
                            body: {
                                email: session_1.user.email,
                                type: "email-verification",
                            },
                        })];
                case 4:
                    _b.sent();
                    return [2 /*return*/, json({ ok: true, email: session_1.user.email })];
                case 5:
                    if (!(path === "verify-email-code")) return [3 /*break*/, 9];
                    return [4 /*yield*/, request.json().catch(function () { return ({}); })];
                case 6:
                    body = _b.sent();
                    otp = String((_a = body === null || body === void 0 ? void 0 : body.otp) !== null && _a !== void 0 ? _a : "").trim();
                    if (!/^\d{6}$/.test(otp)) {
                        return [2 /*return*/, json({
                                error: "INVALID_CODE_FORMAT",
                                message: "Enter the 6-digit verification code.",
                            }, 400)];
                    }
                    return [4 /*yield*/, auth_server_1.auth.api.verifyEmailOTP({
                            body: {
                                email: session_1.user.email,
                                otp: otp,
                            },
                        })];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, auth_server_1.authDb
                            .insert(auth_schema_1.userProfiles)
                            .values({
                            userId: session_1.user.id,
                            emailVerifiedAt: new Date(),
                        })
                            .onConflictDoUpdate({
                            target: auth_schema_1.userProfiles.userId,
                            set: { emailVerifiedAt: new Date() },
                        })];
                case 8:
                    _b.sent();
                    return [2 /*return*/, json({ ok: true })];
                case 9:
                    if (!(path === "onboarding")) return [3 /*break*/, 15];
                    return [4 /*yield*/, ensureProfile(session_1.user.id, request)];
                case 10:
                    profile = _b.sent();
                    if (!profile.emailVerifiedAt) {
                        return [2 /*return*/, json({
                                error: "EMAIL_VERIFICATION_REQUIRED",
                                message: "Verify your email before onboarding.",
                            }, 403)];
                    }
                    return [4 /*yield*/, ensureCategories()];
                case 11:
                    _b.sent();
                    return [4 /*yield*/, request.json().catch(function () { return ({}); })];
                case 12:
                    body = _b.sent();
                    cityInputs = Array.isArray(body === null || body === void 0 ? void 0 : body.cities) ? body.cities.slice(0, 10) : [];
                    categoryIds = Array.isArray(body === null || body === void 0 ? void 0 : body.categoryIds)
                        ? body.categoryIds.map(String).slice(0, 12)
                        : [];
                    normalizedCities_1 = cityInputs
                        .map(function (item) {
                        var _a;
                        return ({
                            name: String((_a = item === null || item === void 0 ? void 0 : item.name) !== null && _a !== void 0 ? _a : "").trim().slice(0, 120),
                            region: (item === null || item === void 0 ? void 0 : item.region)
                                ? String(item.region).trim().slice(0, 120)
                                : null,
                            countryCode: (item === null || item === void 0 ? void 0 : item.countryCode)
                                ? String(item.countryCode).trim().slice(0, 8).toUpperCase()
                                : null,
                            isPrimary: Boolean(item === null || item === void 0 ? void 0 : item.isPrimary),
                            source: (item === null || item === void 0 ? void 0 : item.source) === "detected" ? "detected" : "selected",
                        });
                    })
                        .filter(function (item) { return item.name.length >= 2; });
                    if (!normalizedCities_1.length) {
                        return [2 /*return*/, json({
                                error: "SELECT_AT_LEAST_ONE_CITY",
                                message: "Choose at least one city.",
                            }, 400)];
                    }
                    if (!categoryIds.length) {
                        return [2 /*return*/, json({
                                error: "SELECT_AT_LEAST_ONE_CATEGORY",
                                message: "Choose at least one category.",
                            }, 400)];
                    }
                    return [4 /*yield*/, auth_server_1.authDb
                            .select({ id: auth_schema_1.categories.id })
                            .from(auth_schema_1.categories)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(auth_schema_1.categories.active, true), (0, drizzle_orm_1.inArray)(auth_schema_1.categories.id, categoryIds)))];
                case 13:
                    validCategories_1 = _b.sent();
                    if (!validCategories_1.length) {
                        return [2 /*return*/, json({ error: "INVALID_CATEGORIES", message: "Choose valid interests." }, 400)];
                    }
                    return [4 /*yield*/, auth_server_1.authDb.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var primaryIndex, index, city, slug, stored;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx
                                            .delete(auth_schema_1.userCityInterests)
                                            .where((0, drizzle_orm_1.eq)(auth_schema_1.userCityInterests.userId, session_1.user.id))];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, tx
                                                .delete(auth_schema_1.userCategoryInterests)
                                                .where((0, drizzle_orm_1.eq)(auth_schema_1.userCategoryInterests.userId, session_1.user.id))];
                                    case 2:
                                        _a.sent();
                                        primaryIndex = normalizedCities_1.findIndex(function (city) { return city.isPrimary; });
                                        if (primaryIndex < 0)
                                            primaryIndex = 0;
                                        index = 0;
                                        _a.label = 3;
                                    case 3:
                                        if (!(index < normalizedCities_1.length)) return [3 /*break*/, 7];
                                        city = normalizedCities_1[index];
                                        slug = slugify([city.name, city.region, city.countryCode]
                                            .filter(Boolean)
                                            .join("-"));
                                        return [4 /*yield*/, tx
                                                .insert(auth_schema_1.cities)
                                                .values({
                                                name: city.name,
                                                region: city.region,
                                                countryCode: city.countryCode,
                                                slug: slug,
                                            })
                                                .onConflictDoUpdate({
                                                target: auth_schema_1.cities.slug,
                                                set: {
                                                    name: city.name,
                                                    region: city.region,
                                                    countryCode: city.countryCode,
                                                    active: true,
                                                },
                                            })
                                                .returning()];
                                    case 4:
                                        stored = (_a.sent())[0];
                                        return [4 /*yield*/, tx.insert(auth_schema_1.userCityInterests).values({
                                                userId: session_1.user.id,
                                                cityId: stored.id,
                                                source: city.source,
                                                isPrimary: index === primaryIndex,
                                            })];
                                    case 5:
                                        _a.sent();
                                        _a.label = 6;
                                    case 6:
                                        index++;
                                        return [3 /*break*/, 3];
                                    case 7: return [4 /*yield*/, tx.insert(auth_schema_1.userCategoryInterests).values(validCategories_1.map(function (category) { return ({
                                            userId: session_1.user.id,
                                            categoryId: category.id,
                                        }); }))];
                                    case 8:
                                        _a.sent();
                                        return [4 /*yield*/, tx
                                                .update(auth_schema_1.userProfiles)
                                                .set({ onboardingCompletedAt: new Date() })
                                                .where((0, drizzle_orm_1.eq)(auth_schema_1.userProfiles.userId, session_1.user.id))];
                                    case 9:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 14:
                    _b.sent();
                    return [2 /*return*/, json({ ok: true })];
                case 15: return [2 /*return*/, json({ error: "NOT_FOUND", message: "Unknown account endpoint." }, 404)];
                case 16:
                    error_2 = _b.sent();
                    console.error("[XPOMAG account] POST failed", error_2);
                    return [2 /*return*/, json({
                            error: "ACCOUNT_API_FAILED",
                            message: error_2 instanceof Error
                                ? error_2.message
                                : "The account service could not complete the request.",
                        }, 500)];
                case 17: return [2 /*return*/];
            }
        });
    });
}
var templateObject_1;
