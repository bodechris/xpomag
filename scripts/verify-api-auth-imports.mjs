import fs from "node:fs"
import path from "node:path"

const root = process.cwd()

const files = [
  "apps/api/src/auth-bootstrap.ts",
  "apps/api/src/routes/account.ts",
  "apps/api/src/middleware/require-user.ts",
]

let failed = false

for (const rel of files) {
  const file = path.join(root, rel)
  const text = fs.readFileSync(file, "utf8")

  if (text.includes("@xpomag/auth")) {
    console.error(`[FAIL] ${rel} still imports @xpomag/auth`)
    failed = true
  } else if (!text.includes("packages/auth/src/index.ts")) {
    console.error(`[FAIL] ${rel} does not point to packages/auth/src/index.ts`)
    failed = true
  } else {
    console.log(`[OK] ${rel}`)
  }
}

const authIndex = path.join(root, "packages/auth/src/index.ts")
if (!fs.existsSync(authIndex)) {
  console.error("[FAIL] packages/auth/src/index.ts is missing")
  failed = true
} else {
  console.log("[OK] packages/auth/src/index.ts")
}

if (failed) process.exit(1)

console.log("\nXPOMAG API auth imports are wired directly to the monorepo source.")
