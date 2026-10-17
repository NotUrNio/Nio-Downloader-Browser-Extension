# Extension Installation & Native Messaging Setup

This guide details how browsers locate the Nio Downloader native messaging host manifest, how the extension identity allowlist works, and how to configure development and production environments.

---

## 1. Native Messaging Host Overview

- **Host Identifier**: `com.nio.downloader.host`
- **Host Manifest Filename**: `com.nio.downloader.host.json`
- **Contract Specification**: [EXTENSION_CONTRACT.md in Nio Downloader](../../Nio-Downloader/docs/EXTENSION_CONTRACT.md)

When the extension calls `chrome.runtime.connectNative("com.nio.downloader.host")`, the browser looks up a registration entry in the system registry (Windows) or specific filesystem paths (macOS/Linux) to find the host executable path and allowed caller IDs.

---

## 2. Operating System Manifest Locations

### Windows (Registry HKCU)

The Nio Downloader installer and runtime manager create a registry key named `com.nio.downloader.host` whose default `(Default)` string value points to the path of `com.nio.downloader.host.json` (typically `%AppData%\Roaming\Nio Downloader\bridge\manifests\com.nio.downloader.host.json`):

- **Google Chrome**:
  `HKCU\Software\Google\Chrome\NativeMessagingHosts\com.nio.downloader.host`
- **Microsoft Edge**:
  `HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.nio.downloader.host`
- **Brave Browser**:
  `HKCU\Software\BraveSoftware\Brave-Browser\NativeMessagingHosts\com.nio.downloader.host`
- **Opera**:
  `HKCU\Software\Opera Software\NativeMessagingHosts\com.nio.downloader.host`
- **Mozilla Firefox**:
  `HKCU\Software\Mozilla\NativeMessagingHosts\com.nio.downloader.host`

### macOS

On macOS, browsers inspect JSON manifest files in user Application Support directories:

- **Google Chrome**:
  `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.nio.downloader.host.json`
- **Microsoft Edge**:
  `~/Library/Application Support/Microsoft Edge/NativeMessagingHosts/com.nio.downloader.host.json`
- **Brave Browser**:
  `~/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts/com.nio.downloader.host.json`
- **Opera**:
  `~/Library/Application Support/com.operasoftware.Opera/NativeMessagingHosts/com.nio.downloader.host.json`
- **Mozilla Firefox**:
  `~/Library/Application Support/Mozilla/NativeMessagingHosts/com.nio.downloader.host.json`

### Linux

On Linux, browsers inspect configuration directories under the user's home folder:

- **Google Chrome**:
  `~/.config/google-chrome/NativeMessagingHosts/com.nio.downloader.host.json`
- **Chromium**:
  `~/.config/chromium/NativeMessagingHosts/com.nio.downloader.host.json`
- **Microsoft Edge**:
  `~/.config/microsoft-edge/NativeMessagingHosts/com.nio.downloader.host.json`
- **Brave Browser**:
  `~/.config/BraveSoftware/Brave-Browser/NativeMessagingHosts/com.nio.downloader.host.json`
- **Mozilla Firefox**:
  `~/.mozilla/native-messaging-hosts/com.nio.downloader.host.json`

---

## 3. Host Manifest Structure & Allowlist

The manifest must contain `allowed_origins` (for Chromium browsers) or `allowed_extensions` (for Firefox).

### Chromium Manifest Example (`com.nio.downloader.host.json`)

```json
{
  "name": "com.nio.downloader.host",
  "description": "Nio Downloader browser download bridge",
  "path": "/path/to/nio-native-host",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://lggbokfckofcgjndaboioakcmincinpo/",
    "chrome-extension://efcflljngohddnmfmebiamigoikmdfbf/",
    "chrome-extension://<YOUR_DEVELOPMENT_EXTENSION_ID>/"
  ]
}
```

### Firefox Manifest Example (`com.nio.downloader.host.json`)

```json
{
  "name": "com.nio.downloader.host",
  "description": "Nio Downloader browser download bridge",
  "path": "/path/to/nio-native-host",
  "type": "stdio",
  "allowed_extensions": [
    "nio-downloader-extension@mozilla.org"
  ]
}
```

---

---

## 4. Keeping Extension ID Stable in Development

When loading an unpacked extension via `chrome://extensions`, `edge://extensions`, `brave://extensions`, or `opera://extensions`, Chromium generates a randomized extension ID each time the folder is removed and reloaded unless a public key is specified in `manifest.json`.

### Building the Development Variant with Stable ID

Run the dev build script:
```bash
pnpm run build:chromium:dev
```
This builds into `dist/chromium-dev/`, including a predefined public `"key"` field in `manifest.json` that guarantees the extension will always have the exact same 32-character ID across all browser profiles and reloads:
```
jbpflcefmjolnlliffidckmcpjobpbbl
```

To display the active extension ID and copy-paste origin configuration at any time, run:
```bash
pnpm run print:dev-id
```

### Where to Register the Extension ID

To allow the extension to communicate with Nio Downloader:

1. **Native Messaging Host Manifest (`com.nio.downloader.host.json`)**:
   Add `"chrome-extension://jbpflcefmjolnlliffidckmcpjobpbbl/"` to the `allowed_origins` array in:
   - macOS: `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.nio.downloader.host.json`
   - Windows: `%AppData%\Roaming\Nio Downloader\bridge\manifests\chrome.json`
   - Linux: `~/.config/google-chrome/NativeMessagingHosts/com.nio.downloader.host.json`

2. **Nio Downloader Desktop Application Allowlist**:
   - Open Nio Downloader.
   - Navigate to **Settings → Integration → Trusted Extensions**.
   - Add `jbpflcefmjolnlliffidckmcpjobpbbl`.

---

## 5. Loading the Extension in Browsers

### Google Chrome
1. Run `pnpm run build:chromium:dev` (for stable ID development) or `pnpm run build:chromium`.
2. Open `chrome://extensions`.
3. Toggle **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select `dist/chromium-dev` (or `dist/chromium`).
5. The extension card will appear. The extension ID is displayed on the card under the extension name (labeled **ID:**).

### Microsoft Edge
1. Run `pnpm run build:chromium:dev` or `pnpm run build:chromium`.
2. Open `edge://extensions`.
3. Toggle **Developer mode** in the left sidebar.
4. Click **Load unpacked** and select `dist/chromium-dev` (or `dist/chromium`).
5. Find the extension under "Installed extensions"; the ID is displayed directly below the extension title.

### Brave Browser
1. Run `pnpm run build:chromium:dev` or `pnpm run build:chromium`.
2. Open `brave://extensions`.
3. Toggle **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select `dist/chromium-dev` (or `dist/chromium`).
5. Inspect the extension card for the 32-character ID.

### Opera & Opera GX
1. Run `pnpm run build:chromium:dev` or `pnpm run build:chromium`.
2. Open `opera://extensions`.
3. Toggle **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select `dist/chromium-dev` (or `dist/chromium`).
5. **Add-ons Packaging & Store Distribution**:
   - Opera is built on the Chromium engine and natively supports Manifest V3 extensions built for Chromium.
   - Users can install Nio Downloader directly from the Chrome Web Store in Opera.
   - For official distribution on the **Opera Add-ons** store (`addons.opera.com`), package the zip from the standard store build (`pnpm run build:webstore`) and submit via the Opera Add-ons developer portal.

### Mozilla Firefox
1. Run `pnpm run build:firefox`.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...** and select `dist/firefox/manifest.json`.
4. The extension loads temporarily until Firefox restarts.
5. Note: Permanent installation of self-built unsigned extensions requires:
   - Signing via addons.mozilla.org (AMO unlisted signing), OR
   - Firefox Developer Edition / Firefox ESR with `xpinstall.signatures.required` set to `false` in `about:config`.

