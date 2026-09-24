import fs from "node:fs"
import path from "node:path"

const root = process.cwd()

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"))
}
function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n")
}
function ensureDep(packageFile, name, version) {
  if (!fs.existsSync(packageFile)) return
  const pkg = readJson(packageFile)
  pkg.dependencies ??= {}
  if (!pkg.dependencies[name] && !pkg.devDependencies?.[name]) {
    pkg.dependencies[name] = version
    writeJson(packageFile, pkg)
    console.log(`[auth fix] added ${name} to ${path.relative(root, packageFile)}`)
  }
}

ensureDep(path.join(root, "apps/frontend/package.json"), "better-auth", "^1.7.5")
ensureDep(path.join(root, "apps/api/package.json"), "better-auth", "^1.7.5")
ensureDep(path.join(root, "packages/auth/package.json"), "better-auth", "^1.7.5")
ensureDep(path.join(root, "packages/auth/package.json"), "@better-auth/drizzle-adapter", "^1.7.5")

const apiSrc = path.join(root, "apps/api/src")
const candidates = [
  "server.ts",
  "index.ts",
  "app.ts",
  "main.ts",
].map((f) => path.join(apiSrc, f)).filter(fs.existsSync)

const server = candidates.find((f) => {
  const s = fs.readFileSync(f, "utf8")
  return /express\s*\(/.test(s) && /express\.json\s*\(/.test(s)
})

if (!server) {
  console.log("[auth fix] Could not auto-detect the Express entry file.")
  console.log("[auth fix] Import mountBetterAuth from ./auth-bootstrap and call it immediately after const app = express(), BEFORE express.json().")
  process.exit(0)
}

let source = fs.readFileSync(server, "utf8")
const backup = `${server}.before-auth-v7`
if (!fs.existsSync(backup)) fs.writeFileSync(backup, source)

if (!source.includes('from "./auth-bootstrap"') && !source.includes("from './auth-bootstrap'")) {
  const imports = [...source.matchAll(/^import .*$/gm)]
  const insertAt = imports.length ? imports.at(-1).index + imports.at(-1)[0].length : 0
  source =
    source.slice(0, insertAt) +
    '\nimport { mountBetterAuth } from "./auth-bootstrap"' +
    source.slice(insertAt)
}

if (!source.includes("mountBetterAuth(app)")) {
  const appMatch = /const\s+app\s*=\s*express\s*\(\s*\)\s*;?/.exec(source)
  if (!appMatch) {
    console.log("[auth fix] Found the API file but could not identify `const app = express()`.")
    process.exit(0)
  }

  const insertAt = appMatch.index + appMatch[0].length
  source =
    source.slice(0, insertAt) +
    "\n\n// Mount Better Auth before any JSON/body parser.\nmountBetterAuth(app)" +
    source.slice(insertAt)
}

fs.writeFileSync(server, source)
console.log(`[auth fix] patched ${path.relative(root, server)}`)
console.log(`[auth fix] backup: ${path.relative(root, backup)}`)
console.log("\nNext: pnpm install")
