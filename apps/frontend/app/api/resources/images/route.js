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
exports.GET = GET;
var promises_1 = require("node:fs/promises");
var node_path_1 = require("node:path");
var server_1 = require("next/server");
var EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"]);
function walk(root_1) {
    return __awaiter(this, arguments, void 0, function (root, current) {
        var entries, _a, out, _i, entries_1, entry, full, _b, _c, _d;
        if (current === void 0) { current = root; }
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readdir)(current, { withFileTypes: true })];
                case 1:
                    entries = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _e.sent();
                    return [2 /*return*/, []];
                case 3:
                    out = [];
                    _i = 0, entries_1 = entries;
                    _e.label = 4;
                case 4:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 8];
                    entry = entries_1[_i];
                    full = node_path_1.default.join(current, entry.name);
                    if (!entry.isDirectory()) return [3 /*break*/, 6];
                    _c = (_b = out.push).apply;
                    _d = [out];
                    return [4 /*yield*/, walk(root, full)];
                case 5:
                    _c.apply(_b, _d.concat([_e.sent()]));
                    return [3 /*break*/, 7];
                case 6:
                    if (entry.isFile() && EXTENSIONS.has(node_path_1.default.extname(entry.name).toLowerCase()))
                        out.push(node_path_1.default.relative(root, full).split(node_path_1.default.sep).join("/"));
                    _e.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 4];
                case 8: return [2 /*return*/, out];
            }
        });
    });
}
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var publicResources, files, origin, images;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    publicResources = node_path_1.default.join(process.cwd(), "public", "resources");
                    return [4 /*yield*/, walk(publicResources)];
                case 1:
                    files = (_a.sent()).sort(function (a, b) { return a.localeCompare(b); });
                    origin = new URL(request.url).origin;
                    images = files.map(function (relativePath) { return ({
                        name: node_path_1.default.basename(relativePath),
                        path: "/resources/".concat(relativePath.split("/").map(encodeURIComponent).join("/")),
                        url: "".concat(origin, "/resources/").concat(relativePath.split("/").map(encodeURIComponent).join("/")),
                        folder: node_path_1.default.dirname(relativePath) === "." ? "resources" : node_path_1.default.dirname(relativePath),
                    }); });
                    return [2 /*return*/, server_1.NextResponse.json({ images: images }, { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" } })];
            }
        });
    });
}
