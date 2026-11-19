# Recipe to shopping list · release 1

The tool is at `/recipes`, with a link in the desktop and mobile navigation. GitHub Pages continues to host the existing React website. One recipe is saved in the current browser using localStorage; there are no accounts or service keys.

## Run and verify

Use Node 22. Run `npm ci`, `npm test`, and `npm run build`. Run `npm run dev` for the website. For local imports, run `npm run start:importer` with `ALLOWED_ORIGINS=http://localhost:5173` and set `VITE_RECIPE_IMPORT_URL=http://localhost:3001/api/import` in `.env.local`. Restart Vite after changing it.

## Render setup

1. Merge this release into `main` on `leotse4/leotse4.github.io`.
2. In Render, create a Blueprint using this repository. The tracked `render.yaml` creates `leo-recipe-importer` with a health check and the production website origin. No payment-based extraction APIs or keys are used.
3. Copy the assigned HTTPS service URL. In GitHub repository Settings → Secrets and variables → Actions → Variables, add `VITE_RECIPE_IMPORT_URL` with `https://YOUR-SERVICE.onrender.com/api/import`.
4. Run the Pages deployment workflow again. This value is a public endpoint, not a secret. Until configured, the tool clearly offers pasted text instead of pretending to import websites.
5. Check `/health`, then import a public recipe with embedded Recipe JSON-LD. Review the amounts and original serving count. Free service cold starts may cause a timeout; retry or paste text. Hosting plan availability and pricing must be confirmed in Render during setup.

## Import contract and limitations

POST `/api/import` with JSON `{ "url": "https://…" }`. Supported pages return `title`, `ingredients`, `servings`, `yield`, and `method`. Only embedded schema.org Recipe data is extracted. There is no arbitrary page-text guessing, browser execution, login bypass, caption retrieval, or video analysis. YouTube and Instagram links explicitly request pasted captions/transcripts or a linked recipe website. Pages without usable structured data, blocked pages, malformed pages, and ambiguous yields ask for manual review/paste.

The service follows at most three redirects, validating and pinning public IPv4 DNS results each time; permits HTTPS on port 443 only; rejects private/reserved address ranges; limits HTML to 2 MiB and fetches to ten seconds; limits requests to 4 KiB; caches up to 100 recipe responses for fifteen minutes; and allows twenty import attempts per peer per minute. Allowed browser origins are configured server-side. Limits and cache are process-local and reset on restarts; a Render reverse proxy may share the conservative peer quota across users. For larger use, add a shared rate limiter and a validated trusted-proxy policy. No recipe input, URL query, or ingredient text is logged by the application.

## Acceptance and import benchmark

Automated tests cover scaling up/down/back to original, mixed and Unicode fractions, ranges, missing amounts, unknown servings, non-person yields, retained lines, fixed manual overrides, checkmarks after serialization, nested structured data, malformed/blocked page fixtures, unsafe URLs, reserved IP addresses, and the HTTP service's health, CORS, input validation, size limit, and rate limit.

Live import benchmark run on November 19, 2026 with the actual HTTPS fetcher:

| Source | Result |
| --- | --- |
| BBC Good Food `/recipes/easy-pancakes` | 6 ingredients extracted; yield is not a confirmed people count, so original servings must be entered manually. |
| Budget Bytes `/one-pot-creamy-pesto-chicken-pasta/` | 13 ingredients extracted; 4 servings. |
| Allrecipes `/recipe/21014/good-old-fashioned-pancakes/` | 7 ingredients extracted; 8 servings. |
| YouTube / Instagram | Explicit unsupported-link fallback verified by URL tests; no live video or caption extraction attempted or claimed. |
| Blocked/malformed pages | Fixture tests confirm actionable failure rather than invented ingredients. |

The production build and automated suite pass. Compatible dependency security patches were applied to the lockfile; the subsequent npm audit reported zero known vulnerabilities. Browser verification could not be completed: the in-app browser could not reach the local preview and native computer use stopped because it could not reliably identify the current Chrome URL. Mobile layout, clipboard, refresh persistence, keyboard behavior, and print preview still need manual browser verification. Render has been prepared but is not deployed by this release.

Manual browser check: load example; set 4 to 6 and confirm pasta is 600 g; edit a quantity, add/delete ingredients, check purchases, refresh, and confirm everything persists. Test at a phone width, tab through all controls, copy the list, and inspect print preview. Missing serving counts must block list generation. Pasted text is retained verbatim in Original text; instruction lines are retained as notes. Ambiguous ingredient amounts stay editable and are flagged. Cooking times, equipment, purchase rounding, and volume-to-weight conversion are not inferred.
