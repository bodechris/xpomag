# XPOMAG v16 — verification + onboarding visual system

The authentication flow was working, but `/verify-email` and `/onboarding`
were still relying on utility classes that are not present in the current
frontend build. That caused the near-browser-default layouts shown in the
screenshots.

v16 gives both pages their own plain-CSS editorial flow, matching the stronger
auth page.

## Changed

- `/verify-email`
  - full split-screen composition
  - large editorial statement
  - clear 01 / 02 setup progress
  - properly styled OTP field
  - resend/error states

- `/onboarding`
  - full split-screen composition
  - clear 02 / 02 setup progress
  - city section + detected-location messaging
  - selected city pills
  - category interest pills
  - responsive layout
  - no Tailwind dependency

## Run

```powershell
Remove-Item -Recurse -Force apps/frontend/.next -ErrorAction SilentlyContinue
pnpm --filter frontend dev
```
