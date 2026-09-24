"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OnboardingPage;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var account_api_1 = require("../../../lib/account-api");
function OnboardingPage() {
    var router = (0, navigation_1.useRouter)();
    var _a = (0, react_1.useState)(null), bootstrap = _a[0], setBootstrap = _a[1];
    var _b = (0, react_1.useState)([]), cities = _b[0], setCities = _b[1];
    var _c = (0, react_1.useState)(""), cityDraft = _c[0], setCityDraft = _c[1];
    var _d = (0, react_1.useState)([]), selectedCategories = _d[0], setSelectedCategories = _d[1];
    var _e = (0, react_1.useState)(""), error = _e[0], setError = _e[1];
    var _f = (0, react_1.useState)(false), busy = _f[0], setBusy = _f[1];
    (0, react_1.useEffect)(function () {
        (0, account_api_1.accountFetch)("/onboarding")
            .then(function (data) {
            setBootstrap(data);
            setSelectedCategories(data.selectedCategoryIds);
            if (data.selectedCities.length) {
                setCities(data.selectedCities);
                return;
            }
            if (data.detectedLocation.city) {
                setCities([
                    {
                        name: data.detectedLocation.city,
                        region: data.detectedLocation.region,
                        countryCode: data.detectedLocation.countryCode,
                        isPrimary: true,
                        source: "detected",
                    },
                ]);
            }
        })
            .catch(function (err) {
            if (err.status === 401) {
                router.replace("/auth");
            }
            else if (err.status === 403) {
                router.replace("/verify-email");
            }
            else {
                setError(err.message || "Unable to load your setup.");
            }
        });
    }, [router]);
    var detectedLabel = (0, react_1.useMemo)(function () {
        if (!(bootstrap === null || bootstrap === void 0 ? void 0 : bootstrap.detectedLocation.city))
            return null;
        return [
            bootstrap.detectedLocation.city,
            bootstrap.detectedLocation.region,
            bootstrap.detectedLocation.countryCode,
        ]
            .filter(Boolean)
            .join(", ");
    }, [bootstrap]);
    function addCity() {
        var name = cityDraft.trim();
        if (name.length < 2)
            return;
        if (cities.some(function (city) { return city.name.toLowerCase() === name.toLowerCase(); })) {
            setCityDraft("");
            return;
        }
        setCities(function (current) { return __spreadArray(__spreadArray([], current, true), [
            {
                name: name,
                isPrimary: current.length === 0,
                source: "selected",
            },
        ], false); });
        setCityDraft("");
    }
    function removeCity(index) {
        setCities(function (current) {
            var next = current.filter(function (_, itemIndex) { return itemIndex !== index; });
            if (next.length && !next.some(function (city) { return city.isPrimary; })) {
                next[0] = __assign(__assign({}, next[0]), { isPrimary: true });
            }
            return next;
        });
    }
    function toggleCategory(id) {
        setSelectedCategories(function (current) {
            return current.includes(id)
                ? current.filter(function (item) { return item !== id; })
                : current.length >= 8
                    ? current
                    : __spreadArray(__spreadArray([], current, true), [id], false);
        });
    }
    function submit(event) {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event.preventDefault();
                        setError("");
                        if (!cities.length) {
                            setError("Add at least one city.");
                            return [2 /*return*/];
                        }
                        if (!selectedCategories.length) {
                            setError("Choose at least one interest.");
                            return [2 /*return*/];
                        }
                        setBusy(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, (0, account_api_1.accountFetch)("/onboarding", {
                                method: "POST",
                                body: JSON.stringify({
                                    cities: cities,
                                    categoryIds: selectedCategories,
                                }),
                            })];
                    case 2:
                        _a.sent();
                        router.replace("/");
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        setError(err_1 instanceof Error
                            ? err_1.message
                            : "Unable to save your preferences.");
                        return [3 /*break*/, 5];
                    case 4:
                        setBusy(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    if (!bootstrap) {
        return (<main className="flowShell">
        <section className="flowEditorial">
          <a href="/" className="flowBrand">
            XpoMag
            <span className="flowBrandMeta">ROSEBANK + SANDTON</span>
          </a>
          <div className="flowHero">
            <p className="flowKicker">PERSONALISING XPOMAG</p>
            <h1>Make the city yours.</h1>
          </div>
        </section>
        <section className="flowPanel">
          <div className="flowCard">
            <div className="flowStep">
              <span>Setup</span>
              <span>02 / 02</span>
            </div>
            <h2>Preparing your interests…</h2>
            {error ? <div className="flowError">{error}</div> : null}
          </div>
        </section>
      </main>);
    }
    return (<main className="flowShell">
      <section className="flowEditorial">
        <a href="/" className="flowBrand">
          XpoMag
          <span className="flowBrandMeta">ROSEBANK + SANDTON</span>
        </a>

        <div className="flowHero">
          <p className="flowKicker">PERSONALISE YOUR EDITION</p>
          <h1>Make the city yours.</h1>
          <p>
            Tell XPOMAG where you care about and what you’re interested in.
            We’ll use it to make discovery more useful without turning the
            magazine into an endless feed.
          </p>
        </div>

        <div className="flowMeta">
          <span>Your cities</span>
          <span>Your interests</span>
          <span>Your edition</span>
        </div>
      </section>

      <section className="flowPanel">
        <form className="flowCard" onSubmit={submit}>
          <div className="flowStep">
            <span>Setup</span>
            <span>02 / 02</span>
          </div>

          <h2>What should XPOMAG follow for you?</h2>
          <p className="flowLead">
            Keep it light. Choose the places and subjects that should influence
            what XPOMAG surfaces first.
          </p>

          <section className="flowSection">
            <div className="flowSectionHeader">
              <div className="flowSectionNumber">01</div>
              <div>
                <h3>Your cities</h3>
                <p>
                  {detectedLabel
            ? "We think you\u2019re around ".concat(detectedLabel, ".")
            : "We couldn’t confidently detect your city. Add one below."}
                </p>
              </div>
            </div>

            <div className="flowInline">
              <input className="flowInput" value={cityDraft} onChange={function (event) { return setCityDraft(event.target.value); }} onKeyDown={function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                addCity();
            }
        }} placeholder="Add a city"/>
              <button className="flowAdd" type="button" onClick={addCity}>
                Add city
              </button>
            </div>

            {cities.length ? (<div className="flowPills">
                {cities.map(function (city, index) { return (<button type="button" key={"".concat(city.name, "-").concat(index)} className="flowPill flowPillCity" onClick={function () { return removeCity(index); }} title="Remove city">
                    {city.name}
                    {city.isPrimary ? " · Primary" : ""} ×
                  </button>); })}
              </div>) : null}
          </section>

          <section className="flowSection">
            <div className="flowSectionHeader">
              <div className="flowSectionNumber">02</div>
              <div>
                <h3>Your interests</h3>
                <p>
                  Pick up to eight. These categories can later become their own
                  curated XPOMAG editions.
                </p>
              </div>
            </div>

            <div className="flowPills">
              {bootstrap.categories.map(function (category) {
            var active = selectedCategories.includes(category.id);
            return (<button key={category.id} type="button" className="flowPill" data-active={active} aria-pressed={active} onClick={function () { return toggleCategory(category.id); }}>
                    {category.name}
                  </button>);
        })}
            </div>
          </section>

          {error ? <div className="flowError">{error}</div> : null}

          <button className="flowButton" disabled={busy}>
            {busy ? "Saving your setup…" : "Start exploring XPOMAG"}
          </button>

          <p className="flowFooterNote">
            You can change cities and interests later from your account.
          </p>
        </form>
      </section>
    </main>);
}
