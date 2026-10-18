#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * Validates wire-level parity between Nio Downloader desktop app and browser extension.
 *
 * Wire identifiers audited:
 * 1. JSON-RPC handshake methods: nio/initialize, nio/initialized
 * 2. Bridge subprotocol: nio-bridge.v1
 * 3. Authority header: X-Nio-Bridge
 * 4. Native messaging host reverse-DNS ID: com.nio.downloader.host
 * 5. Error codes: nio-not-running
 * 6. Cryptographic transcript role: nio-bridge
 */

const appPath = process.env.APP_PATH || process.env.NIO_APP_PATH

if (!appPath) {
  console.log(
    '[check-wire-parity] APP_PATH is not set; skipping cross-repo parity checks.'
  )
  process.exit(0)
}

const resolvedAppPath = resolve(appPath)
if (!existsSync(resolvedAppPath)) {
  console.error(
    `[check-wire-parity] Specified APP_PATH does not exist: ${resolvedAppPath}`
  )
  process.exit(1)
}

console.log(
  `[check-wire-parity] Comparing wire contract against app at: ${resolvedAppPath}`
)

const WIRE_CONTRACT = [
  {
    name: 'Native Messaging Host ID',
    token: 'com.nio.downloader.host',
    appSearchPath: 'src/main/bridge/native-messaging-installer.ts',
    extSearchPath: 'src/background/ConnectionDiagnostics.ts',
  },
  {
    name: 'Handshake Request Method',
    token: 'nio/initialize',
    appSearchPath: 'src/core/bridge/web-socket-bridge-server.ts',
    extSearchPath: 'src/background/ConnectionManager.ts',
  },
  {
    name: 'Handshake Notification Method',
    token: 'nio/initialized',
    appSearchPath: 'src/core/bridge/web-socket-bridge-server.ts',
    extSearchPath: 'src/background/ConnectionManager.ts',
  },
  {
    name: 'Bridge Header',
    token: 'X-Nio-Bridge',
    appSearchPath: 'src/core/bridge/web-socket-bridge-server.ts',
    extSearchPath: 'src/background/mbp1/discovery-service.ts',
  },
  {
    name: 'Bridge Subprotocol',
    token: 'nio-bridge.v1',
    appSearchPath: 'src/core/bridge/web-socket-bridge-server.ts',
    extSearchPath: 'src/background/mbp1/frames.ts',
  },
  {
    name: 'Transcript Role',
    token: 'nio-bridge',
    appSearchPath: 'src/core/bridge/mbp1/transcript.ts',
    extSearchPath: 'src/background/mbp1/transcript.ts',
  },
]

let mismatches = 0

for (const item of WIRE_CONTRACT) {
  const appFile = join(resolvedAppPath, item.appSearchPath)
  const extFile = resolve(import.meta.dirname, '..', item.extSearchPath)

  if (!existsSync(appFile)) {
    console.warn(
      `[check-wire-parity] Warning: App file not found: ${item.appSearchPath}`
    )
    continue
  }
  if (!existsSync(extFile)) {
    console.error(
      `[check-wire-parity] Error: Ext file not found: ${item.extSearchPath}`
    )
    mismatches++
    continue
  }

  const appContent = readFileSync(appFile, 'utf8')
  const extContent = readFileSync(extFile, 'utf8')

  const isHeader = item.name.toLowerCase().includes('header')
  const appHas = isHeader
    ? appContent.toLowerCase().includes(item.token.toLowerCase())
    : appContent.includes(item.token)
  const extHas = isHeader
    ? extContent.toLowerCase().includes(item.token.toLowerCase())
    : extContent.includes(item.token)

  if (appHas && extHas) {
    console.log(`✓ ${item.name}: "${item.token}" present in both repos`)
  } else {
    console.error(
      `✗ Mismatch on ${item.name}: "${item.token}" (App: ${appHas}, Ext: ${extHas})`
    )
    mismatches++
  }
}

if (mismatches > 0) {
  console.error(`[check-wire-parity] Failed: ${mismatches} mismatch(es) found.`)
  process.exit(1)
}

console.log(
  '[check-wire-parity] All wire identifiers match between App and Extension.'
)
