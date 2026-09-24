"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
var navigation_1 = require("next/navigation");
function LoginPage() {
    (0, navigation_1.redirect)("/auth");
}
