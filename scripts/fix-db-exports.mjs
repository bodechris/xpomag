import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const dbPackagePath = path.join(root, "packages", "db", "package.json")

if (!fs.existsSync(dbPackagePath)) {
  console.error("[XPOMAG] packages/db/package.json was not found.")
  process.exit(1)
}

const pkg = JSON.parse(fs.readFileSync(dbPackagePath, "utf8"))
pkg.exports ??= {}

function addExport(key, value) {
  if (!pkg.exports[key]) {
    pkg.exports[key] = value
    console.log(`[XPOMAG] added export ${key} -> ${value}`)
  } else {
    console.log(`[XPOMAG] export already exists: ${key}`)
  }
}

addExport("./schema/auth", "./src/schema/auth.ts")
addExport("./schema/onboarding", "./src/schema/onboarding.ts")
addExport("./schema", "./src/schema/index.ts")

fs.writeFileSync(dbPackagePath, JSON.stringify(pkg, null, 2) + "\n", "utf8")

console.log("\n[XPOMAG] packages/db exports updated successfully.")
console.log("Next run:")
console.log("  pnpm install")
console.log("  pnpm dlx auth@latest generate --config packages/auth/src/server.ts --adapter drizzle --dialect postgresql")
