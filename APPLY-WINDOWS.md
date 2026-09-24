# Windows / VS Code — XPOMAG Auth v4

The previous `apply-auth-config.mjs` failed because TypeScript 7 did not expose
`parseConfigFileTextToJson` through the imported API.

v4 no longer touches `tsconfig.json`, and the auth pages no longer depend on the `@/*` alias.

1. Stop Turbo with `Ctrl+C`.
2. Extract the v4 ZIP into your existing `xpomag` root and overwrite matching auth-patch files.
3. From the root run:

```powershell
node scripts/apply-auth-config.mjs
pnpm install
pnpm dev
```

4. Open:

```text
http://localhost:3000/sign-up
http://localhost:3000/sign-in
```

If Turbopack shows an old cached module error after the files are replaced, stop the process,
delete `apps/frontend/.next`, and start `pnpm dev` again.
