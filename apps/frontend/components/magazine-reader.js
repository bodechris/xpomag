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
exports.MagazineReader = MagazineReader;
var magazine_1 = require("@xpomag/magazine");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var magazine_resource_preloader_1 = require("./magazine-resource-preloader");
var section_engagement_1 = require("./section-engagement");
var MOTION_MS = 560;
var TURN_THRESHOLD = 0.22;
var FLICK_DISTANCE = 44;
var FLICK_VELOCITY = 0.34;
var INTERACTIVE_SELECTOR = [
    "a",
    "button",
    "input",
    "textarea",
    "select",
    "option",
    "label",
    "[role=button]",
    "[role=link]",
    "[role=dialog]",
    "[contenteditable=true]",
    "[data-story-id]",
    ".xp-section-engagement",
    "[data-no-page-turn]",
].join(",");
function isInteractiveTarget(target) {
    return target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR));
}
function buildSpreads(pageCount, singlePage) {
    if (singlePage) {
        return Array.from({ length: pageCount }, function (_, index) { return ({ id: "spread-".concat(index), pageIndexes: [index] }); });
    }
    var spreads = [{ id: "spread-cover", pageIndexes: [0] }];
    for (var index = 1; index < pageCount; index += 2) {
        spreads.push({ id: "spread-".concat(index), pageIndexes: [index, index + 1].filter(function (i) { return i < pageCount; }) });
    }
    return spreads;
}
function transitionKind(singlePage, from, to) {
    if (!singlePage)
        return "flip";
    var boundary = Math.min(from, to);
    return boundary % 2 === 0 ? "flip" : "slide";
}
function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}
function MagazineReader(_a) {
    var _this = this;
    var _b, _c;
    var issue = _a.issue, initialPageSlug = _a.initialPageSlug, _d = _a.viewerAuthenticated, viewerAuthenticated = _d === void 0 ? false : _d;
    var _e = (0, react_1.useState)(false), singlePageMode = _e[0], setSinglePageMode = _e[1];
    var spreads = (0, react_1.useMemo)(function () { return buildSpreads(issue.pages.length, singlePageMode); }, [issue.pages.length, singlePageMode]);
    var _f = (0, react_1.useState)(0), spreadIndex = _f[0], setSpreadIndex = _f[1];
    var initialPageIndex = Math.max(0, issue.pages.findIndex(function (page) { return page.slug === initialPageSlug; }));
    var _g = (0, react_1.useState)(null), motion = _g[0], setMotion = _g[1];
    var _h = (0, react_1.useState)(false), isFullscreen = _h[0], setIsFullscreen = _h[1];
    var pointerStartX = (0, react_1.useRef)(null);
    var pointerStartY = (0, react_1.useRef)(null);
    var pointerCurrentX = (0, react_1.useRef)(null);
    var pointerStartTime = (0, react_1.useRef)(0);
    var gestureAxis = (0, react_1.useRef)(null);
    var suppressClick = (0, react_1.useRef)(false);
    var progressRef = (0, react_1.useRef)(0);
    var motionTimer = (0, react_1.useRef)(null);
    var afterMotionRef = (0, react_1.useRef)(null);
    var readerRef = (0, react_1.useRef)(null);
    var stageRef = (0, react_1.useRef)(null);
    var pointerGuideRef = (0, react_1.useRef)(null);
    // Responsive mode changes rebuild the spread array (desktop spreads <-> mobile pages).
    // React renders once before the effect below can clamp spreadIndex, so always
    // derive a safe index synchronously to avoid reading pageIndexes from undefined.
    var maxSpreadIndex = Math.max(0, spreads.length - 1);
    var safeSpreadIndex = Math.min(Math.max(0, spreadIndex), maxSpreadIndex);
    var spread = spreads[safeSpreadIndex];
    var targetSpread = motion
        ? (_b = spreads[Math.min(Math.max(0, motion.targetIndex), maxSpreadIndex)]) !== null && _b !== void 0 ? _b : null
        : null;
    if (!spread)
        return null;
    var activePages = spread.pageIndexes.map(function (index) { return (__assign(__assign({}, issue.pages[index]), { index: index })); });
    var firstPage = activePages[0];
    var canGoBack = safeSpreadIndex > 0;
    var canGoForward = safeSpreadIndex < maxSpreadIndex;
    var setProgress = (0, react_1.useCallback)(function (value) {
        var _a;
        var next = clamp01(value);
        progressRef.current = next;
        (_a = stageRef.current) === null || _a === void 0 ? void 0 : _a.style.setProperty("--xp-turn-progress", String(next));
    }, []);
    var clearMotionTimer = (0, react_1.useCallback)(function () {
        if (motionTimer.current) {
            clearTimeout(motionTimer.current);
            motionTimer.current = null;
        }
    }, []);
    var completeMotion = (0, react_1.useCallback)(function (commit, targetIndex) {
        clearMotionTimer();
        motionTimer.current = setTimeout(function () {
            if (commit)
                setSpreadIndex(targetIndex);
            setMotion(null);
            setProgress(0);
            motionTimer.current = null;
            var afterMotion = afterMotionRef.current;
            afterMotionRef.current = null;
            if (commit)
                afterMotion === null || afterMotion === void 0 ? void 0 : afterMotion();
        }, MOTION_MS);
    }, [clearMotionTimer, setProgress]);
    var animateMotion = (0, react_1.useCallback)(function (current, commit) {
        setMotion(__assign(__assign({}, current), { phase: "animating" }));
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { return setProgress(commit ? 1 : 0); });
        });
        completeMotion(commit, current.targetIndex);
    }, [completeMotion, setProgress]);
    var createMotion = (0, react_1.useCallback)(function (direction, phase) {
        var currentIndex = Math.min(Math.max(0, spreadIndex), Math.max(0, spreads.length - 1));
        var targetIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
        if (targetIndex < 0 || targetIndex >= spreads.length)
            return null;
        return {
            direction: direction,
            targetIndex: targetIndex,
            phase: phase,
            kind: transitionKind(singlePageMode, currentIndex, targetIndex),
        };
    }, [singlePageMode, spreadIndex, spreads.length]);
    var animateToSpread = (0, react_1.useCallback)(function (targetIndex, afterMotion) {
        if (motion)
            return false;
        var currentIndex = Math.min(Math.max(0, spreadIndex), Math.max(0, spreads.length - 1));
        if (targetIndex < 0 || targetIndex >= spreads.length)
            return false;
        if (targetIndex === currentIndex) {
            afterMotion === null || afterMotion === void 0 ? void 0 : afterMotion();
            return true;
        }
        var direction = targetIndex > currentIndex ? "next" : "previous";
        var nextMotion = {
            direction: direction,
            targetIndex: targetIndex,
            phase: "animating",
            // Direct jumps still look like a book turn rather than a hard teleport.
            kind: "flip",
        };
        clearMotionTimer();
        afterMotionRef.current = afterMotion !== null && afterMotion !== void 0 ? afterMotion : null;
        setProgress(0);
        setMotion(nextMotion);
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { return setProgress(1); });
        });
        completeMotion(true, targetIndex);
        return true;
    }, [clearMotionTimer, completeMotion, motion, setProgress, spreadIndex, spreads.length]);
    var openStoryTarget = (0, react_1.useCallback)(function (node) {
        var story = node.story;
        if (!story)
            return;
        var pageIndex = issue.pages.findIndex(function (page) { return page.slug === story.targetPageSlug; });
        if (pageIndex < 0)
            return;
        var targetSpreadIndex = spreads.findIndex(function (item) { return item.pageIndexes.includes(pageIndex); });
        if (targetSpreadIndex < 0)
            return;
        var finishStoryNavigation = function () {
            var nextPath = "/magazine/".concat(issue.slug, "/").concat(story.targetPageSlug, "#").concat(encodeURIComponent(story.targetSectionSlug));
            window.history.pushState(window.history.state, "", nextPath);
            requestAnimationFrame(function () { return requestAnimationFrame(function () {
                var _a;
                (_a = document.getElementById(story.targetSectionSlug)) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ block: "center", behavior: "smooth" });
            }); });
        };
        animateToSpread(targetSpreadIndex, finishStoryNavigation);
    }, [animateToSpread, issue.pages, issue.slug, spreads]);
    var navigate = (0, react_1.useCallback)(function (direction) {
        if (motion)
            return;
        var nextMotion = createMotion(direction, "animating");
        if (!nextMotion)
            return;
        clearMotionTimer();
        setProgress(0);
        setMotion(nextMotion);
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { return setProgress(1); });
        });
        completeMotion(true, nextMotion.targetIndex);
    }, [clearMotionTimer, completeMotion, createMotion, motion, setProgress]);
    (0, react_1.useEffect)(function () {
        var _a;
        var media = window.matchMedia("(max-width: 820px)");
        var sync = function () { return setSinglePageMode(media.matches); };
        sync();
        (_a = media.addEventListener) === null || _a === void 0 ? void 0 : _a.call(media, "change", sync);
        return function () { var _a; return (_a = media.removeEventListener) === null || _a === void 0 ? void 0 : _a.call(media, "change", sync); };
    }, []);
    (0, react_1.useEffect)(function () {
        var initialSpreadIndex = spreads.findIndex(function (item) { return item.pageIndexes.includes(initialPageIndex); });
        setSpreadIndex(function (current) { return initialPageSlug && initialSpreadIndex >= 0 ? initialSpreadIndex : Math.min(current, spreads.length - 1); });
        setMotion(null);
        setProgress(0);
    }, [initialPageIndex, initialPageSlug, setProgress, spreads]);
    (0, react_1.useEffect)(function () {
        var onKeyDown = function (event) {
            var target = event.target;
            if (target === null || target === void 0 ? void 0 : target.closest("button, a, input, textarea, select, [role='dialog'], [contenteditable='true']"))
                return;
            if (event.key === "ArrowRight" || event.key === "PageDown")
                navigate("next");
            if (event.key === "ArrowLeft" || event.key === "PageUp")
                navigate("previous");
        };
        window.addEventListener("keydown", onKeyDown);
        return function () { return window.removeEventListener("keydown", onKeyDown); };
    }, [navigate]);
    (0, react_1.useEffect)(function () { return function () { return clearMotionTimer(); }; }, [clearMotionTimer]);
    (0, react_1.useEffect)(function () {
        var onFullscreenChange = function () { return setIsFullscreen(Boolean(document.fullscreenElement)); };
        document.addEventListener("fullscreenchange", onFullscreenChange);
        return function () { return document.removeEventListener("fullscreenchange", onFullscreenChange); };
    }, []);
    (0, react_1.useEffect)(function () {
        if (!firstPage || motion)
            return;
        var hashValue = decodeURIComponent(window.location.hash.slice(1));
        var hashBelongsToActivePage = activePages.some(function (activePage) { return activePage.sections.some(function (section) { return section.slug === hashValue; }); });
        var hash = hashBelongsToActivePage ? window.location.hash : "";
        var requestedPageIsVisible = initialPageSlug && activePages.some(function (activePage) { return activePage.slug === initialPageSlug; });
        var routePageSlug = requestedPageIsVisible ? initialPageSlug : firstPage.slug;
        var nextPath = "/magazine/".concat(issue.slug, "/").concat(routePageSlug).concat(hash);
        if ("".concat(window.location.pathname).concat(window.location.hash) !== nextPath) {
            window.history.replaceState(window.history.state, "", nextPath);
        }
    }, [activePages, firstPage, initialPageSlug, issue.slug, motion]);
    (0, react_1.useEffect)(function () {
        if (!window.location.hash)
            return;
        var id = decodeURIComponent(window.location.hash.slice(1));
        requestAnimationFrame(function () { var _a; return (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ block: "center", behavior: "smooth" }); });
    }, [safeSpreadIndex]);
    (0, react_1.useEffect)(function () {
        var stage = stageRef.current;
        if (!stage)
            return;
        var raf = 0;
        var placeEngagementRails = function () {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(function () {
                var sections = stage.querySelectorAll(".xp-magazine__spread-layer--current [data-magazine-section]");
                sections.forEach(function (sectionEl) {
                    var bar = sectionEl.querySelector(":scope > .xp-section-engagement--inline");
                    if (!bar)
                        return;
                    var heading = sectionEl.querySelector("h1, h2, h3");
                    if (!heading) {
                        bar.removeAttribute("data-title-anchored");
                        bar.style.removeProperty("--xp-engagement-top");
                        bar.style.removeProperty("--xp-engagement-left");
                        return;
                    }
                    var sectionRect = sectionEl.getBoundingClientRect();
                    var headingRect = heading.getBoundingClientRect();
                    var paragraphs = Array.from(sectionEl.querySelectorAll("p"))
                        .filter(function (el) { return !el.closest(".xp-section-engagement"); })
                        .map(function (el) { return ({ el: el, rect: el.getBoundingClientRect() }); })
                        .filter(function (_a) {
                        var rect = _a.rect;
                        return rect.width > 0 && rect.height > 0;
                    });
                    var anchorBottom = headingRect.bottom;
                    var nearbyDeck = paragraphs
                        .filter(function (_a) {
                        var rect = _a.rect;
                        return rect.top >= headingRect.bottom - 8 && rect.top <= headingRect.bottom + Math.max(180, sectionRect.height * 0.24);
                    })
                        .sort(function (a, b) { return a.rect.top - b.rect.top; })[0];
                    if (nearbyDeck)
                        anchorBottom = Math.max(anchorBottom, nearbyDeck.rect.bottom);
                    var barRect = bar.getBoundingClientRect();
                    var safeInset = Math.max(10, Math.min(18, sectionRect.width * 0.025));
                    var desiredTop = anchorBottom - sectionRect.top + 10;
                    var maxTop = Math.max(safeInset, sectionRect.height - barRect.height - safeInset);
                    var top = Math.min(Math.max(safeInset, desiredTop), maxTop);
                    var candidates = Array.from(sectionEl.querySelectorAll("h1,h2,h3,p,[data-composer-node]"))
                        .filter(function (el) { return !el.closest(".xp-section-engagement") && el !== heading; })
                        .map(function (el) { return el.getBoundingClientRect(); })
                        .filter(function (rect) { return rect.width > 0 && rect.height > 0; });
                    var barTopAbs = sectionRect.top + top;
                    var barBottomAbs = barTopAbs + barRect.height;
                    var collision = candidates.some(function (rect) { return rect.top < barBottomAbs + 4 && rect.bottom > barTopAbs - 4 && rect.top >= anchorBottom - 2; });
                    if (collision)
                        top = maxTop;
                    var left = Math.min(Math.max(safeInset, headingRect.left - sectionRect.left), Math.max(safeInset, sectionRect.width - barRect.width - safeInset));
                    bar.style.setProperty("--xp-engagement-top", "".concat(Math.round(top), "px"));
                    bar.style.setProperty("--xp-engagement-left", "".concat(Math.round(left), "px"));
                    bar.setAttribute("data-title-anchored", "true");
                });
            });
        };
        placeEngagementRails();
        var resize = new ResizeObserver(placeEngagementRails);
        resize.observe(stage);
        window.addEventListener("resize", placeEngagementRails);
        return function () {
            cancelAnimationFrame(raf);
            resize.disconnect();
            window.removeEventListener("resize", placeEngagementRails);
        };
    }, [safeSpreadIndex, singlePageMode, motion]);
    var issueThemeStyle = Object.fromEntries(__spreadArray(__spreadArray(__spreadArray([], Object.entries(issue.colors).map(function (_a) {
        var key = _a[0], value = _a[1];
        return ["--mag-color-".concat(key), value];
    }), true), Object.entries(issue.fonts).map(function (_a) {
        var key = _a[0], value = _a[1];
        return ["--mag-font-".concat(key), value];
    }), true), Object.entries(issue.styles).map(function (_a) {
        var key = _a[0], value = _a[1];
        return ["--mag-style-".concat(key), value];
    }), true));
    var toggleFullscreen = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!readerRef.current)
                        return [2 /*return*/];
                    if (!!document.fullscreenElement) return [3 /*break*/, 2];
                    return [4 /*yield*/, ((_b = (_a = readerRef.current).requestFullscreen) === null || _b === void 0 ? void 0 : _b.call(_a))];
                case 1:
                    _d.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, ((_c = document.exitFullscreen) === null || _c === void 0 ? void 0 : _c.call(document))];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var updatePointerGuide = (0, react_1.useCallback)(function (event) {
        var guide = pointerGuideRef.current;
        var stage = stageRef.current;
        if (!guide || !stage)
            return;
        var book = stage.querySelector(".xp-magazine__book");
        var stageRect = stage.getBoundingClientRect();
        var bookRect = book === null || book === void 0 ? void 0 : book.getBoundingClientRect();
        var insideBook = Boolean(bookRect && event.clientX >= bookRect.left && event.clientX <= bookRect.right && event.clientY >= bookRect.top && event.clientY <= bookRect.bottom);
        guide.style.setProperty("--xp-pointer-x", "".concat(event.clientX - stageRect.left, "px"));
        guide.style.setProperty("--xp-pointer-y", "".concat(event.clientY - stageRect.top, "px"));
        if (!insideBook) {
            guide.dataset.visible = "false";
            return;
        }
        guide.dataset.visible = "true";
        if (isInteractiveTarget(event.target)) {
            guide.dataset.mode = "interactive";
            guide.dataset.label = "";
            return;
        }
        var direction = event.clientX >= (bookRect.left + bookRect.width / 2) ? "next" : "previous";
        var available = direction === "next" ? canGoForward : canGoBack;
        guide.dataset.mode = available ? direction : "interactive";
        guide.dataset.label = available ? (direction === "next" ? "Next" : "Previous") : "";
    }, [canGoBack, canGoForward]);
    var onPointerDown = function (event) {
        var _a, _b;
        updatePointerGuide(event);
        if ((motion === null || motion === void 0 ? void 0 : motion.phase) === "animating" || isInteractiveTarget(event.target))
            return;
        pointerStartX.current = event.clientX;
        pointerStartY.current = event.clientY;
        pointerCurrentX.current = event.clientX;
        pointerStartTime.current = performance.now();
        gestureAxis.current = null;
        suppressClick.current = false;
        setProgress(0);
        // Capturing on the stage means images and decorative page surfaces cannot
        // steal the drag gesture before it reaches the magazine reader.
        (_b = (_a = event.currentTarget).setPointerCapture) === null || _b === void 0 ? void 0 : _b.call(_a, event.pointerId);
    };
    var onPointerMove = function (event) {
        updatePointerGuide(event);
        if (pointerStartX.current == null || pointerStartY.current == null)
            return;
        pointerCurrentX.current = event.clientX;
        var deltaX = event.clientX - pointerStartX.current;
        var deltaY = event.clientY - pointerStartY.current;
        var absX = Math.abs(deltaX);
        var absY = Math.abs(deltaY);
        if (!gestureAxis.current && Math.max(absX, absY) >= 7) {
            gestureAxis.current = absY > absX * 1.15 ? "vertical" : "horizontal";
        }
        if (gestureAxis.current === "vertical")
            return;
        if (gestureAxis.current !== "horizontal" || absX < 7)
            return;
        suppressClick.current = true;
        var direction = deltaX < 0 ? "next" : "previous";
        var nextMotion = createMotion(direction, "dragging");
        if (!nextMotion) {
            setProgress(0);
            return;
        }
        if (!motion || motion.direction !== direction || motion.phase !== "dragging") {
            setMotion(nextMotion);
        }
        var stageWidth = Math.max(1, event.currentTarget.getBoundingClientRect().width);
        var distance = singlePageMode ? stageWidth * 0.48 : stageWidth * 0.3;
        setProgress(absX / distance);
    };
    var finishPointer = function (event) {
        var _a, _b;
        updatePointerGuide(event);
        if (pointerStartX.current == null)
            return;
        var startX = pointerStartX.current;
        var deltaX = event.clientX - startX;
        var elapsed = Math.max(1, performance.now() - pointerStartTime.current);
        var velocity = Math.abs(deltaX) / elapsed;
        pointerStartX.current = null;
        pointerStartY.current = null;
        pointerCurrentX.current = null;
        gestureAxis.current = null;
        (_b = (_a = event.currentTarget).releasePointerCapture) === null || _b === void 0 ? void 0 : _b.call(_a, event.pointerId);
        if (!motion || motion.phase !== "dragging") {
            setMotion(null);
            setProgress(0);
            return;
        }
        var commit = progressRef.current >= TURN_THRESHOLD || (Math.abs(deltaX) >= FLICK_DISTANCE && velocity >= FLICK_VELOCITY);
        animateMotion(motion, commit);
    };
    var onStageClick = function (event) {
        if (suppressClick.current) {
            suppressClick.current = false;
            return;
        }
        if (motion || isInteractiveTarget(event.target))
            return;
        var stage = stageRef.current;
        var book = stage === null || stage === void 0 ? void 0 : stage.querySelector(".xp-magazine__book");
        if (!book)
            return;
        var rect = book.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)
            return;
        navigate(event.clientX >= rect.left + rect.width / 2 ? "next" : "previous");
    };
    var hidePointerGuide = function () {
        if (pointerGuideRef.current)
            pointerGuideRef.current.dataset.visible = "false";
    };
    var renderSpread = function (spreadToRender, role, hiddenPageIndex) {
        var isSingle = spreadToRender.pageIndexes.length === 1;
        return (<div className={"xp-magazine__spread-layer xp-magazine__spread-layer--".concat(role, " ").concat(isSingle ? "is-single" : "is-spread")} aria-hidden={role === "target" ? true : undefined}>
        {spreadToRender.pageIndexes.map(function (pageIndex, slot) {
                var page = issue.pages[pageIndex];
                var slotClass = isSingle ? "solo" : slot === 0 ? "left" : "right";
                var hidden = hiddenPageIndex === pageIndex;
                return (<article className={"xp-magazine__sheet xp-magazine__sheet--".concat(slotClass).concat(hidden ? " is-turning-page" : "")} key={"".concat(role, "-").concat(page.id)} aria-label={role === "current" ? "".concat(page.title, ", page ").concat(pageIndex + 1) : undefined}>
              <div className="xp-magazine__paper">
                <magazine_resource_preloader_1.MagazineResourcePreloader resources={page.resources}/>
                {page.sections.map(function (section) { return <magazine_resource_preloader_1.MagazineResourcePreloader key={"resource-".concat(section.id)} resources={section.resources}/>; })}
                <magazine_1.MagazinePageRenderer page={page} globalElements={issue.designElements} onComposerNodeActivate={openStoryTarget} renderComposerNodeOverlay={function (node) {
                        var _a, _b;
                        return ((_a = node.story) === null || _a === void 0 ? void 0 : _a.engagementAnchor) ? (<div className="xp-cover-story-engagement" data-story-engagement={node.story.id}>
                      <section_engagement_1.SectionEngagementBar issueSlug={issue.slug} pageSlug={node.story.targetPageSlug} sectionId={node.story.targetSectionSlug} sectionSlug={node.story.targetSectionSlug} authenticated={viewerAuthenticated} appearance={(_b = node.story.engagementAppearance) !== null && _b !== void 0 ? _b : "auto"}/>
                    </div>) : null;
                    }} renderEngagement={function (section) { return page.kind === "cover" ? null : (<section_engagement_1.SectionEngagementBar issueSlug={issue.slug} pageSlug={page.slug} sectionId={section.id} sectionSlug={section.slug} authenticated={viewerAuthenticated} config={section.engagement} appearance={["feature", "advert", "closing"].includes(page.kind) ? "light" : "dark"}/>); }}/>
                <span className="xp-magazine__folio" aria-hidden="true">{String(pageIndex + 1).padStart(2, "0")}</span>
              </div>
            </article>);
            })}
      </div>);
    };
    var currentTurnPageIndex = motion
        ? motion.direction === "next"
            ? spread.pageIndexes[spread.pageIndexes.length - 1]
            : spread.pageIndexes[0]
        : undefined;
    var backTurnPageIndex = motion && targetSpread
        ? motion.direction === "next"
            ? targetSpread.pageIndexes[0]
            : targetSpread.pageIndexes[targetSpread.pageIndexes.length - 1]
        : undefined;
    var currentTurnPage = currentTurnPageIndex == null ? null : issue.pages[currentTurnPageIndex];
    var backTurnPage = backTurnPageIndex == null ? null : issue.pages[backTurnPageIndex];
    var currentIsSingle = spread.pageIndexes.length === 1;
    var targetIsSingle = (targetSpread === null || targetSpread === void 0 ? void 0 : targetSpread.pageIndexes.length) === 1;
    var edgeTransition = motion
        ? currentIsSingle && !targetIsSingle
            ? "single-to-spread"
            : !currentIsSingle && targetIsSingle
                ? "spread-to-single"
                : "same-size"
        : "idle";
    var stageStyle = { "--xp-turn-progress": 0 };
    return (<section ref={readerRef} className="xp-magazine" style={issueThemeStyle} aria-label={"".concat(issue.city, " magazine, ").concat(issue.issueLabel)}>
      <magazine_resource_preloader_1.MagazineResourcePreloader resources={issue.resources}/>
      <div className="xp-magazine__toolbar">
        <div className="xp-magazine__meta">
          <span>{issue.city}</span>
          <span aria-hidden="true">/</span>
          <span>{issue.monthLabel}</span>
          <span aria-hidden="true">/</span>
          <span>{issue.issueLabel}</span>
        </div>

        <div className="xp-magazine__page-meta" aria-live="polite">
          {activePages.some(function (page) { return page.access === "member"; }) ? (<span className="xp-magazine__member"><lucide_react_1.LockKeyhole size={13}/> Member</span>) : null}
          <span>{firstPage.title}</span>
          <span>{firstPage.index + 1} / {issue.pages.length}</span>
          <button className="xp-magazine__icon-button" type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit fullscreen" : "Open fullscreen"}>
            {isFullscreen ? <lucide_react_1.Minimize2 size={15}/> : <lucide_react_1.Maximize2 size={15}/>}
          </button>
        </div>
      </div>

      <div ref={stageRef} className="xp-magazine__stage" style={stageStyle} data-mode={singlePageMode ? "single" : "spread"} data-motion={(_c = motion === null || motion === void 0 ? void 0 : motion.kind) !== null && _c !== void 0 ? _c : "idle"} data-direction={motion === null || motion === void 0 ? void 0 : motion.direction} data-phase={motion === null || motion === void 0 ? void 0 : motion.phase} data-edge={edgeTransition} onPointerDownCapture={onPointerDown} onPointerMoveCapture={onPointerMove} onPointerUpCapture={finishPointer} onPointerCancelCapture={finishPointer} onPointerLeave={hidePointerGuide} onClickCapture={onStageClick} onDragStartCapture={function (event) { return event.preventDefault(); }}>
        <div ref={pointerGuideRef} className="xp-magazine__pointer-guide" data-visible="false" data-mode="interactive" data-label="" aria-hidden="true">
          <span className="xp-magazine__pointer-guide-label"/>
        </div>
        <div className="xp-magazine__book-shadow" aria-hidden="true"/>
        <div className="xp-magazine__book">
          {motion && targetSpread
            ? renderSpread(targetSpread, "target", motion.kind === "flip" && edgeTransition !== "same-size" ? backTurnPageIndex : undefined)
            : null}
          {renderSpread(spread, "current", (motion === null || motion === void 0 ? void 0 : motion.kind) === "flip" ? currentTurnPageIndex : undefined)}

          {(motion === null || motion === void 0 ? void 0 : motion.kind) === "flip" && currentTurnPage && backTurnPage ? (<div className={"xp-magazine__turn-sheet xp-magazine__turn-sheet--".concat(motion.direction)} aria-hidden="true">
              <div className="xp-magazine__turn-face xp-magazine__turn-face--front">
                <magazine_1.MagazinePageRenderer page={currentTurnPage} globalElements={issue.designElements}/>
              </div>
              <div className="xp-magazine__turn-face xp-magazine__turn-face--back">
                <magazine_1.MagazinePageRenderer page={backTurnPage} globalElements={issue.designElements}/>
              </div>
              <div className="xp-magazine__fold-shadow"/>
              <div className="xp-magazine__fold-highlight"/>
            </div>) : null}
        </div>
      </div>

      <div className="xp-magazine__footer">
        <div className="xp-magazine__progress" aria-label="Magazine progress">
          {spreads.map(function (item, index) { return (<button key={item.id} type="button" aria-label={"Open ".concat(singlePageMode ? "page" : "spread", " ").concat(index + 1)} aria-current={index === safeSpreadIndex ? "page" : undefined} className="xp-magazine__dot" onClick={function () {
                animateToSpread(index);
            }}/>); })}
        </div>

        <p className="xp-magazine__hint">Drag the page · or use ← →</p>

        <div className="xp-magazine__controls">
          <button type="button" className="xp-magazine__nav" onClick={function () { return navigate("previous"); }} disabled={!canGoBack || Boolean(motion)} aria-label="Previous spread">
            <lucide_react_1.ArrowLeft size={18}/><span>Previous</span>
          </button>
          <button type="button" className="xp-magazine__nav xp-magazine__nav--primary" onClick={function () { return navigate("next"); }} disabled={!canGoForward || Boolean(motion)} aria-label="Next spread">
            <span>Next</span><lucide_react_1.ArrowRight size={18}/>
          </button>
        </div>
      </div>
    </section>);
}
