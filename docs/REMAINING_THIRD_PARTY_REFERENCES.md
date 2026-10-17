# Remaining third-party and compatibility references

## Third-party package

`@motrix/mdxp` remains an npm dependency because the current Nio Downloader app imports that package directly and does not provide a vendored replacement. Its schemas must remain aligned with the app.

## Wire compatibility names

The current Nio Downloader app still uses these wire values. They must not be renamed in the extension alone:

- `motrix/initialize` and `motrix/initialized` JSON-RPC methods
- `X-Motrix-Bridge: 1` nonce header
- `motrix-not-running` native host error code
- initialize response `server.name: "motrix"`
- Native Safari bootstrap identifiers retained until the app is updated

The Firefox ID in `manifest.config.ts` is a new listing identity. Users may need to add it to the app’s trusted extension settings before pairing.

## Attribution

The original MIT copyright notice is preserved in `LICENSE`. `README.md` and the popup About section credit the Motrix browser extension as the source project.
