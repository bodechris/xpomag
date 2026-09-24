"use client";
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
exports.default = SavedPage;
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var site_header_1 = require("../../components/site-header");
var auth_client_1 = require("../../lib/auth-client");
function readable(value) {
    return value.replace(/^demo-/, "").replace(/[-_]+/g, " ").replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
}
function SavedPage() {
    var _this = this;
    var _a;
    var _b = auth_client_1.authClient.useSession(), session = _b.data, isPending = _b.isPending;
    var _c = (0, react_1.useState)([]), collections = _c[0], setCollections = _c[1];
    var _d = (0, react_1.useState)([]), items = _d[0], setItems = _d[1];
    var _e = (0, react_1.useState)(null), activeId = _e[0], setActiveId = _e[1];
    var _f = (0, react_1.useState)(true), loading = _f[0], setLoading = _f[1];
    (0, react_1.useEffect)(function () {
        if (isPending)
            return;
        if (!(session === null || session === void 0 ? void 0 : session.user)) {
            window.location.href = "/login?returnTo=".concat(encodeURIComponent("/saved"));
            return;
        }
        fetch("/api/engagement/me/saves", { credentials: "include", cache: "no-store" })
            .then(function (response) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!response.ok)
                    throw new Error("Unable to load saved items");
                return [2 /*return*/, response.json()];
            });
        }); })
            .then(function (payload) {
            var _a, _b, _c, _d, _e;
            setCollections((_a = payload === null || payload === void 0 ? void 0 : payload.collections) !== null && _a !== void 0 ? _a : []);
            setItems((_b = payload === null || payload === void 0 ? void 0 : payload.items) !== null && _b !== void 0 ? _b : []);
            setActiveId((_e = (_d = (_c = payload === null || payload === void 0 ? void 0 : payload.collections) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.id) !== null && _e !== void 0 ? _e : null);
        })
            .finally(function () { return setLoading(false); });
    }, [isPending, session === null || session === void 0 ? void 0 : session.user]);
    var visibleItems = (0, react_1.useMemo)(function () { return activeId ? items.filter(function (item) { return item.collectionId === activeId; }) : items; }, [activeId, items]);
    var activeCollection = collections.find(function (collection) { return collection.id === activeId; });
    return (<main className="xp-saved-page">
      <site_header_1.SiteHeader city="Your XpoMag"/>
      <section className="xp-container xp-saved-shell">
        <header className="xp-saved-hero"><p className="xp-label">Your library</p><h1>Saved collections.</h1><p>Keep the stories, places and ideas you want to come back to.</p></header>
        {loading ? <div className="xp-saved-loading"><lucide_react_1.Loader2 size={20} className="xp-spin"/> Loading your saves…</div> : (<div className="xp-saved-layout">
            <aside className="xp-saved-collections" aria-label="Collections">
              {collections.map(function (collection) { return <button key={collection.id} type="button" className={activeId === collection.id ? "is-active" : ""} onClick={function () { return setActiveId(collection.id); }}><lucide_react_1.FolderHeart size={17}/><span><strong>{collection.name}</strong><small>{collection.itemCount} item{collection.itemCount === 1 ? "" : "s"}</small></span></button>; })}
            </aside>
            <div className="xp-saved-content">
              <div className="xp-saved-content__head"><div><span>Collection</span><h2>{(_a = activeCollection === null || activeCollection === void 0 ? void 0 : activeCollection.name) !== null && _a !== void 0 ? _a : "Saved"}</h2></div><strong>{visibleItems.length}</strong></div>
              {visibleItems.length ? <div className="xp-saved-grid">{visibleItems.map(function (item, index) { return <a className="xp-saved-card" key={"".concat(item.collectionId, "-").concat(item.issueSlug, "-").concat(item.pageSlug, "-").concat(item.sectionId, "-").concat(index)} href={"/magazine/".concat(encodeURIComponent(item.issueSlug), "/").concat(encodeURIComponent(item.pageSlug))}><div className="xp-saved-card__mark"><lucide_react_1.Bookmark size={18} fill="currentColor"/></div><div><small>{readable(item.issueSlug)}</small><strong>{readable(item.pageSlug)}</strong><span>{readable(item.sectionId)}</span></div><lucide_react_1.ChevronRight size={17}/></a>; })}</div> : <div className="xp-saved-empty"><lucide_react_1.Bookmark size={26}/><strong>Nothing saved here yet.</strong><span>Use the bookmark button inside the magazine to add a story or section.</span></div>}
            </div>
          </div>)}
      </section>
    </main>);
}
