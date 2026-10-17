# CI Usage and Cost Controls

## Overview

The extension CI workflow (`.github/workflows/ci.yml`) is optimized to avoid consuming high-cost macOS runner minutes on routine pushes and pull requests.

## Workflow Execution Matrix

| Job | Runner | Triggers | Notes |
|---|---|---|---|
| `check` (lint, typecheck, tests, builds) | `ubuntu-24.04` | push (`main`), pull_request (`main`), `workflow_dispatch`, tags (`v*`) | Builds Chromium, Firefox, WebStore, Safari bundles |
| `firefox-takeover` (matrix: 143.0, latest) | `ubuntu-24.04` | push (`main`), pull_request (`main`), `workflow_dispatch`, tags (`v*`) | Real headless Firefox browser regression suites |
| `safari-native-core` | `macos-15` | `workflow_dispatch`, tags (`v*`) | Swift native package tests for macOS/Safari bridge |
| `safari-unsigned-archive` | `macos-26` | `workflow_dispatch`, tags (`v*`) | Validates unsigned Xcode archive packaging without credentials |
| `acceptance` | `ubuntu-24.04` | push (`main`), pull_request (`main`), `workflow_dispatch`, tags (`v*`) | Aggregates all jobs; skipped macOS jobs do not fail PRs |

## Triggering macOS Jobs via GitHub CLI

To run the complete CI suite including macOS runners on demand:

```bash
gh workflow run ci.yml
```

Or for a specific branch:

```bash
gh workflow run ci.yml --ref <branch-name>
```

## Running Checks Locally (macOS)

You can run every validation check locally without consuming GitHub Actions minutes:

### 1. Static Checks, Lint, and Typecheck
```bash
pnpm run lint
pnpm run typecheck
```

### 2. Unit and Tooling Tests
```bash
pnpm test
node --test scripts/__tests__/*.test.mjs
python3 -I scripts/__tests__/safari_release_test.py
```

### 3. Build Extension Packages
```bash
pnpm run build:chromium
pnpm run build:firefox
pnpm run build:safari
pnpm run build:webstore
```

### 4. Safari Native Core Tests
```bash
swift test --package-path native/safari --scratch-path .cache/safari-native-tests
```

### 5. Safari Unsigned Archive Packaging
```bash
pnpm run build:safari
node scripts/safari-native.mjs --build --archive --unsigned-archive --bootstrap-client-only
```
