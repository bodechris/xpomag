"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppProviders = AppProviders;
var react_query_1 = require("@tanstack/react-query");
var react_1 = require("react");
function AppProviders(_a) {
    var children = _a.children;
    var queryClient = (0, react_1.useState)(function () { return new react_query_1.QueryClient({
        defaultOptions: {
            queries: { staleTime: 30000, refetchOnWindowFocus: false }
        }
    }); })[0];
    return <react_query_1.QueryClientProvider client={queryClient}>{children}</react_query_1.QueryClientProvider>;
}
