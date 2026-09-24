"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authClient = void 0;
var react_1 = require("better-auth/react");
var plugins_1 = require("better-auth/client/plugins");
exports.authClient = (0, react_1.createAuthClient)({
    plugins: [(0, plugins_1.emailOTPClient)()],
});
