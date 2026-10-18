# Store Identifiers & Extension IDs

This document records the official store and development identifiers for the Nio Downloader Browser Extension across supported browsers.

## Firefox (AMO)

- **Add-on GUID**: `{f3165928-2a14-4142-88b8-561b818602a6}`
- **Manifest Setting**: `browser_specific_settings.gecko.id`
- **Native Messaging Host Allowlist**: Listed in desktop app's `src/shared/config/native-messaging-extensions.json`

## Chromium (Chrome Web Store, Microsoft Edge Add-ons, Opera Add-ons)

- **Store-Assigned IDs**:
  - Chrome Web Store / Edge: `efcflljngohddnmfmebiamigoikmdfbf`
  - Secondary / Legacy: `lggbokfckofcgjndaboioakcmincinpo`
- **Development Extension ID**: `jbpflcefmjolnlliffidckmcpjobpbbl`
  - Derived deterministically from dev private key (`dev-extension-key.pem`).
  - Used for local native messaging testing without submitting to store.

## Safari (macOS / iOS)

- **App Bundle ID**: `app.niodownloader.safari`
- **Extension Bundle ID**: `app.niodownloader.safari.extension`
- **App Group ID**: `group.app.niodownloader.safari`
- **Native Host ID**: `com.nio.downloader.host`

