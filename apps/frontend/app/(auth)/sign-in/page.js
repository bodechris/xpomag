"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Page;
var navigation_1 = require("next/navigation");
function Page() {
    (0, navigation_1.redirect)("/auth");
}
