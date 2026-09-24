"use strict";
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.authDb = exports.authPool = void 0;
exports.ensureAuthInfrastructure = ensureAuthInfrastructure;
var better_auth_1 = require("better-auth");
var drizzle_adapter_1 = require("@better-auth/drizzle-adapter");
var plugins_1 = require("better-auth/plugins");
var node_postgres_1 = require("drizzle-orm/node-postgres");
var pg_1 = require("pg");
var schema = require("./auth-schema");
var connectionString = (_a = process.env.DATABASE_URL) !== null && _a !== void 0 ? _a : "postgres://xpomag:xpomag@localhost:5434/xpomag";
exports.authPool = new pg_1.Pool({ connectionString: connectionString });
exports.authDb = (0, node_postgres_1.drizzle)(exports.authPool);
var infrastructurePromise = null;
function ensureAuthInfrastructure() {
    var _this = this;
    if (infrastructurePromise)
        return infrastructurePromise;
    infrastructurePromise = (function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.authPool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto")];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, exports.authPool.query("\n      CREATE TABLE IF NOT EXISTS \"user\" (\n        \"id\" text PRIMARY KEY NOT NULL,\n        \"name\" text NOT NULL,\n        \"email\" text NOT NULL UNIQUE,\n        \"email_verified\" boolean DEFAULT false NOT NULL,\n        \"image\" text,\n        \"created_at\" timestamp DEFAULT now() NOT NULL,\n        \"updated_at\" timestamp DEFAULT now() NOT NULL\n      );\n\n      CREATE TABLE IF NOT EXISTS \"session\" (\n        \"id\" text PRIMARY KEY NOT NULL,\n        \"expires_at\" timestamp NOT NULL,\n        \"token\" text NOT NULL UNIQUE,\n        \"created_at\" timestamp DEFAULT now() NOT NULL,\n        \"updated_at\" timestamp DEFAULT now() NOT NULL,\n        \"ip_address\" text,\n        \"user_agent\" text,\n        \"user_id\" text NOT NULL REFERENCES \"user\"(\"id\") ON DELETE cascade\n      );\n      CREATE INDEX IF NOT EXISTS \"session_userId_idx\" ON \"session\" (\"user_id\");\n\n      CREATE TABLE IF NOT EXISTS \"account\" (\n        \"id\" text PRIMARY KEY NOT NULL,\n        \"account_id\" text NOT NULL,\n        \"provider_id\" text NOT NULL,\n        \"user_id\" text NOT NULL REFERENCES \"user\"(\"id\") ON DELETE cascade,\n        \"access_token\" text,\n        \"refresh_token\" text,\n        \"id_token\" text,\n        \"access_token_expires_at\" timestamp,\n        \"refresh_token_expires_at\" timestamp,\n        \"scope\" text,\n        \"password\" text,\n        \"created_at\" timestamp DEFAULT now() NOT NULL,\n        \"updated_at\" timestamp DEFAULT now() NOT NULL\n      );\n      CREATE INDEX IF NOT EXISTS \"account_userId_idx\" ON \"account\" (\"user_id\");\n\n      CREATE TABLE IF NOT EXISTS \"verification\" (\n        \"id\" text PRIMARY KEY NOT NULL,\n        \"identifier\" text NOT NULL,\n        \"value\" text NOT NULL,\n        \"expires_at\" timestamp NOT NULL,\n        \"created_at\" timestamp DEFAULT now() NOT NULL,\n        \"updated_at\" timestamp DEFAULT now() NOT NULL\n      );\n      CREATE INDEX IF NOT EXISTS \"verification_identifier_idx\"\n        ON \"verification\" (\"identifier\");\n\n      CREATE TABLE IF NOT EXISTS \"user_profiles\" (\n        \"user_id\" text PRIMARY KEY NOT NULL REFERENCES \"user\"(\"id\") ON DELETE cascade,\n        \"email_verified_at\" timestamptz,\n        \"onboarding_completed_at\" timestamptz,\n        \"detected_city\" text,\n        \"detected_region\" text,\n        \"detected_country_code\" text,\n        \"location_source\" text\n      );\n\n      CREATE TABLE IF NOT EXISTS \"cities\" (\n        \"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n        \"name\" text NOT NULL,\n        \"region\" text,\n        \"country_code\" text,\n        \"slug\" text NOT NULL UNIQUE,\n        \"active\" boolean DEFAULT true NOT NULL,\n        \"created_at\" timestamptz DEFAULT now() NOT NULL\n      );\n\n      CREATE TABLE IF NOT EXISTS \"categories\" (\n        \"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n        \"name\" text NOT NULL,\n        \"slug\" text NOT NULL UNIQUE,\n        \"description\" text,\n        \"active\" boolean DEFAULT true NOT NULL,\n        \"created_at\" timestamptz DEFAULT now() NOT NULL\n      );\n\n      CREATE TABLE IF NOT EXISTS \"user_city_interests\" (\n        \"user_id\" text NOT NULL REFERENCES \"user\"(\"id\") ON DELETE cascade,\n        \"city_id\" uuid NOT NULL REFERENCES \"cities\"(\"id\") ON DELETE cascade,\n        \"source\" text DEFAULT 'selected' NOT NULL,\n        \"is_primary\" boolean DEFAULT false NOT NULL,\n        \"created_at\" timestamptz DEFAULT now() NOT NULL,\n        PRIMARY KEY (\"user_id\", \"city_id\")\n      );\n\n      CREATE TABLE IF NOT EXISTS \"user_category_interests\" (\n        \"user_id\" text NOT NULL REFERENCES \"user\"(\"id\") ON DELETE cascade,\n        \"category_id\" uuid NOT NULL REFERENCES \"categories\"(\"id\") ON DELETE cascade,\n        \"created_at\" timestamptz DEFAULT now() NOT NULL,\n        PRIMARY KEY (\"user_id\", \"category_id\")\n      );\n    ")];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); })().catch(function (error) {
        infrastructurePromise = null;
        throw error;
    });
    return infrastructurePromise;
}
function authOrigin() {
    var _a, _b;
    return ((_b = (_a = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN) !== null && _a !== void 0 ? _a : process.env.FRONTEND_ORIGIN) !== null && _b !== void 0 ? _b : "http://localhost:3000");
}
function authSecret() {
    if (process.env.BETTER_AUTH_SECRET)
        return process.env.BETTER_AUTH_SECRET;
    if (process.env.NODE_ENV === "production") {
        throw new Error("BETTER_AUTH_SECRET is required in production");
    }
    return "xpomag-local-development-secret-change-before-production";
}
function sendOtp(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var apiKey, from, response;
        var email = _b.email, otp = _b.otp, type = _b.type;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    apiKey = process.env.RESEND_API_KEY;
                    from = process.env.AUTH_EMAIL_FROM;
                    if (!apiKey || !from) {
                        console.log("\n[XPOMAG AUTH OTP] ".concat(email, " -> ").concat(otp, " (").concat(type, ")\n"));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch("https://api.resend.com/emails", {
                            method: "POST",
                            headers: {
                                Authorization: "Bearer ".concat(apiKey),
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                from: from,
                                to: [email],
                                subject: type === "forget-password"
                                    ? "Reset your XPOMAG password"
                                    : "Verify your XPOMAG email",
                                html: "\n        <div style=\"font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px\">\n          <div style=\"font-weight:900;font-size:20px;margin-bottom:30px\">XpoMag</div>\n          <p style=\"font-size:13px;letter-spacing:.12em;font-weight:700\">YOUR VERIFICATION CODE</p>\n          <div style=\"font-size:42px;font-weight:700;letter-spacing:.18em;margin:26px 0\">".concat(otp, "</div>\n          <p style=\"font-size:13px;color:#777\">This code expires in 10 minutes.</p>\n        </div>\n      "),
                            }),
                        })];
                case 1:
                    response = _c.sent();
                    if (!response.ok) {
                        throw new Error("Unable to send verification email (".concat(response.status, ")"));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.auth = (0, better_auth_1.betterAuth)({
    appName: "XPOMAG",
    baseURL: authOrigin(),
    secret: authSecret(),
    database: (0, drizzle_adapter_1.drizzleAdapter)(exports.authDb, {
        provider: "pg",
        schema: schema,
    }),
    trustedOrigins: [
        authOrigin(),
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
    },
    socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
        }
        : {},
    plugins: [
        (0, plugins_1.emailOTP)({
            otpLength: 6,
            expiresIn: 10 * 60,
            allowedAttempts: 5,
            overrideDefaultEmailVerification: true,
            sendVerificationOTP: function (_a) {
                return __awaiter(this, arguments, void 0, function (_b) {
                    var email = _b.email, otp = _b.otp, type = _b.type;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, sendOtp({ email: email, otp: otp, type: type })];
                            case 1:
                                _c.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            },
        }),
    ],
    rateLimit: {
        enabled: true,
    },
});
