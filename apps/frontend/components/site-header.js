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
exports.SiteHeader = SiteHeader;
var renderer_1 = require("@xpomag/magazine/renderer");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var auth_client_1 = require("../lib/auth-client");
var headerLogo = {
    id: "xpomag-header-brand-mark",
    type: "brandMark",
    props: { label: "XpoMag" },
    style: { color: "#050505", fontSize: "2rem" },
};
function SiteHeader(_a) {
    var _this = this;
    var city = _a.city;
    var _b = auth_client_1.authClient.useSession(), session = _b.data, isPending = _b.isPending;
    var _c = (0, react_1.useState)(false), profileOpen = _c[0], setProfileOpen = _c[1];
    var _d = (0, react_1.useState)(false), menuOpen = _d[0], setMenuOpen = _d[1];
    var profileRef = (0, react_1.useRef)(null);
    var user = session === null || session === void 0 ? void 0 : session.user;
    var initials = ((user === null || user === void 0 ? void 0 : user.name) || (user === null || user === void 0 ? void 0 : user.email) || "M").split(/\s+/).map(function (part) { return part[0]; }).join("").slice(0, 2).toUpperCase();
    (0, react_1.useEffect)(function () {
        var close = function (event) {
            var _a;
            if (!((_a = profileRef.current) === null || _a === void 0 ? void 0 : _a.contains(event.target)))
                setProfileOpen(false);
        };
        window.addEventListener("pointerdown", close);
        return function () { return window.removeEventListener("pointerdown", close); };
    }, []);
    (0, react_1.useEffect)(function () {
        if (!menuOpen)
            return;
        var onKey = function (event) { if (event.key === "Escape")
            setMenuOpen(false); };
        window.addEventListener("keydown", onKey);
        return function () { return window.removeEventListener("keydown", onKey); };
    }, [menuOpen]);
    var signOut = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, auth_client_1.authClient.signOut()];
                case 1:
                    _a.sent();
                    setProfileOpen(false);
                    setMenuOpen(false);
                    window.location.href = "/";
                    return [2 /*return*/];
            }
        });
    }); };
    return (<>
      <header className="xp-site-header">
        <div className="xp-container xp-site-header__inner">
          <div className="xp-site-header__brand">
            {user ? <button className="xp-member-menu-trigger" type="button" onClick={function () { return setMenuOpen(true); }} aria-label="Open member menu"><lucide_react_1.Menu size={18}/></button> : null}
            <a href="/" className="xp-site-header__logo" aria-label="XpoMag home"><renderer_1.DesignElement node={headerLogo}/></a>
            <span className="xp-site-header__divider" aria-hidden="true"/>
            <span className="xp-label xp-site-header__city">{city}</span>
          </div>

          <nav aria-label="Primary" className="xp-site-header__nav">
            {!isPending && !user ? (<>
                <a className="xp-button xp-button--ghost" href="#about">About</a>
                <a className="xp-button" href="/login">Sign in</a>
              </>) : null}
            {user ? (<div className="xp-profile" ref={profileRef}>
                <button type="button" className="xp-profile__trigger" onClick={function () { return setProfileOpen(function (value) { return !value; }); }} aria-expanded={profileOpen} aria-label="Open profile menu">
                  <span className="xp-profile__avatar">{initials}</span><lucide_react_1.ChevronDown size={14}/>
                </button>
                {profileOpen ? (<div className="xp-profile__popover" role="menu">
                    <div className="xp-profile__identity"><span className="xp-profile__avatar xp-profile__avatar--large">{initials}</span><div><strong>{user.name || "XpoMag member"}</strong><span>{user.email}</span></div></div>
                    <div className="xp-profile__rule"/>
                    <a href="/saved" role="menuitem"><lucide_react_1.Bookmark size={16}/><span>Saved collections</span></a>
                    <a href="/" role="menuitem"><lucide_react_1.Home size={16}/><span>Discover</span></a>
                    <div className="xp-profile__rule"/>
                    <button type="button" role="menuitem" onClick={signOut}><lucide_react_1.LogOut size={16}/><span>Sign out</span></button>
                  </div>) : null}
              </div>) : null}
          </nav>
        </div>
      </header>

      {user ? (<>
          <button className="xp-member-rail-trigger" type="button" onClick={function () { return setMenuOpen(true); }} aria-label="Open member menu"><lucide_react_1.Menu size={18}/></button>
          <div className={"xp-member-drawer-backdrop ".concat(menuOpen ? "is-open" : "")} onMouseDown={function (event) { if (event.target === event.currentTarget)
            setMenuOpen(false); }} aria-hidden={!menuOpen}>
            <aside className={"xp-member-drawer ".concat(menuOpen ? "is-open" : "")} aria-label="Member navigation">
              <div className="xp-member-drawer__top"><a href="/" className="xp-member-drawer__brand">XpoMag</a><button type="button" onClick={function () { return setMenuOpen(false); }} aria-label="Close member menu"><lucide_react_1.X size={18}/></button></div>
              <div className="xp-member-drawer__identity"><span className="xp-profile__avatar xp-profile__avatar--large">{initials}</span><div><strong>{user.name || "XpoMag member"}</strong><span>{user.email}</span></div></div>
              <nav className="xp-member-drawer__nav">
                <a href="/"><lucide_react_1.Home size={18}/><span>Discover</span></a>
                <a href="/saved"><lucide_react_1.Bookmark size={18}/><span>Saved collections</span></a>
                <span className="xp-member-drawer__soon"><lucide_react_1.UserRound size={18}/><span>Profile</span><small>Soon</small></span>
              </nav>
              <button className="xp-member-drawer__signout" type="button" onClick={signOut}><lucide_react_1.LogOut size={18}/><span>Sign out</span></button>
            </aside>
          </div>
        </>) : null}
    </>);
}
