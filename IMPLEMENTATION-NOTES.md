# Implementation notes

## Why verification is separate from Better Auth's `emailVerified`

Google OAuth normally provides an already-verified Google email identity. XPOMAG's product requirement,
however, is explicit: every new XPOMAG account must receive and enter an XPOMAG code.

Therefore this patch stores:

```text
user_profiles.email_verified_at
```

That is the application-level onboarding gate.

The OTP itself is still generated/validated by Better Auth's Email OTP plugin.

## Why onboarding interests are normalized

Do not store this as:

```json
{
  "cities": ["Sandton", "Rosebank"],
  "categories": ["design", "restaurants"]
}
```

The normalized tables let XPOMAG later use the same entities for:

- city magazines
- category magazines
- city + category editions
- personalization
- notifications
- advertiser targeting
- editorial analytics

without migrating blobs of preference data later.

## Recommended lifecycle

```text
anonymous
  ↓
email/password OR Google
  ↓
authenticated session exists
  ↓
XPOMAG verification required
  ↓
light onboarding required
  ↓
authenticated platform
```

A user with a valid Better Auth session but incomplete XPOMAG verification is authenticated but not
authorized to enter protected product areas.

## Location philosophy

The location helper only reads approximate server/proxy geo headers.

It does NOT:
- request precise GPS/browser location
- make auth depend on geolocation
- fail onboarding when geo data is absent

This is intentional.

## Future expansion

Later, you can add:
- Apple signup
- passkeys
- magic-link/OTP login
- business profiles/organizations
- category magazine subscriptions
- neighborhood interests
- notification preferences
- language preference

without changing the v1 auth flow.
