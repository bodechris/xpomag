import fs from "node:fs"

function must(file, text) {
  const source = fs.readFileSync(file, "utf8")
  if (!source.includes(text)) {
    console.error(`[FAIL] ${file} missing ${text}`)
    process.exitCode = 1
  } else {
    console.log(`[OK] ${file}: ${text}`)
  }
}

function mustNot(file, text) {
  const source = fs.readFileSync(file, "utf8")
  if (source.includes(text)) {
    console.error(`[FAIL] ${file} still contains ${text}`)
    process.exitCode = 1
  } else {
    console.log(`[OK] ${file} no longer contains ${text}`)
  }
}

must("apps/frontend/lib/auth-client.ts", "createAuthClient")
mustNot("apps/frontend/lib/auth-client.ts", "NEXT_PUBLIC_API_ORIGIN")
must("apps/frontend/app/api/auth/[...all]/route.ts", "toNextJsHandler")
must("apps/frontend/app/api/account/[...path]/route.ts", "verifyEmailOTP")
mustNot("apps/api/src/index.ts", "mountBetterAuth")
mustNot("apps/api/src/index.ts", "accountRouter")

console.log("\nXPOMAG v15 auth is frontend-owned and same-origin.")
