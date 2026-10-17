# Browser Compatibility & Native Messaging Directory Reference

This document maps all major web browsers to their extension engine compatibility, their platform-specific Native Messaging host manifest locations, and whether the Nio Downloader desktop application (`../Nio-Downloader`) registers them automatically.

---

## 1. Extension Engine Compatibility

| Browser | Engine | Can Use Chromium Build (`dist/chromium` / `dist/webstore`)? | Manifest Format | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Google Chrome** | Chromium / Blink | **Yes** | MV3 | Full support for service workers, downloads, declarativeNetRequest / webRequest, nativeMessaging. |
| **Microsoft Edge** | Chromium / Blink | **Yes** | MV3 | Fully compatible with `dist/webstore`. Published via Edge Add-ons or sideloaded. |
| **Brave Browser** | Chromium / Blink | **Yes** | MV3 | Uses Chromium build directly. Built-in Shields do not block local loopback WebSocket or Native Messaging. |
| **Vivaldi** | Chromium / Blink | **Yes** | MV3 | Uses Chromium build directly. Installs from Chrome Web Store or unpacked. |
| **Arc** | Chromium / Blink | **Yes** | MV3 | Built on Chromium; loads standard unpacked Chromium extensions and CWS. |
| **Opera & Opera GX** | Chromium / Blink | **Yes** | MV3 | Fully compatible. Can install from CWS or via Opera Add-ons. |
| **Mozilla Firefox** | Gecko | **No** (Requires `dist/firefox`) | MV3 | Uses background scripts module, `webRequestBlocking`, specific CSP. |
| **Apple Safari** | WebKit | **No** (Requires `dist/safari` + `.app`) | MV3 + AppKit | Requires Swift App Extension wrapper and App Group for notifications. |

---

## 2. Native Messaging Host Manifest Folders by Operating System

### macOS

| Browser | Manifest Path | Registered by Nio Downloader App? |
| :--- | :--- | :--- |
| **Google Chrome** | `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.nio.downloader.host.json` | **Yes** |
| **Microsoft Edge** | `~/Library/Application Support/Microsoft Edge/NativeMessagingHosts/com.nio.downloader.host.json` | **Yes** |
| **Mozilla Firefox** | `~/Library/Application Support/Mozilla/NativeMessagingHosts/com.nio.downloader.host.json` | **Yes** |
| **Brave Browser** | `~/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts/com.nio.downloader.host.json` | **No** *(Relies on Chrome directory fallback)* |
| **Vivaldi** | `~/Library/Application Support/Vivaldi/NativeMessagingHosts/com.nio.downloader.host.json` | **No** |
| **Opera** | `~/Library/Application Support/com.operasoftware.Opera/NativeMessagingHosts/com.nio.downloader.host.json` | **No** |
| **Arc** | `~/Library/Application Support/Arc/User Data/NativeMessagingHosts/com.nio.downloader.host.json` | **No** |

---

### Windows (Registry HKCU)

| Browser | Registry Key Path | Registered by Nio Downloader App? |
| :--- | :--- | :--- |
| **Google Chrome** | `HKCU\Software\Google\Chrome\NativeMessagingHosts\com.nio.downloader.host` | **Yes** |
| **Microsoft Edge** | `HKCU\Software\Microsoft\Edge\NativeMessagingHosts\com.nio.downloader.host` | **Yes** |
| **Mozilla Firefox** | `HKCU\Software\Mozilla\NativeMessagingHosts\com.nio.downloader.host` | **Yes** |
| **Opera Software** | `HKCU\Software\Opera Software\NativeMessagingHosts\com.nio.downloader.host` | **Yes** |
| **Brave Browser** | `HKCU\Software\BraveSoftware\Brave-Browser\NativeMessagingHosts\com.nio.downloader.host` | **No** *(Relies on Chrome registry fallback)* |
| **Vivaldi** | `HKCU\Software\Vivaldi\NativeMessagingHosts\com.nio.downloader.host` | **No** |

---

### Linux

| Browser | Manifest Path | Registered by Nio Downloader App? |
| :--- | :--- | :--- |
| **Google Chrome** | `~/.config/google-chrome/NativeMessagingHosts/com.nio.downloader.host.json` | **Yes** |
| **Chromium** | `~/.config/chromium/NativeMessagingHosts/com.nio.downloader.host.json` | **Yes** |
| **Microsoft Edge** | `~/.config/microsoft-edge/NativeMessagingHosts/com.nio.downloader.host.json` | **Yes** |
| **Mozilla Firefox** | `~/.mozilla/native-messaging-hosts/com.nio.downloader.host.json` | **Yes** |
| **Brave Browser** | `~/.config/BraveSoftware/Brave-Browser/NativeMessagingHosts/com.nio.downloader.host.json` | **No** *(Relies on Chromium directory fallback)* |
| **Vivaldi** | `~/.config/vivaldi/NativeMessagingHosts/com.nio.downloader.host.json` | **No** |
| **Opera** | `~/.config/opera/NativeMessagingHosts/com.nio.downloader.host.json` | **No** |

---

## 3. Desktop App Host Registration Audit Findings

Inspection of [`Nio-Downloader/src/main/bridge/native-messaging-installer.ts`](../../Nio-Downloader/src/main/bridge/native-messaging-installer.ts):

1. **Covered Browsers**:
   - **Chrome, Edge, Firefox**: Fully registered across macOS, Windows, and Linux.
   - **Chromium**: Registered on Linux.
   - **Opera**: Registered in the Windows Registry (`HKCU\Software\Opera Software\NativeMessagingHosts\com.nio.downloader.host`), but **not** registered in the filesystem on macOS or Linux.
2. **Unregistered Browsers (Nothing Registered by Desktop App)**:
   - **Brave Browser**: No entries registered on macOS, Windows, or Linux. Brave often succeeds on macOS/Windows by falling back to Chrome's native messaging registry key / directory, but Linux users running Brave with separate profile directories will not discover the host unless a symlink to `~/.config/BraveSoftware/Brave-Browser/NativeMessagingHosts/` is manually created.
   - **Vivaldi**: No entries registered on any platform.
   - **Arc**: No entries registered on macOS or Windows.
   - **Opera on macOS & Linux**: Desktop app registers Opera on Windows only; macOS (`~/Library/Application Support/com.operasoftware.Opera/`) and Linux (`~/.config/opera/`) have no registered host manifest.
