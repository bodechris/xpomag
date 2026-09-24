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
exports.default = MagazinePageRoute;
var headers_1 = require("next/headers");
var auth_server_1 = require("../../../../lib/auth-server");
var magazine_reader_1 = require("../../../../components/magazine-reader");
var site_header_1 = require("../../../../components/site-header");
var demo_magazine_1 = require("../../../../lib/demo-magazine");
var cover_assets_1 = require("../../../../lib/cover-assets");
var composer_persistence_1 = require("../../../../lib/composer-persistence");
function MagazinePageRoute(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var _c, issueSlug, pageSlug, viewerSession, _d, _e, viewerAuthenticated, preview, alphaCoverAssets, coverDocument, _f, issue;
        var _g;
        var params = _b.params, searchParams = _b.searchParams;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0: return [4 /*yield*/, params];
                case 1:
                    _c = _h.sent(), issueSlug = _c.issue, pageSlug = _c.page;
                    return [4 /*yield*/, (0, auth_server_1.ensureAuthInfrastructure)()];
                case 2:
                    _h.sent();
                    _e = (_d = auth_server_1.auth.api).getSession;
                    _g = {};
                    return [4 /*yield*/, (0, headers_1.headers)()];
                case 3: return [4 /*yield*/, _e.apply(_d, [(_g.headers = _h.sent(), _g)])];
                case 4:
                    viewerSession = _h.sent();
                    viewerAuthenticated = Boolean(viewerSession === null || viewerSession === void 0 ? void 0 : viewerSession.user);
                    return [4 /*yield*/, searchParams];
                case 5:
                    preview = (_h.sent()).preview;
                    return [4 /*yield*/, (0, cover_assets_1.getAlphaCoverAssets)()];
                case 6:
                    alphaCoverAssets = _h.sent();
                    if (!(pageSlug === "cover")) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, composer_persistence_1.getComposerDocument)(issueSlug, "cover", preview === "draft" ? "draft" : "published")];
                case 7:
                    _f = _h.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _f = null;
                    _h.label = 9;
                case 9:
                    coverDocument = _f;
                    issue = (0, demo_magazine_1.getDemoMagazineBySlug)(issueSlug, { alphaCoverAssets: alphaCoverAssets, coverDocument: coverDocument });
                    return [2 /*return*/, (<main>
      <site_header_1.SiteHeader city={issue.city}/>
      <div className="xp-container xp-home-shell">
        <magazine_reader_1.MagazineReader issue={issue} initialPageSlug={pageSlug} viewerAuthenticated={viewerAuthenticated}/>
      </div>
    </main>)];
            }
        });
    });
}
