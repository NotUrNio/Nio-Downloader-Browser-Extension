# Manual QA Checklist: Nio Downloader Extension

This checklist guides manual end-to-end verification of the extension with the real Nio Downloader desktop application on Windows, macOS, and Linux.

---

## Prerequisites
- Nio Downloader desktop application installed and running.
- Browser extension built (`pnpm run build:chromium` / `pnpm run build:firefox` / `pnpm run build:safari`).
- Extension loaded into browser:
  - Chrome / Edge / Brave: `dist/chromium`
  - Firefox: `dist/firefox`
  - Safari: Built app wrapper from `native/safari`

---

## 1. Native Host & First-Time Pairing

| # | Step | Expected Outcome | Pass/Fail |
|---|---|---|---|
| 1.1 | Open browser with desktop app closed. Click extension icon. | Popup status panel indicates backend is offline / connecting, offering retry. | [ ] |
| 1.2 | Launch Nio Downloader desktop app. Refresh extension popup. | Extension discovers local host. Displays pairing code dialog or prompt. | [ ] |
| 1.3 | Observe pairing request dialog in Nio Downloader desktop app. | Desktop shows browser name and extension ID requesting pairing. | [ ] |
| 1.4 | Accept pairing on desktop app. App presents an 8-character code. | Code is Crockford base32 (uppercase letters & digits, no I, L, O, U). | [ ] |
| 1.5 | Enter incorrect code in extension popup. | Popup displays error ("invalid code") and preserves remaining attempts. | [ ] |
| 1.6 | Enter correct 8-character code in extension popup. | Pairing succeeds. Popup displays connected status (green indicator) and download speeds. | [ ] |
| 1.7 | Close and reopen the browser. | Extension automatically reconnects without requiring the pairing code again. | [ ] |

---

## 2. Direct & Context Menu Download Handoff

| # | Step | Expected Outcome | Pass/Fail |
|---|---|---|---|
| 2.1 | Right-click a file link on any webpage. | Context menu shows "Download with Nio Downloader". | [ ] |
| 2.2 | Click "Download with Nio Downloader". | Task immediately appears in Nio Downloader with correct source URL. | [ ] |
| 2.3 | Right-click an image or media element and select download. | Correct image/media URL is submitted to Nio Downloader. | [ ] |
| 2.4 | Click a `magnet:?xt=...` link. | Magnet URL is captured and submitted to Nio Downloader with display name. | [ ] |
| 2.5 | Submit the exact same URL twice within 5 seconds. | Duplicate-send protection prevents redundant identical task creation. | [ ] |

---

## 3. Automatic Download Takeover (When Enabled)

| # | Step | Expected Outcome | Pass/Fail |
|---|---|---|---|
| 3.1 | In Extension Settings, enable "Automatic Download Takeover". | Consent modal explains cookie and URL interception permissions. | [ ] |
| 3.2 | Trigger a standard browser download (e.g. `.zip` file > 10MB). | Browser download is cancelled; Nio Downloader intercepts and starts the download. | [ ] |
| 3.3 | Download from an excluded domain (added to Settings exclude list). | Browser handles download natively; extension ignores it. | [ ] |
| 3.4 | Download with unknown Content-Length when policy set to Browser. | Download proceeds through the browser natively. | [ ] |

---

## 4. Media & Resource Sniffer

| # | Step | Expected Outcome | Pass/Fail |
|---|---|---|---|
| 4.1 | Navigate to a page with embedded videos/audio (e.g. HLS `.m3u8` or MP4). | Extension badge updates with detected resource count. | [ ] |
| 4.2 | Open popup and switch to the **Sniffer** tab. | Media items listed with stream format, bitrate, or resolution. | [ ] |
| 4.3 | Click download on a detected media stream. | Stream URL (HLS / DASH / direct) is submitted to Nio Downloader. | [ ] |
| 4.4 | Verify live stream / DRM behavior. | DRM-protected streams and unbounded live streams are rejected with appropriate error notice. | [ ] |

---

## 5. Remote Server Management (Optional)

| # | Step | Expected Outcome | Pass/Fail |
|---|---|---|---|
| 5.1 | In Settings → Integration, add a remote Nio Downloader server (`wss://...`). | Remote server endpoint is saved and validated. | [ ] |
| 5.2 | Switch active backend to the remote server. | Extension connects to remote server; cookie and header sharing remain OFF by default. | [ ] |
