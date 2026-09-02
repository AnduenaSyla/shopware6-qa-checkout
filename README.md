# QA / Automation Tester Intern — Practical Exercise (Solution25)

Submission for the Shopware 6 storefront QA exercise: guest visitor finds a
product, adds it to the cart, and completes checkout using **Cash on
Delivery**.

**Environment tested:** the public demo store,
`https://www.shopware6-demo.development-s25.com/` (default storefront
language: German).

## Contents

| Deliverable | Where |
|---|---|
| Part 1 — Manual test plan (6 positive / 5 negative / 4 edge cases) | [`docs/QA_Test_Plan_Solution25.docx`](docs/QA_Test_Plan_Solution25.docx) |
| Part 2 — Automated end-to-end test (Playwright + TypeScript, Page Object Model) | [`automation/`](automation/README.md) |
| Part 3 — Bug report (BUG-01) | [`docs/Bug_Report_Solution25.docx`](docs/Bug_Report_Solution25.docx) |

## Quick start (automation)

```bash
cd automation
npm install
npx playwright install --with-deps chromium
npm test
```

Full instructions, the selector strategy, and "what I'd improve with more
time" are in [`automation/README.md`](automation/README.md).

## What I found difficult / what I enjoyed

*(Draft — personalize this before you send it; see the note below.)*

What I enjoyed most was working directly against the real storefront instead
of guessing at markup: inspecting the actual DOM told a more interesting
story than I expected. For example, typing "0" into the quantity field and
clicking "Add to cart" with a real click is correctly blocked by the
browser's own validation — but the exact same action triggered
programmatically (as an automated test or a retried request would do)
sails through with an HTTP 200 "success" response and silently adds
nothing, with the server's own error message never reaching the screen.
Chasing that distinction down — and confirming, rather than assuming, which
scenarios were and weren't a real bug — was the most enjoyable part of the
exercise.

The most difficult part was the opposite instinct: resisting the urge to
report the first "broken-looking" thing I found. My first pass at the
quantity-0 issue looked like a much bigger, user-facing bug until I retested
it with a genuine mouse click and watched the browser handle it correctly —
so the bug report ended up being about a narrower, more precisely-scoped
issue than my first hypothesis, which felt like the right outcome even
though it meant walking back my own initial read.

*(Note from the assistant: this paragraph is written from what actually
happened while preparing this submission, but it's meant to be **your**
reflection for an interview you may be asked about — read it, and rewrite
anything that doesn't match how you'd put it in your own words.)*

## Repository layout

```
.
├── README.md                        # this file
├── docs/
│   ├── QA_Test_Plan_Solution25.docx
│   └── Bug_Report_Solution25.docx
└── automation/
    ├── pages/                       # Page Object Model
    ├── tests/guest-checkout.spec.ts
    ├── playwright.config.ts
    └── README.md
```
