"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProtectedLayout;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var account_api_1 = require("../../lib/account-api");
function ProtectedLayout(_a) {
    var children = _a.children;
    var router = (0, navigation_1.useRouter)();
    var pathname = (0, navigation_1.usePathname)();
    var _b = (0, react_1.useState)(false), ready = _b[0], setReady = _b[1];
    (0, react_1.useEffect)(function () {
        var cancelled = false;
        (0, account_api_1.accountFetch)("/status")
            .then(function (status) {
            if (cancelled)
                return;
            if (!status.verified) {
                router.replace("/verify-email");
                return;
            }
            if (!status.onboardingCompleted) {
                router.replace("/onboarding");
                return;
            }
            setReady(true);
        })
            .catch(function () {
            router.replace("/auth?next=".concat(encodeURIComponent(pathname)));
        });
        return function () {
            cancelled = true;
        };
    }, [pathname, router]);
    if (!ready)
        return null;
    return children;
}
