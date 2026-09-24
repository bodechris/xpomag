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
exports.default = VerifyEmailPage;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var auth_client_1 = require("../../../lib/auth-client");
var account_api_1 = require("../../../lib/account-api");
function VerifyEmailPage() {
    var _a;
    var router = (0, navigation_1.useRouter)();
    var session = auth_client_1.authClient.useSession().data;
    var _b = (0, react_1.useState)(""), otp = _b[0], setOtp = _b[1];
    var _c = (0, react_1.useState)(""), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(false), busy = _d[0], setBusy = _d[1];
    var _e = (0, react_1.useState)(false), resending = _e[0], setResending = _e[1];
    (0, react_1.useEffect)(function () {
        if (session === null)
            router.replace("/auth");
    }, [session, router]);
    function verify(event) {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event.preventDefault();
                        if (!/^\d{6}$/.test(otp)) {
                            setError("Enter the 6-digit verification code.");
                            return [2 /*return*/];
                        }
                        setBusy(true);
                        setError("");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, account_api_1.accountFetch)("/verify-email-code", {
                                method: "POST",
                                body: JSON.stringify({ otp: otp }),
                            })];
                    case 2:
                        _a.sent();
                        router.replace("/onboarding");
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        setError(err_1 instanceof Error
                            ? err_1.message
                            : "The code is invalid or has expired.");
                        return [3 /*break*/, 5];
                    case 4:
                        setBusy(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    function resend() {
        return __awaiter(this, void 0, void 0, function () {
            var err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setResending(true);
                        setError("");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, account_api_1.accountFetch)("/send-verification-code", { method: "POST" })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        err_2 = _a.sent();
                        setError(err_2 instanceof Error ? err_2.message : "Unable to send a new code.");
                        return [3 /*break*/, 5];
                    case 4:
                        setResending(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    return (<main className="flowShell">
      <section className="flowEditorial">
        <a href="/" className="flowBrand">
          XpoMag
          <span className="flowBrandMeta">ROSEBANK + SANDTON</span>
        </a>

        <div className="flowHero">
          <p className="flowKicker">ACCOUNT VERIFICATION</p>
          <h1>One quick check.</h1>
          <p>
            Verify your email, then tell XPOMAG which cities and subjects should
            shape your experience.
          </p>
        </div>

        <div className="flowMeta">
          <span>Private account</span>
          <span>Local interests</span>
          <span>Personal editions</span>
        </div>
      </section>

      <section className="flowPanel">
        <div className="flowCard">
          <div className="flowStep">
            <span>Setup</span>
            <span>01 / 02</span>
          </div>

          <h2>Check your email.</h2>
          <p className="flowLead">
            We sent a 6-digit verification code
            {((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.email) ? " to ".concat(session.user.email) : ""}.
            Enter it below to continue.
          </p>

          <form onSubmit={verify}>
            <div className="flowField">
              <label className="flowLabel" htmlFor="xp-otp">
                Verification code
              </label>
              <input id="xp-otp" className="flowInput flowOtp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={function (event) {
            return setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
        }} placeholder="000000" autoFocus/>
            </div>

            {error ? <div className="flowError">{error}</div> : null}

            <button className="flowButton" disabled={busy || otp.length !== 6}>
              {busy ? "Verifying…" : "Verify email"}
            </button>
          </form>

          <button type="button" className="flowTextButton" disabled={resending} onClick={resend}>
            {resending ? "Sending a new code…" : "Send a new code"}
          </button>
        </div>
      </section>
    </main>);
}
