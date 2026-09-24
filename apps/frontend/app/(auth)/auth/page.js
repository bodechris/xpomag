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
exports.default = AuthPage;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var auth_client_1 = require("../../../lib/auth-client");
var account_api_1 = require("../../../lib/account-api");
function getAuthError(error, fallback) {
    if (!error)
        return fallback;
    return (error.message ||
        error.code ||
        error.statusText ||
        fallback);
}
function AuthPage() {
    var router = (0, navigation_1.useRouter)();
    var searchParams = (0, navigation_1.useSearchParams)();
    var initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
    var _a = (0, react_1.useState)(initialMode), mode = _a[0], setMode = _a[1];
    var _b = (0, react_1.useState)(""), name = _b[0], setName = _b[1];
    var _c = (0, react_1.useState)(""), email = _c[0], setEmail = _c[1];
    var _d = (0, react_1.useState)(""), password = _d[0], setPassword = _d[1];
    var _e = (0, react_1.useState)(false), busy = _e[0], setBusy = _e[1];
    var _f = (0, react_1.useState)(false), googleBusy = _f[0], setGoogleBusy = _f[1];
    var _g = (0, react_1.useState)(""), error = _g[0], setError = _g[1];
    function continueWithGoogle() {
        return __awaiter(this, void 0, void 0, function () {
            var result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setError("");
                        setGoogleBusy(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, auth_client_1.authClient.signIn.social({
                                provider: "google",
                                callbackURL: "".concat(window.location.origin, "/post-login"),
                            })];
                    case 2:
                        result = _a.sent();
                        if (result === null || result === void 0 ? void 0 : result.error) {
                            setError(getAuthError(result.error, "Unable to continue with Google."));
                            setGoogleBusy(false);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        setError(getAuthError(err_1, "Unable to continue with Google."));
                        setGoogleBusy(false);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function submit(event) {
        return __awaiter(this, void 0, void 0, function () {
            var result_1, result, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event.preventDefault();
                        setBusy(true);
                        setError("");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, 7, 8]);
                        if (!(mode === "signup")) return [3 /*break*/, 4];
                        return [4 /*yield*/, auth_client_1.authClient.signUp.email({
                                name: name.trim(),
                                email: email.trim().toLowerCase(),
                                password: password,
                            })];
                    case 2:
                        result_1 = _a.sent();
                        if (result_1.error) {
                            throw new Error(getAuthError(result_1.error, "Unable to create account."));
                        }
                        return [4 /*yield*/, (0, account_api_1.accountFetch)("/send-verification-code", {
                                method: "POST",
                            })];
                    case 3:
                        _a.sent();
                        router.push("/verify-email");
                        return [2 /*return*/];
                    case 4: return [4 /*yield*/, auth_client_1.authClient.signIn.email({
                            email: email.trim().toLowerCase(),
                            password: password,
                        })];
                    case 5:
                        result = _a.sent();
                        if (result.error) {
                            throw new Error(getAuthError(result.error, "Incorrect email or password."));
                        }
                        router.push("/post-login");
                        return [3 /*break*/, 8];
                    case 6:
                        err_2 = _a.sent();
                        setError(err_2 instanceof TypeError && err_2.message.toLowerCase().includes("fetch")
                            ? "Authentication service could not be reached. Refresh and try again."
                            : getAuthError(err_2, "Unable to complete authentication."));
                        return [3 /*break*/, 8];
                    case 7:
                        setBusy(false);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    }
    function changeMode(next) {
        setMode(next);
        setError("");
        window.history.replaceState(null, "", next === "signup" ? "/auth?mode=signup" : "/auth");
    }
    return (<main className="xp-auth">
      <section className="xp-auth__left">
        <a className="xp-brand" href="/">
          XpoMag
          <span className="xp-brand__city">ROSEBANK + SANDTON</span>
        </a>

        <div className="xp-auth__hero">
          <p className="xp-eyebrow">YOUR CITY, CURATED</p>
          <h1>Your city. Better edited.</h1>
          <p>
            A sharper way to discover the people, places, businesses and ideas
            shaping the cities you care about.
          </p>
        </div>

        <div className="xp-auth__meta">
          <span>Local stories</span>
          <span>City discovery</span>
          <span>Curated magazines</span>
        </div>
      </section>

      <section className="xp-auth__right">
        <div className="xp-auth__card">
          <div className="xp-auth__switch">
            <button type="button" data-active={mode === "signin"} onClick={function () { return changeMode("signin"); }}>
              Sign in
            </button>
            <button type="button" data-active={mode === "signup"} onClick={function () { return changeMode("signup"); }}>
              Create account
            </button>
          </div>

          <h2>{mode === "signin" ? "Welcome back." : "Join XPOMAG."}</h2>
          <p className="xp-auth__sub">
            {mode === "signin"
            ? "Sign in to continue to your cities and interests."
            : "Create an account and choose what you want XPOMAG to curate for you."}
          </p>

          <button type="button" className="xp-google" onClick={continueWithGoogle} disabled={googleBusy || busy}>
            {googleBusy ? "Connecting…" : "Continue with Google"}
          </button>

          <div className="xp-divider">or</div>

          <form className="xp-form" onSubmit={submit}>
            {mode === "signup" && (<div className="xp-field">
                <label htmlFor="xp-name">Name</label>
                <input id="xp-name" type="text" required autoComplete="name" value={name} onChange={function (e) { return setName(e.target.value); }} placeholder="Your name"/>
              </div>)}

            <div className="xp-field">
              <label htmlFor="xp-email">Email</label>
              <input id="xp-email" type="email" required autoComplete="email" value={email} onChange={function (e) { return setEmail(e.target.value); }} placeholder="you@example.com"/>
            </div>

            <div className="xp-field">
              <div className="xp-password-row">
                <label htmlFor="xp-password">Password</label>
                {mode === "signin" && (<a className="xp-link" href="/forgot-password">
                    Forgot password?
                  </a>)}
              </div>
              <input id="xp-password" type="password" required minLength={8} autoComplete={mode === "signup"
            ? "new-password"
            : "current-password"} value={password} onChange={function (e) { return setPassword(e.target.value); }} placeholder={mode === "signup"
            ? "At least 8 characters"
            : "Your password"}/>
            </div>

            {error && <div className="xp-error">{error}</div>}

            <button className="xp-submit" type="submit" disabled={busy || googleBusy}>
              {busy
            ? mode === "signup"
                ? "Creating account…"
                : "Signing in…"
            : mode === "signup"
                ? "Create account"
                : "Sign in"}
            </button>
          </form>

          <p className="xp-note">
            By continuing, you agree to XPOMAG’s terms and privacy policy.
          </p>
        </div>
      </section>
    </main>);
}
