# Performance checks

These scripts compare built static sites served locally with gzip enabled and third-party services mocked. They are separate from the default `pnpm test` workflow so timing and transfer measurements do not make functional tests slow or flaky.

## Local run

From the repository root, install test tooling and Chromium once, then build the site:

```bash
pnpm test:setup
pnpm build
```

Build the comparison revision in a separate checkout or directory, then run:

```bash
node tests/perf/scripts/benchmark-home-ssg.ts /path/to/base/dist /tmp/home.json 3
node tests/perf/scripts/benchmark-ssg.ts /path/to/base/dist /tmp/articles.json
node tests/perf/scripts/asset-sizes.ts /path/to/base/dist /tmp/base-assets.json
node tests/perf/scripts/asset-sizes.ts dist /tmp/head-assets.json
node tests/perf/scripts/report.ts /tmp/home.json /tmp/articles.json /tmp/base-assets.json /tmp/head-assets.json /tmp/report.md
```

To compare two deployed builds through the same browser/network profile, provide `PERF_BASELINE_URL` and `PERF_HEAD_URL` and run `node tests/perf/scripts/benchmark-live.ts /tmp/live.json`. This live comparison is separate from CI because CDN caches, edge cold starts, and external network conditions are not stable enough for per-commit regression checks.

The article benchmark uses three representative posts: a short text article, an image-heavy post, and a long post with math and code. The homepage benchmark covers the image-rich feed. Both run Chromium at 1365 × 900 with 150 ms latency, 200 KiB/s download, 93 KiB/s upload, 4× CPU throttling, a fresh context per sample, and blocked service workers. External APIs are mocked. Three runs are summarized by their median.

The report records content-visible time, Vue hydration completion, FCP, LCP, CLS, JavaScript requested by hydration, and total transfer. It also records the initial entry JS/CSS gzip sizes. These are repeatable lab comparisons, not field Core Web Vitals. Image transfer, Chromium scheduling, and runner load still add variance, so the workflow posts results without enforcing a numeric failure threshold while a history is being established.

## GitHub Actions

`performance-regression.yml` compares a pull request head with its base commit, or a pushed commit with its first parent. It builds both revisions, runs the performance scenarios, and uploads the raw JSON plus Markdown report. A push to `main` only runs the benchmark when one of the pushed commits carries `[perf]` in its message; manual dispatch and pull requests always run. Functional browser route tests run separately through the test workflow. A same-repository pull request receives an updated PR comment; a push to `main` receives a comment on that commit. GitHub restricts write tokens for fork pull requests, so those runs keep the check summary and artifact but skip comments.

The comment is updated on workflow reruns instead of duplicated. Timing thresholds are intentionally not blocking yet; after collecting enough stable runs, a budget can be added for regressions such as >10% and >100 ms in content-visible or hydration time, with separate size budgets for entry JS/CSS.
