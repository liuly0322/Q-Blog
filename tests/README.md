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

This builds the site, checks generated SSG output, then runs Playwright E2E tests. The browser suite checks direct SSG entry for every generated static page and article, client-side navigation between route types, Back/Forward behavior including article scroll restoration, URL normalization, and core mobile/service-worker behavior.

Run individual suites with `pnpm test:ssg` or `pnpm test:e2e`. Both expect a current `dist/`; `pnpm test` builds it first.

## Performance

Performance benchmarking is kept separate from the default test command. See [`perf/README.md`](perf/README.md) for its commands.
