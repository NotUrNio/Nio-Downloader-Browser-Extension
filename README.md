# Nio Downloader Extension

The companion browser extension for [Nio Downloader](https://github.com/NotUrNio/Nio-Downloader). Send downloads from your browser directly to Nio Downloader, inspect download progress, and manage tasks from the extension popup.

## Features

- Right-click links and choose **Download with Nio Downloader**
- Capture and intercept browser downloads based on configurable file size thresholds and site exclusions
- Scan media resources (video, audio, images) loaded by the current page and submit them
- Inspect transfer speed, progress, and download status
- Connect seamlessly to the local Nio Downloader desktop app or remote headless servers via the MDXP / MBP1 protocol

## Building from Source

### Prerequisites

- Node.js 22.x, 24.x, or 26.x
- pnpm 12.x

### Build Steps

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the extension for Chromium (Google Chrome, Microsoft Edge, Brave, etc.):
   ```bash
   pnpm run build
   ```

   The built extension will be located in `dist/chromium`.

3. Load the unpacked extension in your browser:
   - Navigate to `chrome://extensions` (or `edge://extensions`).
   - Enable **Developer mode** in the top right.
   - Click **Load unpacked** and select the `dist/chromium` directory.

4. Run tests:
   ```bash
   pnpm test
   ```

## Native Messaging Host

The extension communicates with Nio Downloader using the native messaging host:
- Host ID: `com.nio.downloader.host`
- Protocol: MDXP (Download eXchange Protocol) / MBP1

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for details.
