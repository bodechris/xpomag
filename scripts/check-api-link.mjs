import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const apiPkg = JSON.parse(fs.readFileSync(path.join(root, "apps/api/package.json"), "utf8"))
const authPkg = JSON.parse(fs.readFileSync(path.join(root, "packages/auth/package.json"), "utf8"))

console.log("api -> @xpomag/auth:", apiPkg.dependencies?.["@xpomag/auth"] ?? "MISSING")
console.log("auth package name:", authPkg.name)

if (apiPkg.dependencies?.["@xpomag/auth"] !== "workspace:*") process.exitCode = 1
if (authPkg.name !== "@xpomag/auth") process.exitCode = 1
