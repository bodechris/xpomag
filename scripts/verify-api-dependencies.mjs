import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const packagePath = path.join(root, "apps", "api", "package.json")
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"))

const required = [
  "better-auth",
  "express",
  "cors",
]

let failed = false

for (const dep of required) {
  if (!pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]) {
    console.error(`[FAIL] apps/api is missing runtime dependency: ${dep}`)
    failed = true
  } else {
    console.log(`[OK] ${dep}`)
  }
}

if (failed) process.exit(1)

console.log("\nXPOMAG API direct runtime dependencies look correct.")
