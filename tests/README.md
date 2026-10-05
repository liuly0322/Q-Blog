# Tests

## Setup

Install application dependencies from the repository root, then install the isolated browser-test tools and Chromium:

```bash
pnpm install --frozen-lockfile
pnpm test:setup
```

`pnpm test:setup` is an explicit setup command. `pnpm test` never installs packages or downloads browsers.

## Run

```bash
pnpm test
```

This builds the site, checks generated SSG output, then runs Playwright E2E tests. The browser suite checks direct SSG entry and titles for every generated static page and article (article entries must keep their URL and make only one main-document request), client-side navigation between route types, Back/Forward behavior including article scroll restoration, URL normalization, document titles, and core mobile/service-worker behavior.

`tests/e2e/e2e.ts` is the only entry: it starts one browser and one static server, then registers routes, navigation, titles, platform, and image-zoom tests. Each `harness.test()` receives a fresh browser context and page, with service workers blocked unless explicitly enabled. Storage and article caches are shared only within a test.

Every test checks its own page/console errors, including when selected by name. Expected HTTP errors must specify an exact resource URL and status; each exemption is consumed once. Failures save a screenshot under `tests/artifacts/`; CI uploads these screenshots.

To run one scenario against the existing build:

```bash
node --test --test-name-pattern='archive returns' tests/e2e/e2e.ts
```

SSG checks verify static page content and tag membership, with representative browser checks verifying visible content with JavaScript disabled. Direct-entry and SPA body-loading checks compare rendered body text with the built article fragment; this checks transport/navigation correctness, while SSG tests check build output. Navigation tests use small article content samples instead of comparing full bodies. Scenarios cover pagination, real 404 redirects, anchor/scroll restoration, late responses, and loading-error recovery.

Run individual suites with `pnpm test:ssg` or `pnpm test:e2e`. Both expect a current `dist/`; `pnpm test` builds it first.

## Performance

Performance benchmarking is kept separate from the default test command. See [`perf/README.md`](perf/README.md) for its commands.
