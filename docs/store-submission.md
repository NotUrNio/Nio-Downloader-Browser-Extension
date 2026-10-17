# Store submissions

Store submission is a manual workflow and is not configured for the new extension listing yet. Create new listings first, then set repository variables and environment secrets for those listings. Never copy identifiers or credentials from another extension listing.

The Chrome/Edge package is built from `pnpm run build:webstore`; Firefox uses `pnpm run build:firefox`. The release workflow produces versioned archives and checksums. The submission workflow only runs through Actions → Submit browser extension to stores and defaults to dry run.

Configure these repository variables after creating the new listings:

- `CHROME_EXTENSION_ID` and `CHROME_PUBLISHER_ID`
- `EDGE_PRODUCT_ID` and `EDGE_CLIENT_ID`
- `FIREFOX_EXTENSION_ID` must match the Gecko ID in `manifest.config.ts`

Configure publisher credentials only as the matching GitHub environment secrets (`store-chrome`, `store-edge`, or `store-firefox`). Add required environment reviewers before enabling live submissions. Do not place credentials in the repository or commit them.
