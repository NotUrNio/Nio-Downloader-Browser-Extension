# Extension Permissions

This document explains the necessity and purpose of each permission requested by Nio Downloader Extension in `manifest.config.ts`.

---

## Standard Permissions

### `nativeMessaging`
- **Platforms**: Chromium (Chrome, Microsoft Edge, Brave, Opera, Vivaldi), Firefox. (Excluded on Safari).
- **Purpose**: Required to establish length-prefixed standard I/O communication with the desktop application native host (`com.nio.downloader.host`).

### `storage`
- **Purpose**: Persists extension configuration in `chrome.storage.local` and temporary session state in `chrome.storage.session`. This includes theme preferences, server endpoint configurations, download takeover rules, and authenticated connection credentials.

### `activeTab`
- **Purpose**: Grants temporary host access to the active tab when the user interacts with the extension popup or context menu, allowing media and link detection on the foreground page.

### `scripting`
- **Purpose**: Allows dynamic injection of resource sniffing scripts on demand when the user requests an explicit rescan or deep analysis of page media.

### `alarms`
- **Purpose**: Schedules low-frequency background keep-alive checks and periodic cleanup tasks for expired connection tombstones without running continuous CPU loops.

### `notifications`
- **Platforms**: Chromium, Firefox. (Excluded on Safari).
- **Purpose**: Surfaces native notifications when downloads complete or fail, or when an incoming pairing code requires user confirmation.

### `contextMenus`
- **Purpose**: Adds the "Download with Nio Downloader" entry to the browser right-click context menu for links, images, and audio/video elements.

### `downloads`
- **Platforms**: Chromium, Firefox. (Excluded on Safari).
- **Purpose**: Monitors and intercepts browser download events when download takeover is enabled, handing eligible files over to Nio Downloader.

### `cookies`
- **Purpose**: Reads cookies for the requested download URL so that authenticated sessions (e.g. cloud drives, forums, restricted downloads) can be preserved and passed with the download task to Nio Downloader.

### `webRequest`
- **Purpose**: Observes HTTP response headers (Content-Type, Content-Length, Content-Disposition) to determine file size and MIME type for automatic download takeover decisions.

### `webRequestBlocking`
- **Platforms**: Firefox Manifest V3 only.
- **Purpose**: Enables synchronous cancellation of browser downloads before the browser creates a partial local file, allowing clean IDM-style takeover. Forbidden by Chrome MV3 and therefore excluded on Chromium builds.

### `webNavigation`
- **Purpose**: Tracks navigation events (completed page transitions) to safely clear transient sniffer state and per-tab resource caches.

---

## Host Permissions

### `<all_urls>`
- **Purpose**: Allows the sniffer and takeover features to detect downloadable media streams and file links across all web sites the user visits. Cookie sharing and header forwarding are strictly opt-in and restricted to the domain of the active download target.
