# Safari Web Extension & Native Wrapper App

This guide details the architecture, build procedure, bundle identifiers, and distribution requirements for the Safari version of the Nio Downloader extension.

---

## 1. Architecture Overview

Safari uses the **Safari Web Extension** architecture (`SafariWebExtensionHandler`):
- **Container Application**: `Nio Downloader for Safari.app` (`app.niodownloader.safari`)
- **Web Extension Target**: `Nio Downloader for Safari Extension.appex` (`app.niodownloader.safari.extension`)
- **Shared App Group**: `<TEAM_ID>.app.niodownloader.shared`
- **Native IPC & Bootstrap**: Communicates with the desktop application via local XPC service / loopback bridge.

### Capabilities & Limitations
Unlike Chromium and Firefox:
- **No Automatic Download Takeover**: Safari Web Extensions do not support blocking webRequest interception for transparent download redirection. Downloads are sent to Nio Downloader via context menus, popup actions, and explicit page captures.
- **Native Notifications**: Delegated to the native macOS Notification Center via the container app's `NotificationDispatcher`.

---

## 2. Bundle Identifiers & Entitlements

The project enforces consistent bundle identifiers across all targets:

| Component | Bundle Identifier | Required Entitlements |
| :--- | :--- | :--- |
| Container App | `app.niodownloader.safari` | App Sandbox, Network Client |
| Safari Extension Target | `app.niodownloader.safari.extension` | App Sandbox, Network Client |
| App Group | `app.niodownloader.shared` | `com.apple.security.application-groups` |

---

## 3. Building for Local Development

### Prerequisites
- macOS 13.0 or later
- Xcode 15+ (tested with Xcode 27)
- Command Line Tools (`xcode-select --install`)
- Node.js 22+ & pnpm

### Build Commands

1. **Build Web Extension Assets**:
   ```bash
   pnpm run build:safari
   ```
   Outputs web extension assets to `dist/safari/`.

2. **Generate Xcode Project & Build Wrapper App**:
   ```bash
   node scripts/safari-native.mjs --build
   ```
   This generates the Xcode project at `.cache/safari-native/project/Nio Downloader for Safari/` and compiles the ad-hoc signed debug application.

3. **Running the Unit Tests**:
   ```bash
   swift test --package-path native/safari --build-path /tmp/nio-safari-swift-build
   ```

### Loading the Extension in Safari

1. Open **Safari**.
2. Go to **Safari → Settings → Advanced** and enable **"Show features for web developers"**.
3. In the menu bar, open **Develop** and check **"Allow Unsigned Extensions"**.
4. Launch the built container app (`Nio Downloader for Safari.app`).
5. In **Safari → Settings → Extensions**, check the box next to **Nio Downloader**.

---

## 4. Production Signing & Distribution Requirements

To distribute Nio Downloader for Safari to end users, one of two distribution paths must be followed:

### Path A: Mac App Store
1. **Apple Developer Program**: Requires an active Apple Developer Program membership ($99/year).
2. **Certificates & Profiles**:
   - Apple Distribution Certificate
   - Mac App Store Provisioning Profiles for both `app.niodownloader.safari` and `app.niodownloader.safari.extension` with the App Group capability.
3. **Build Command**:
   ```bash
   NIODOWNLOADER_SAFARI_RELEASE=1 NIODOWNLOADER_SAFARI_TEAM_ID="<TEAM_ID>" node scripts/safari-native.mjs --archive --build --signed
   ```
4. **Submission**: Upload the `.pkg` or `.xcarchive` via Transporter or Xcode Organizer to App Store Connect.

### Path B: Notarized Direct Download (Developer ID)
1. **Developer ID Application Certificate**: Sign both the `.appex` and `.app` with your Developer ID Application certificate.
2. **Hardened Runtime**: Must be enabled (`ENABLE_HARDENED_RUNTIME=YES`).
3. **Notarization**:
   ```bash
   xcrun notarytool submit Nio-Downloader-Safari.zip --keychain-profile "<PROFILE>" --wait
   xcrun stapler staple "Nio Downloader for Safari.app"
   ```
