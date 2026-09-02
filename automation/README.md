# Shopware 6 — Guest Checkout E2E Test

Automated end-to-end test for **TC-01** of the manual test plan: a guest visitor
searches for a product, adds it to the cart, and completes checkout using
**Cash on Delivery**, against the Shopware 6 public demo store.

Part 2 of the *QA / Automation Tester Intern* practical exercise for Solution25.

## What it does

`tests/guest-checkout.spec.ts` runs the full journey in one Playwright test,
broken into named `test.step()`s with assertions at every stage:

1. Open the storefront homepage.
2. Search for the product ("Demo Produkt") and confirm it appears in results.
3. Open the product page and add it to the cart — assert the header cart badge shows `1`.
4. Open the cart, confirm the product line item is present, proceed to checkout.
5. Fill in guest personal + billing details (no account is created).
6. Select **Cash on delivery** and accept the Terms & Conditions.
7. Place the order and assert the confirmation page: URL, heading text, a numeric
   order number, and that the payment method shown is "Cash on delivery".

## Tooling & structure

- **Framework:** Playwright Test, TypeScript.
- **Pattern:** Page Object Model — one class per screen/step under `pages/`,
  the spec file only orchestrates calls and assertions.
- **Selectors:** the storefront's default theme does not ship `data-test-id`
  attributes, so each page object uses the most stable selector actually
  available, in this order of preference:
  1. Real element `#id`s that Shopware renders itself (e.g. `#personalMail`, `#tos`, `#confirmFormSubmit`).
  2. Accessible roles + visible labels (`getByRole('radio', { name: 'Cash on delivery' })`).
  3. A semantic class Shopware's own theme uses consistently (e.g. `a.begin-checkout-btn`, `a.product-name`) — never a positional/fragile CSS chain (`div > div:nth-child(3) > ...`).
  - The payment method radio's own `id` is a per-instance UUID Shopware generates, so it is *not* used directly — the accessible name is what stays stable across environments and data resets.

```
automation/
├── pages/                     # Page Object Model
│   ├── HomePage.ts
│   ├── SearchResultsPage.ts
│   ├── ProductPage.ts
│   ├── CartPage.ts
│   ├── GuestCheckoutPage.ts
│   ├── CheckoutConfirmPage.ts
│   └── OrderConfirmationPage.ts
├── tests/
│   └── guest-checkout.spec.ts
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Environment targeted

- **Default:** the public Shopware 6 demo store —
  `https://www.shopware6-demo.development-s25.com/`
- **Override:** set `BASE_URL` to point the same suite at a local Shopware
  instance instead, e.g. `BASE_URL=http://localhost:8000 npm test`.
- The storefront's default language is **German** (e.g. "Zur Kasse",
  "Weiter", "Zahlungspflichtig bestellen"), so the test's text assertions use
  the German copy actually rendered by the site rather than assumed English.

## Setup

```bash
npm install
npx playwright install --with-deps chromium   # downloads a matching browser build
```

## Running the test

```bash
npm test              # headless, chromium
npm run test:headed   # headed, watch it click through the flow
npm run test:ui       # Playwright's interactive UI mode (great for debugging)
npm run report        # open the last HTML report
```

A trace, screenshot and video are captured automatically for any failing run
(see `playwright.config.ts`) — open a failure's trace with:

```bash
npx playwright show-trace test-results/<failing-test-folder>/trace.zip
```

## A note on verification

Every selector in `pages/` was confirmed against the **live** demo store by
inspecting the real DOM (element ids, form field names, button roles/labels,
redirect URLs, response payloads) before being written into the page objects
— not guessed from a generic Shopware install. The full manual walkthrough
(search → product → cart → guest address → Cash on Delivery → order
`#10964`) was completed by hand first, which is also how **BUG-01** in the
bug report was found.

The one thing I could **not** do from this authoring environment is execute
`npm test` against the public internet (the sandbox's outbound network is
allow-listed to package registries only, so it cannot reach the demo store's
domain directly) — TypeScript compiles cleanly (`npx tsc --noEmit`) and every
selector was hand-verified, but please run `npm test` once yourselves before
relying on it, exactly as you would for any PR from a contributor.

## What I'd improve with more time

- **Add `data-test-id` recommendations upstream:** none of the interactive
  elements on this theme carry test ids, which pushed every selector toward
  IDs/roles/semantic classes instead. That works, but a `data-testid` on the
  add-to-cart button, quantity input, payment radios and place-order button
  would make the suite noticeably more resilient to theme/copy changes.
- **Parameterize more scenarios from the same page objects:** TC-02 through
  TC-06 and the negative/edge cases in the test plan (empty cart, missing
  required fields, invalid email, quantity boundaries) are natural follow-up
  specs that would reuse these same page objects with almost no new code.
- **CI wiring:** a GitHub Actions workflow (`playwright install --with-deps`
  + `npm test`, with the HTML report uploaded as an artifact) so this runs on
  every push, not just locally.
- **Visual/order-number persistence check:** capture the order number and,
  where an admin/API is available, assert the order was actually created
  server-side with the correct payment method — the current test only checks
  what the confirmation page displays.
- **Cross-browser run:** currently Chromium-only for speed; adding Firefox
  and WebKit projects to `playwright.config.ts` is a one-line change once the
  happy path is proven stable.
