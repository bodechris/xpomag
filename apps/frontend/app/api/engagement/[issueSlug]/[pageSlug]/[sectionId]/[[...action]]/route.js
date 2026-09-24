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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.PUT = exports.POST = exports.GET = exports.dynamic = exports.runtime = void 0;
var auth_server_1 = require("../../../../../../../lib/auth-server");
exports.runtime = "nodejs";
exports.dynamic = "force-dynamic";
function apiOrigin() {
    var _a, _b;
    return (_b = (_a = process.env.API_ORIGIN) !== null && _a !== void 0 ? _a : process.env.NEXT_PUBLIC_API_ORIGIN) !== null && _b !== void 0 ? _b : "http://localhost:4000";
}
function proxy(request, context) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, issueSlug, pageSlug, sectionId, _b, action, session, isMutation, target, headers, body, _c, response, responseBody, responseHeaders;
        var _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, (0, auth_server_1.ensureAuthInfrastructure)()];
                case 1:
                    _f.sent();
                    return [4 /*yield*/, context.params];
                case 2:
                    _a = _f.sent(), issueSlug = _a.issueSlug, pageSlug = _a.pageSlug, sectionId = _a.sectionId, _b = _a.action, action = _b === void 0 ? [] : _b;
                    return [4 /*yield*/, auth_server_1.auth.api.getSession({ headers: request.headers })];
                case 3:
                    session = _f.sent();
                    isMutation = request.method !== "GET" && request.method !== "HEAD";
                    if (isMutation && !(session === null || session === void 0 ? void 0 : session.user)) {
                        return [2 /*return*/, Response.json({ ok: false, error: "Authentication required" }, { status: 401 })];
                    }
                    target = new URL("/v1/engagement/".concat(encodeURIComponent(issueSlug), "/").concat(encodeURIComponent(pageSlug), "/").concat(encodeURIComponent(sectionId)).concat(action.length ? "/".concat(action.map(encodeURIComponent).join("/")) : ""), apiOrigin());
                    headers = new Headers();
                    headers.set("accept", "application/json");
                    if (request.headers.get("content-type"))
                        headers.set("content-type", request.headers.get("content-type"));
                    if ((_d = session === null || session === void 0 ? void 0 : session.user) === null || _d === void 0 ? void 0 : _d.id)
                        headers.set("x-xpomag-user-id", session.user.id);
                    if (process.env.ENGAGEMENT_INTERNAL_SECRET)
                        headers.set("x-xpomag-internal-key", process.env.ENGAGEMENT_INTERNAL_SECRET);
                    if (!(request.method === "GET" || request.method === "HEAD")) return [3 /*break*/, 4];
                    _c = undefined;
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, request.text()];
                case 5:
                    _c = _f.sent();
                    _f.label = 6;
                case 6:
                    body = _c;
                    return [4 /*yield*/, fetch(target, {
                            method: request.method,
                            headers: headers,
                            body: body,
                            cache: "no-store",
                        })];
                case 7:
                    response = _f.sent();
                    return [4 /*yield*/, response.arrayBuffer()];
                case 8:
                    responseBody = _f.sent();
                    responseHeaders = new Headers();
                    responseHeaders.set("content-type", (_e = response.headers.get("content-type")) !== null && _e !== void 0 ? _e : "application/json");
                    return [2 /*return*/, new Response(responseBody, { status: response.status, headers: responseHeaders })];
            }
        });
    });
}
exports.GET = proxy;
exports.POST = proxy;
exports.PUT = proxy;
exports.DELETE = proxy;
