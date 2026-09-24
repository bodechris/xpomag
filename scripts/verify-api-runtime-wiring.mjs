import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const checks = [
  {
    file: "apps/api/src/auth-bootstrap.ts",
    must: ["packages/auth/src/index"],
    mustNot: ['"@xpomag/auth"'],
  },
  {
    file: "packages/auth/src/server.ts",
    must: ["../../db/src/index", "../../db/src/schema/auth"],
    mustNot: ['"@xpomag/db"'],
  },
  {
    file: "apps/api/src/modules/composer/repository.ts",
    must: ["packages/db/src/index", "packages/magazine/src/index"],
    mustNot: ['"@xpomag/db"', '"@xpomag/magazine"'],
  },
  {
    file: "apps/api/src/index.ts",
    must: [
      'from "./routes/account"',
      'app.use("/api/account", accountRouter)',
      "mountBetterAuth(app)",
    ],
    mustNot: [],
  },
]

let failed = false

for (const check of checks) {
  const file = path.join(root, check.file)
  if (!fs.existsSync(file)) {
    console.error(`[FAIL] missing ${check.file}`)
    failed = true
    continue
  }

  const text = fs.readFileSync(file, "utf8")

  for (const needle of check.must) {
    if (!text.includes(needle)) {
      console.error(`[FAIL] ${check.file} missing: ${needle}`)
      failed = true
    }
  }

  for (const needle of check.mustNot) {
    if (text.includes(needle)) {
      console.error(`[FAIL] ${check.file} still contains: ${needle}`)
      failed = true
    }
  }

  if (!failed) console.log(`[OK] ${check.file}`)
}


const directDrizzleFiles = [
  "apps/api/src/routes/account.ts",
]

for (const rel of directDrizzleFiles) {
  const file = path.join(root, rel)
  const source = fs.readFileSync(file, "utf8")
  if (source.includes('from "drizzle-orm"') || source.includes("from 'drizzle-orm'")) {
    console.error(`[FAIL] ${rel} still imports drizzle-orm directly`)
    failed = true
  } else {
    console.log(`[OK] ${rel} has no direct drizzle-orm runtime import`)
  }
}

if (failed) process.exit(1)

console.log("\nXPOMAG API runtime wiring looks correct.")
