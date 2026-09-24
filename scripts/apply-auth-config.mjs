import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const frontendDir = path.join(root, "apps", "frontend")
const packagePath = path.join(frontendDir, "package.json")

function fail(message) {
  console.error(`\n[XPOMAG auth] ${message}\n`)
  process.exit(1)
}

if (!fs.existsSync(frontendDir)) {
  fail("Run this script from the XPOMAG repository root.")
}

if (!fs.existsSync(packagePath)) {
  fail("apps/frontend/package.json was not found.")
}

const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"))
pkg.dependencies ??= {}

if (!pkg.dependencies["better-auth"] && !pkg.devDependencies?.["better-auth"]) {
  pkg.dependencies["better-auth"] = "^1.7.5"
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + "\n", "utf8")
  console.log("[XPOMAG auth] Added better-auth to apps/frontend/package.json")
} else {
  console.log("[XPOMAG auth] better-auth already exists in apps/frontend/package.json")
}

console.log(`
[XPOMAG auth] Config update complete.

This version does NOT modify tsconfig.json.
Auth pages use relative imports to avoid alias-resolution problems.

Next:
  pnpm install
  pnpm dev
`)
