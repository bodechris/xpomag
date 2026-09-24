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
exports.SectionEngagementBar = SectionEngagementBar;
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var react_dom_1 = require("react-dom");
var auth_client_1 = require("../lib/auth-client");
var EMPTY_SUMMARY = {
    reactions: { like: 0, love: 0, insightful: 0, celebrate: 0 },
    totalReactions: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    viewerReaction: null,
    viewerSaved: false,
};
var reactionMeta = {
    like: { label: "Like", icon: lucide_react_1.ThumbsUp },
    love: { label: "Love", icon: lucide_react_1.Heart },
    insightful: { label: "Insightful", icon: lucide_react_1.Lightbulb },
    celebrate: { label: "Celebrate", icon: lucide_react_1.PartyPopper },
};
function compactCount(value) {
    return new Intl.NumberFormat(undefined, { notation: value >= 1000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}
function SectionEngagementBar(_a) {
    var _this = this;
    var _b, _c;
    var issueSlug = _a.issueSlug, pageSlug = _a.pageSlug, sectionId = _a.sectionId, sectionSlug = _a.sectionSlug, _d = _a.authenticated, authenticated = _d === void 0 ? false : _d, config = _a.config, _e = _a.variant, variant = _e === void 0 ? "inline" : _e, _f = _a.appearance, appearance = _f === void 0 ? "auto" : _f;
    var session = auth_client_1.authClient.useSession().data;
    var viewerAuthenticated = Boolean(session === null || session === void 0 ? void 0 : session.user) || authenticated;
    var viewerId = (_c = (_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : null;
    var enabled = {
        reactions: (config === null || config === void 0 ? void 0 : config.reactions) !== false,
        comments: (config === null || config === void 0 ? void 0 : config.comments) !== false,
        share: (config === null || config === void 0 ? void 0 : config.share) !== false,
        save: (config === null || config === void 0 ? void 0 : config.save) !== false,
    };
    var _g = (0, react_1.useState)(EMPTY_SUMMARY), summary = _g[0], setSummary = _g[1];
    var _h = (0, react_1.useState)([]), comments = _h[0], setComments = _h[1];
    var _j = (0, react_1.useState)(""), commentBody = _j[0], setCommentBody = _j[1];
    var _k = (0, react_1.useState)(false), reactionOpen = _k[0], setReactionOpen = _k[1];
    var _l = (0, react_1.useState)(false), commentOpen = _l[0], setCommentOpen = _l[1];
    var _m = (0, react_1.useState)(false), shareOpen = _m[0], setShareOpen = _m[1];
    var _o = (0, react_1.useState)(false), saveOpen = _o[0], setSaveOpen = _o[1];
    var _p = (0, react_1.useState)([]), collections = _p[0], setCollections = _p[1];
    var _q = (0, react_1.useState)([]), savedCollectionIds = _q[0], setSavedCollectionIds = _q[1];
    var _r = (0, react_1.useState)(""), newCollectionName = _r[0], setNewCollectionName = _r[1];
    var _s = (0, react_1.useState)(false), authOpen = _s[0], setAuthOpen = _s[1];
    var _t = (0, react_1.useState)(false), busy = _t[0], setBusy = _t[1];
    var _u = (0, react_1.useState)(false), copied = _u[0], setCopied = _u[1];
    var rootRef = (0, react_1.useRef)(null);
    var shareButtonRef = (0, react_1.useRef)(null);
    var _v = (0, react_1.useState)(null), sharePopoverPosition = _v[0], setSharePopoverPosition = _v[1];
    var _w = (0, react_1.useState)(undefined), inlinePosition = _w[0], setInlinePosition = _w[1];
    (0, react_1.useLayoutEffect)(function () {
        if (variant !== "inline")
            return;
        var root = rootRef.current;
        if (!root)
            return;
        var place = function () {
            var _a, _b;
            var coverOverlay = root.closest(".xp-cover-story-engagement");
            if (coverOverlay) {
                var storyNode = coverOverlay.closest("[data-composer-node][data-story-id]");
                if (!storyNode)
                    return;
                var nodeRect = storyNode.getBoundingClientRect();
                var scaleX_1 = nodeRect.width / Math.max(1, storyNode.offsetWidth || nodeRect.width);
                var scaleY_1 = nodeRect.height / Math.max(1, storyNode.offsetHeight || nodeRect.height);
                var contentEls = Array.from(storyNode.querySelectorAll("h1,h2,h3,p,span"))
                    .filter(function (el) { return !el.closest(".xp-cover-story-engagement") && el.getClientRects().length > 0; });
                if (!contentEls.length)
                    return;
                var rects = contentEls.map(function (el) { return el.getBoundingClientRect(); }).filter(function (rect) { return rect.width > 0 && rect.height > 0; });
                if (!rects.length)
                    return;
                var left_1 = Math.min.apply(Math, rects.map(function (rect) { return rect.left; }));
                var bottom = Math.max.apply(Math, rects.map(function (rect) { return rect.bottom; }));
                var safe_1 = 8;
                coverOverlay.style.left = "".concat(Math.max(safe_1, (left_1 - nodeRect.left) / Math.max(scaleX_1, .001)), "px");
                coverOverlay.style.top = "".concat(Math.max(safe_1, (bottom - nodeRect.top) / Math.max(scaleY_1, .001) + 8), "px");
                coverOverlay.style.maxWidth = "calc(100% - ".concat(safe_1 * 2, "px)");
                return;
            }
            var section = root.closest("[data-magazine-section]");
            if (!section)
                return;
            var sectionRect = section.getBoundingClientRect();
            var scaleX = sectionRect.width / Math.max(1, section.offsetWidth || sectionRect.width);
            var scaleY = sectionRect.height / Math.max(1, section.offsetHeight || sectionRect.height);
            var headings = Array.from(section.querySelectorAll("h1,h2,h3"))
                .filter(function (el) { return !el.closest(".xp-section-engagement") && el.getClientRects().length > 0; });
            var heading = headings[0];
            if (!heading) {
                setInlinePosition(undefined);
                return;
            }
            var headingRect = heading.getBoundingClientRect();
            var paragraphs = Array.from(section.querySelectorAll("p"))
                .filter(function (el) { return !el.closest(".xp-section-engagement") && el.getClientRects().length > 0; })
                .map(function (el) { return ({ el: el, rect: el.getBoundingClientRect() }); })
                .filter(function (_a) {
                var rect = _a.rect;
                return rect.top >= headingRect.bottom - 2 && rect.top < headingRect.bottom + sectionRect.height * .28;
            });
            var descriptionRect = (_a = paragraphs[0]) === null || _a === void 0 ? void 0 : _a.rect;
            var anchorBottom = Math.max(headingRect.bottom, (_b = descriptionRect === null || descriptionRect === void 0 ? void 0 : descriptionRect.bottom) !== null && _b !== void 0 ? _b : headingRect.bottom);
            var safe = 12;
            var rootWidth = root.getBoundingClientRect().width / Math.max(scaleX, .001);
            var sectionWidth = section.offsetWidth || sectionRect.width;
            var rawLeft = (headingRect.left - sectionRect.left) / Math.max(scaleX, .001);
            var left = Math.min(Math.max(safe, rawLeft), Math.max(safe, sectionWidth - rootWidth - safe));
            var rootHeight = root.getBoundingClientRect().height / Math.max(scaleY, .001);
            var sectionHeight = section.offsetHeight || sectionRect.height;
            var rawTop = (anchorBottom - sectionRect.top) / Math.max(scaleY, .001) + 10;
            var top = Math.min(Math.max(safe, rawTop), Math.max(safe, sectionHeight - rootHeight - safe));
            setInlinePosition({ position: "absolute", left: left, right: "auto", top: top, bottom: "auto", maxWidth: "calc(100% - ".concat(safe * 2, "px)") });
        };
        place();
        var section = root.closest("[data-magazine-section]");
        var observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(place) : null;
        if (section)
            observer === null || observer === void 0 ? void 0 : observer.observe(section);
        window.addEventListener("resize", place);
        return function () {
            observer === null || observer === void 0 ? void 0 : observer.disconnect();
            window.removeEventListener("resize", place);
        };
    }, [variant]);
    var endpoint = (0, react_1.useMemo)(function () { return "/api/engagement/".concat(encodeURIComponent(issueSlug), "/").concat(encodeURIComponent(pageSlug), "/").concat(encodeURIComponent(sectionId)); }, [issueSlug, pageSlug, sectionId]);
    var request = (0, react_1.useCallback)(function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (path, init) {
            var response;
            if (path === void 0) { path = ""; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(endpoint).concat(path), __assign(__assign({ credentials: "include" }, init), { headers: __assign({ "Content-Type": "application/json" }, ((init === null || init === void 0 ? void 0 : init.headers) || {})) }))];
                    case 1:
                        response = _a.sent();
                        if (response.status === 401) {
                            setAuthOpen(true);
                            throw new Error("Authentication required");
                        }
                        if (!response.ok)
                            throw new Error("Engagement request failed (".concat(response.status, ")"));
                        return [2 /*return*/, response.json()];
                }
            });
        });
    }, [endpoint]);
    (0, react_1.useEffect)(function () {
        var alive = true;
        request().then(function (payload) { if (alive && (payload === null || payload === void 0 ? void 0 : payload.summary))
            setSummary(payload.summary); }).catch(function () { return undefined; });
        return function () { alive = false; };
    }, [request]);
    (0, react_1.useEffect)(function () {
        var close = function (event) {
            var _a;
            if (!((_a = rootRef.current) === null || _a === void 0 ? void 0 : _a.contains(event.target))) {
                setReactionOpen(false);
                setShareOpen(false);
                setSaveOpen(false);
            }
        };
        window.addEventListener("pointerdown", close);
        return function () { return window.removeEventListener("pointerdown", close); };
    }, []);
    (0, react_1.useEffect)(function () {
        if (!commentOpen && !saveOpen)
            return;
        var onKey = function (event) {
            if (event.key !== "Escape")
                return;
            if (saveOpen)
                setSaveOpen(false);
            if (commentOpen)
                setCommentOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return function () { return window.removeEventListener("keydown", onKey); };
    }, [commentOpen, saveOpen]);
    var requireAuth = function () {
        if (viewerAuthenticated)
            return true;
        setReactionOpen(false);
        setShareOpen(false);
        setSaveOpen(false);
        setAuthOpen(true);
        return false;
    };
    var chooseReaction = function (reaction) { return __awaiter(_this, void 0, void 0, function () {
        var previous, nextReaction, payload, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!requireAuth() || busy)
                        return [2 /*return*/];
                    previous = summary;
                    nextReaction = summary.viewerReaction === reaction ? null : reaction;
                    setReactionOpen(false);
                    setSummary(function (current) {
                        var reactions = __assign({}, current.reactions);
                        if (current.viewerReaction)
                            reactions[current.viewerReaction] = Math.max(0, reactions[current.viewerReaction] - 1);
                        if (nextReaction)
                            reactions[nextReaction] += 1;
                        return __assign(__assign({}, current), { reactions: reactions, totalReactions: Object.values(reactions).reduce(function (a, b) { return a + b; }, 0), viewerReaction: nextReaction });
                    });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    setBusy(true);
                    return [4 /*yield*/, request("/reaction", { method: "PUT", body: JSON.stringify({ reaction: nextReaction }) })];
                case 2:
                    payload = _b.sent();
                    if (payload === null || payload === void 0 ? void 0 : payload.summary)
                        setSummary(payload.summary);
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    setSummary(previous);
                    return [3 /*break*/, 5];
                case 4:
                    setBusy(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var openComments = function () { return __awaiter(_this, void 0, void 0, function () {
        var payload, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!requireAuth())
                        return [2 /*return*/];
                    setCommentOpen(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, request("/comments")];
                case 2:
                    payload = _c.sent();
                    setComments((_b = payload === null || payload === void 0 ? void 0 : payload.comments) !== null && _b !== void 0 ? _b : []);
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var postComment = function () { return __awaiter(_this, void 0, void 0, function () {
        var body, payload_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = commentBody.trim();
                    if (!body || busy || !requireAuth())
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    setBusy(true);
                    return [4 /*yield*/, request("/comments", { method: "POST", body: JSON.stringify({ body: body }) })];
                case 2:
                    payload_1 = _a.sent();
                    if (payload_1 === null || payload_1 === void 0 ? void 0 : payload_1.comment) {
                        setComments(function (items) { return __spreadArray(__spreadArray([], items, true), [payload_1.comment], false); });
                        setSummary(function (current) { return (__assign(__assign({}, current), { comments: current.comments + 1 })); });
                        setCommentBody("");
                    }
                    return [3 /*break*/, 4];
                case 3:
                    setBusy(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var deleteComment = function (commentId) { return __awaiter(_this, void 0, void 0, function () {
        var payload;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!viewerAuthenticated || busy)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    setBusy(true);
                    return [4 /*yield*/, request("/comments/".concat(encodeURIComponent(commentId)), { method: "DELETE" })];
                case 2:
                    payload = _a.sent();
                    if (payload === null || payload === void 0 ? void 0 : payload.ok) {
                        setComments(function (items) { return items.filter(function (item) { return item.id !== commentId; }); });
                        if (payload === null || payload === void 0 ? void 0 : payload.summary)
                            setSummary(payload.summary);
                        else
                            setSummary(function (current) { return (__assign(__assign({}, current), { comments: Math.max(0, current.comments - 1) })); });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    setBusy(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var recordShare = function (channel) { return __awaiter(_this, void 0, void 0, function () {
        var payload, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!requireAuth())
                        return [2 /*return*/, false];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, request("/share", { method: "POST", body: JSON.stringify({ channel: channel }) })];
                case 2:
                    payload = _b.sent();
                    if (payload === null || payload === void 0 ? void 0 : payload.summary)
                        setSummary(payload.summary);
                    return [2 /*return*/, true];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var sectionUrl = function () { return "".concat(window.location.origin, "/magazine/").concat(encodeURIComponent(issueSlug), "/").concat(encodeURIComponent(pageSlug), "#").concat(encodeURIComponent(sectionSlug)); };
    var nativeShare = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!requireAuth())
                        return [2 /*return*/];
                    if (!(typeof navigator !== "undefined" && navigator.share)) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, navigator.share({ title: "XpoMag", text: "Worth a look on XpoMag", url: sectionUrl() })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, recordShare("native")];
                case 3:
                    _a.sent();
                    setShareOpen(false);
                    return [2 /*return*/];
                case 4:
                    error_1 = _a.sent();
                    if ((error_1 === null || error_1 === void 0 ? void 0 : error_1.name) === "AbortError")
                        return [2 /*return*/];
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, copyLink()];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var copyLink = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, recordShare("copy")];
                case 1:
                    if (!(_a.sent()))
                        return [2 /*return*/];
                    return [4 /*yield*/, navigator.clipboard.writeText(sectionUrl())];
                case 2:
                    _a.sent();
                    setCopied(true);
                    setTimeout(function () { return setCopied(false); }, 1400);
                    return [2 /*return*/];
            }
        });
    }); };
    var shareTo = function (channel) { return __awaiter(_this, void 0, void 0, function () {
        var url, text, targets;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, recordShare(channel)];
                case 1:
                    if (!(_a.sent()))
                        return [2 /*return*/];
                    url = encodeURIComponent(sectionUrl());
                    text = encodeURIComponent("Worth a look on XpoMag");
                    targets = {
                        linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=".concat(url),
                        facebook: "https://www.facebook.com/sharer/sharer.php?u=".concat(url),
                        x: "https://x.com/intent/post?url=".concat(url, "&text=").concat(text),
                        whatsapp: "https://wa.me/?text=".concat(text, "%20").concat(url),
                        email: "mailto:?subject=".concat(encodeURIComponent("XpoMag"), "&body=").concat(text, "%0A%0A").concat(url),
                    };
                    window.open(targets[channel], "_blank", "noopener,noreferrer,width=720,height=620");
                    setShareOpen(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var loadSaveCollections = function () { return __awaiter(_this, void 0, void 0, function () {
        var payload, _a;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!requireAuth())
                        return [2 /*return*/, false];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, request("/save/collections")];
                case 2:
                    payload = _d.sent();
                    setCollections((_b = payload === null || payload === void 0 ? void 0 : payload.collections) !== null && _b !== void 0 ? _b : []);
                    setSavedCollectionIds((_c = payload === null || payload === void 0 ? void 0 : payload.savedCollectionIds) !== null && _c !== void 0 ? _c : []);
                    return [2 /*return*/, true];
                case 3:
                    _a = _d.sent();
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var openSavePicker = function () { return __awaiter(_this, void 0, void 0, function () {
        var next;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!requireAuth() || busy)
                        return [2 /*return*/];
                    setShareOpen(false);
                    setReactionOpen(false);
                    next = !saveOpen;
                    setSaveOpen(next);
                    if (!next) return [3 /*break*/, 2];
                    return [4 /*yield*/, loadSaveCollections()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var updateSavedCollections = function (nextIds) { return __awaiter(_this, void 0, void 0, function () {
        var previousIds, previousSummary, payload, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (busy)
                        return [2 /*return*/];
                    previousIds = savedCollectionIds;
                    previousSummary = summary;
                    setSavedCollectionIds(nextIds);
                    setSummary(function (current) { return (__assign(__assign({}, current), { viewerSaved: nextIds.length > 0, saves: Math.max(0, current.saves + (previousIds.length === 0 && nextIds.length > 0 ? 1 : previousIds.length > 0 && nextIds.length === 0 ? -1 : 0)) })); });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    setBusy(true);
                    return [4 /*yield*/, request("/save", { method: "PUT", body: JSON.stringify({ collectionIds: nextIds }) })];
                case 2:
                    payload = _b.sent();
                    if (payload === null || payload === void 0 ? void 0 : payload.summary)
                        setSummary(payload.summary);
                    if (payload === null || payload === void 0 ? void 0 : payload.collections)
                        setCollections(payload.collections);
                    if (payload === null || payload === void 0 ? void 0 : payload.savedCollectionIds)
                        setSavedCollectionIds(payload.savedCollectionIds);
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    setSavedCollectionIds(previousIds);
                    setSummary(previousSummary);
                    return [3 /*break*/, 5];
                case 4:
                    setBusy(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var toggleCollection = function (collectionId) { return __awaiter(_this, void 0, void 0, function () {
        var nextIds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nextIds = savedCollectionIds.includes(collectionId)
                        ? savedCollectionIds.filter(function (id) { return id !== collectionId; })
                        : __spreadArray(__spreadArray([], savedCollectionIds, true), [collectionId], false);
                    return [4 /*yield*/, updateSavedCollections(nextIds)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var createSaveCollection = function () { return __awaiter(_this, void 0, void 0, function () {
        var name, response, payload_2, nextIds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    name = newCollectionName.trim();
                    if (!name || busy)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 6, 7]);
                    setBusy(true);
                    return [4 /*yield*/, fetch("/api/engagement/collections", {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name: name }),
                        })];
                case 2:
                    response = _a.sent();
                    if (response.status === 401) {
                        setAuthOpen(true);
                        return [2 /*return*/];
                    }
                    if (!response.ok)
                        throw new Error("Collection request failed (".concat(response.status, ")"));
                    return [4 /*yield*/, response.json()];
                case 3:
                    payload_2 = _a.sent();
                    if (!(payload_2 === null || payload_2 === void 0 ? void 0 : payload_2.collection)) return [3 /*break*/, 5];
                    setCollections(function (items) { return __spreadArray([payload_2.collection], items.filter(function (item) { return item.id !== payload_2.collection.id; }), true); });
                    setNewCollectionName("");
                    nextIds = __spreadArray([], new Set(__spreadArray(__spreadArray([], savedCollectionIds, true), [payload_2.collection.id], false)), true);
                    setBusy(false);
                    return [4 /*yield*/, updateSavedCollections(nextIds)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
                case 5: return [3 /*break*/, 7];
                case 6:
                    setBusy(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useLayoutEffect)(function () {
        if (!shareOpen) {
            setSharePopoverPosition(null);
            return;
        }
        var placeSharePopover = function () {
            var button = shareButtonRef.current;
            if (!button)
                return;
            var rect = button.getBoundingClientRect();
            var viewportPadding = 12;
            var width = Math.min(196, Math.max(164, window.innerWidth - viewportPadding * 2));
            var estimatedHeight = 252;
            var maxHeight = Math.max(160, window.innerHeight - viewportPadding * 2);
            var aboveTop = rect.top - estimatedHeight - 10;
            var belowTop = rect.bottom + 10;
            var top = aboveTop >= viewportPadding
                ? aboveTop
                : Math.min(belowTop, window.innerHeight - Math.min(estimatedHeight, maxHeight) - viewportPadding);
            var desiredLeft = rect.left + rect.width / 2 - width / 2;
            var left = Math.min(Math.max(viewportPadding, desiredLeft), Math.max(viewportPadding, window.innerWidth - width - viewportPadding));
            setSharePopoverPosition({ left: left, top: Math.max(viewportPadding, top), width: width, maxHeight: maxHeight });
        };
        placeSharePopover();
        window.addEventListener("resize", placeSharePopover);
        window.addEventListener("scroll", placeSharePopover, true);
        return function () {
            window.removeEventListener("resize", placeSharePopover);
            window.removeEventListener("scroll", placeSharePopover, true);
        };
    }, [shareOpen]);
    var selectedReaction = summary.viewerReaction ? reactionMeta[summary.viewerReaction] : reactionMeta.like;
    var SelectedReactionIcon = selectedReaction.icon;
    return (<div ref={rootRef} className={"xp-section-engagement xp-section-engagement--".concat(variant)} data-appearance={appearance} style={variant === "inline" ? inlinePosition : undefined} onPointerDown={function (event) { return event.stopPropagation(); }} onClick={function (event) { return event.stopPropagation(); }}>
      {variant === "panel" ? (<>
          <div className="xp-engagement__summary" aria-live="polite">
            <div className="xp-engagement__reaction-summary">
              {summary.totalReactions > 0 ? <span className="xp-engagement__reaction-stack" aria-hidden="true"><span>👍</span><span>❤️</span><span>👏</span></span> : null}
              <span>{summary.totalReactions ? compactCount(summary.totalReactions) : "Be the first to react"}</span>
            </div>
            <div className="xp-engagement__summary-right">
              {summary.comments > 0 ? <span>{compactCount(summary.comments)} comment{summary.comments === 1 ? "" : "s"}</span> : null}
              {summary.shares > 0 ? <span>{compactCount(summary.shares)} share{summary.shares === 1 ? "" : "s"}</span> : null}
            </div>
          </div>
          <div className="xp-engagement__rule"/>
        </>) : null}

      <div className="xp-engagement__actions">
        {enabled.reactions ? (<div className="xp-engagement__reaction-wrap" onPointerEnter={function () { return setReactionOpen(true); }} onPointerLeave={function () { return setReactionOpen(false); }}>
            <button type="button" className={"xp-engagement__action ".concat(summary.viewerReaction ? "is-active" : "")} onClick={function () { var _a; return chooseReaction((_a = summary.viewerReaction) !== null && _a !== void 0 ? _a : "like"); }} aria-label={summary.viewerReaction ? "Remove ".concat(selectedReaction.label, " reaction") : "React to this story"}>
              <SelectedReactionIcon size={variant === "inline" ? 12 : 17}/>
              {variant === "inline" ? <span>{compactCount(summary.totalReactions)}</span> : <span>{summary.viewerReaction ? selectedReaction.label : "Like"}</span>}
            </button>
            <div className={"xp-engagement__reactions ".concat(reactionOpen ? "is-open" : "")} role="menu" aria-hidden={!reactionOpen}>
              {Object.keys(reactionMeta).map(function (reaction, index) {
                var meta = reactionMeta[reaction];
                var Icon = meta.icon;
                return <button key={reaction} type="button" role="menuitem" className={"xp-engagement__reaction ".concat(summary.viewerReaction === reaction ? "is-selected" : "")} style={{ "--reaction-index": index }} onClick={function () { return chooseReaction(reaction); }} title={meta.label}><Icon size={20}/><span>{meta.label}</span></button>;
            })}
            </div>
          </div>) : null}

        {enabled.comments ? <button type="button" className="xp-engagement__action" onClick={openComments} aria-label={"".concat(summary.comments, " comments")}><lucide_react_1.MessageCircle size={variant === "inline" ? 12 : 17}/><span>{variant === "inline" ? compactCount(summary.comments) : "Comment"}</span></button> : null}

        {enabled.share ? (<div className="xp-engagement__popover-wrap">
            <button ref={shareButtonRef} type="button" className="xp-engagement__action" onClick={function () { if (requireAuth())
            setShareOpen(function (value) { return !value; }); }} aria-expanded={shareOpen} aria-label={"".concat(summary.shares, " shares")}><lucide_react_1.Share2 size={variant === "inline" ? 12 : 17}/><span>{variant === "inline" ? compactCount(summary.shares) : "Share"}</span></button>
            {typeof document !== "undefined" && shareOpen && sharePopoverPosition ? (0, react_dom_1.createPortal)(<div className="xp-engagement__share-popover xp-engagement__share-popover--portal" role="menu" style={{ left: sharePopoverPosition.left, top: sharePopoverPosition.top, width: sharePopoverPosition.width, maxHeight: sharePopoverPosition.maxHeight }} onPointerDown={function (event) { return event.stopPropagation(); }} onClick={function (event) { return event.stopPropagation(); }}>
                {typeof navigator !== "undefined" && navigator.share ? <button type="button" onClick={nativeShare}><lucide_react_1.Share2 size={16}/><span>Share…</span></button> : null}
                <button type="button" onClick={copyLink}>{copied ? <lucide_react_1.Check size={16}/> : <lucide_react_1.Copy size={16}/>}<span>{copied ? "Copied" : "Copy link"}</span></button>
                <button type="button" onClick={function () { return shareTo("linkedin"); }}><span className="xp-engagement__network">in</span><span>LinkedIn</span></button>
                <button type="button" onClick={function () { return shareTo("facebook"); }}><span className="xp-engagement__network">f</span><span>Facebook</span></button>
                <button type="button" onClick={function () { return shareTo("x"); }}><span className="xp-engagement__network">𝕏</span><span>X</span></button>
                <button type="button" onClick={function () { return shareTo("whatsapp"); }}><span className="xp-engagement__network">W</span><span>WhatsApp</span></button>
                <button type="button" onClick={function () { return shareTo("email"); }}><lucide_react_1.Send size={16}/><span>Email</span></button>
              </div>, document.body) : null}
          </div>) : null}

        {enabled.save ? (<div className="xp-engagement__popover-wrap">
            <button type="button" className={"xp-engagement__action ".concat(summary.viewerSaved ? "is-active" : "")} onClick={openSavePicker} aria-expanded={saveOpen} aria-label={summary.viewerSaved ? "Saved by ".concat(summary.saves) : "".concat(summary.saves, " saves")}><lucide_react_1.Bookmark size={variant === "inline" ? 12 : 17} fill={summary.viewerSaved ? "currentColor" : "none"}/><span>{variant === "inline" ? compactCount(summary.saves) : summary.viewerSaved ? "Saved" : "Save"}</span></button>
          </div>) : null}
      </div>


      {typeof document !== "undefined" && saveOpen ? (0, react_dom_1.createPortal)(<div className="xp-engagement__save-backdrop" role="presentation" onMouseDown={function (event) { if (event.target === event.currentTarget)
            setSaveOpen(false); }}>
          <section className="xp-engagement__save-drawer" role="dialog" aria-modal="true" aria-label="Save to collection">
            <header className="xp-engagement__save-drawer-head">
              <div>
                <span className="xp-engagement__eyebrow">Collections</span>
                <h2>Save to collection</h2>
                <p>{savedCollectionIds.length ? "".concat(savedCollectionIds.length, " selected") : "Choose one or more collections."}</p>
              </div>
              <button type="button" onClick={function () { return setSaveOpen(false); }} aria-label="Close save panel"><lucide_react_1.X size={19}/></button>
            </header>

            <div className="xp-engagement__save-drawer-body">
              <div className="xp-engagement__collection-list">
                {collections.length ? collections.map(function (collection) {
                var selected = savedCollectionIds.includes(collection.id);
                return <button key={collection.id} type="button" className={selected ? "is-selected" : ""} onClick={function () { return toggleCollection(collection.id); }}><span className="xp-engagement__collection-check">{selected ? <lucide_react_1.Check size={13}/> : null}</span><span className="xp-engagement__collection-copy"><strong>{collection.name}</strong><small>{collection.itemCount} saved</small></span></button>;
            }) : <div className="xp-engagement__collection-empty"><lucide_react_1.Bookmark size={21}/><strong>No collections yet</strong><span>Create your first collection below.</span></div>}
              </div>
            </div>

            <footer className="xp-engagement__save-drawer-footer">
              <div className="xp-engagement__collection-create"><lucide_react_1.FolderPlus size={17}/><input value={newCollectionName} onChange={function (event) { return setNewCollectionName(event.target.value); }} onKeyDown={function (event) { if (event.key === "Enter")
            createSaveCollection(); }} placeholder="Create a new collection" maxLength={80}/><button type="button" onClick={createSaveCollection} disabled={!newCollectionName.trim() || busy}>Create</button></div>
              <button className="xp-engagement__save-done" type="button" onClick={function () { return setSaveOpen(false); }}>Done</button>
            </footer>
          </section>
        </div>, document.body) : null}

      {typeof document !== "undefined" && commentOpen ? (0, react_dom_1.createPortal)(<div className="xp-engagement__modal-backdrop" role="presentation" onMouseDown={function (event) { if (event.target === event.currentTarget)
            setCommentOpen(false); }}>
          <section className="xp-engagement__comment-modal" role="dialog" aria-modal="true" aria-label="Comments">
            <header><div><strong>Comments</strong><span>{summary.comments ? "".concat(summary.comments, " responses") : "Start the conversation"}</span></div><button type="button" onClick={function () { return setCommentOpen(false); }} aria-label="Close comments"><lucide_react_1.X size={19}/></button></header>
            <div className="xp-engagement__comment-list">
              {comments.length ? comments.map(function (comment) { return <article key={comment.id} className="xp-engagement__comment"><div className="xp-engagement__avatar">{(comment.userName || "Member").slice(0, 1).toUpperCase()}</div><div><div className="xp-engagement__comment-meta"><strong>{comment.userName || "Member"}</strong><span><time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleDateString()}</time>{viewerId === comment.userId ? <button type="button" className="xp-engagement__comment-delete" onClick={function () { return deleteComment(comment.id); }}>Delete</button> : null}</span></div><p>{comment.body}</p></div></article>; }) : <div className="xp-engagement__empty"><lucide_react_1.MessageCircle size={24}/><strong>No comments yet</strong><span>Be the first person to add something useful.</span></div>}
            </div>
            <footer className="xp-engagement__composer"><textarea value={commentBody} onChange={function (event) { return setCommentBody(event.target.value); }} placeholder="Write a comment…" maxLength={2000} rows={2}/><button type="button" onClick={postComment} disabled={!commentBody.trim() || busy} aria-label="Post comment"><lucide_react_1.Send size={17}/></button></footer>
          </section>
        </div>, document.body) : null}

      {typeof document !== "undefined" && authOpen ? (0, react_dom_1.createPortal)(<div className="xp-engagement__modal-backdrop" role="presentation" onMouseDown={function (event) { if (event.target === event.currentTarget)
            setAuthOpen(false); }}>
          <section className="xp-engagement__auth-modal" role="dialog" aria-modal="true" aria-label="Sign in required">
            <button className="xp-engagement__modal-close" type="button" onClick={function () { return setAuthOpen(false); }} aria-label="Close"><lucide_react_1.X size={18}/></button>
            <div className="xp-engagement__auth-icon"><lucide_react_1.Link2 size={21}/></div>
            <p className="xp-engagement__eyebrow">XpoMag membership</p>
            <h2>Join the conversation.</h2>
            <p>Sign in to react, comment, share stories and save sections to your collections.</p>
            <a className="xp-engagement__auth-primary" href={"/login?returnTo=".concat(encodeURIComponent(window.location.pathname + window.location.hash))}>Sign in <lucide_react_1.ChevronRight size={17}/></a>
            <a className="xp-engagement__auth-secondary" href={"/signup?returnTo=".concat(encodeURIComponent(window.location.pathname + window.location.hash))}>Create free account</a>
          </section>
        </div>, document.body) : null}
    </div>);
}
