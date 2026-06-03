# CSP Analyser

Paste a `Content-Security-Policy` header value (the one you copy from the
**Network → Response Headers** tab) and get an instant, categorised breakdown of
every directive — what it does, what sources it allows, where it inherits its
rules from, and any risks worth knowing about. Everything runs **locally** in the
browser; nothing is sent anywhere.

## Features

- **Exhaustive directive coverage** — all CSP Level 3 directives plus
  experimental and deprecated ones, grouped into families: Fetch, Document,
  Navigation, Reporting, Other, and Deprecated.
- **Shows everything, even what you didn't set** — each directive is marked as
  `Set`, `Inherited` (with the fallback chain it resolved through, e.g.
  `script-src-elem → script-src → default-src`), or `Not set` (with an
  explanation of the resulting browser behaviour).
- **Per-value explanations** — every source token (`'self'`, `'nonce-…'`,
  `https:`, `*.cdn.com`, `'unsafe-inline'`, …) is classified and explained on
  hover, colour-coded by risk.
- **Findings panel** — surfaces policy-wide risks (`'unsafe-inline'`, missing
  `base-uri`, no `default-src`, framing exposure, unknown directives, …).
- **Shareable** — the policy lives in the URL, so a breakdown can be linked.

## Stack

- **Vite 8** + **React 19**
- **React Router 7** in **data mode** (`createBrowserRouter` + `RouterProvider`,
  with the policy parsed in a route **loader** from the `?policy=` search param)
- **Tailwind CSS 4** + **shadcn/ui** (new-york), dark mode by default
- **Motion** for staggered, reduced-motion-aware animations
- Design-engineering details follow Emil Kowalski's principles (ease-out
  entrances, no layout shift, tabular numerals, no-flash theming, 44px targets)

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # typecheck + production build
pnpm preview    # serve the production build
```

## How it works

The CSP "engine" is plain, framework-free TypeScript under `src/lib/csp/`:

| File            | Responsibility                                                            |
| --------------- | ------------------------------------------------------------------------- |
| `directives.ts` | The directive knowledge base (metadata, categories, fallback chains).     |
| `sources.ts`    | Classifies and explains individual source-list tokens.                    |
| `parse.ts`      | Tokenises the header and produces a fully-exhausted, categorised analysis.|
| `types.ts`      | Shared types.                                                             |

The route loader in `src/routes/analyzer.tsx` reads `?policy=` and calls
`analyze()`; the UI just renders the result.

## License

[MIT](./LICENSE) © 2026 Taufiq
