# Safari build status

Safari distribution is paused. The current Safari Web Extension build does not expose the browser downloads API required by the automatic download takeover implementation, so this build cannot offer the same takeover behavior as Chrome and Firefox.

The Safari bundle and native bootstrap retain compatibility identifiers used by the current Nio Downloader app. Do not distribute a Safari package until the app and extension have a coordinated identifier update and a supported automatic takeover path.

The local `pnpm run build:safari` command builds and verifies extension resources only. Native packaging requires macOS and Xcode; this repository does not currently publish a Safari release.
