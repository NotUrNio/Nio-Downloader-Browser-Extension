#!/usr/bin/env node
import { createHash, createPublicKey } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DEFAULT_DEV_PUBLIC_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqq0xWsFmcrTzx1eiOMWXCSMKLph3mjbm9m1nhpuuNvoidZfWtx0MIb6LgGn3yVMA3jhY6pbuvtF87G1I6Rwdg4qxayyEa7f+n3IY76qkvSAI06HF2DKwcx/K+aJDMPeTUVz3lOWiqYIxdd0rfUuIj4/5miF2oK7bzSbsRyhTuARcL63dl9xZWp0NTjYvzbB1kExQ7l5C6B5YVQmHf23v40DNDsAj3uud5zMHQ+plWxtmpn8h6BHbgUh3VKYVpjrOSkimWFPSVXDes491hYXa8bZMCKBDCOtq/qHH4RjGSlGBmzeeVRRnIgnHzj/7NNY5+PbLgEatqsL84efCj+elTwIDAQAB'

export function computeExtensionId(publicKeyDer) {
  const sha256 = createHash('sha256').update(publicKeyDer).digest('hex')
  return sha256
    .slice(0, 32)
    .split('')
    .map((char) => {
      const code = Number.parseInt(char, 16)
      return String.fromCharCode('a'.charCodeAt(0) + code)
    })
    .join('')
}

export function resolvePublicKeyDer(keyInput) {
  if (!keyInput) {
    return Buffer.from(DEFAULT_DEV_PUBLIC_KEY, 'base64')
  }

  const trimmed = keyInput.trim()
  if (trimmed.startsWith('-----BEGIN')) {
    const keyObject = createPublicKey(trimmed)
    return keyObject.export({ type: 'spki', format: 'der' })
  }

  // Raw base64 string
  return Buffer.from(trimmed.replace(/\s+/g, ''), 'base64')
}

function findKeySource() {
  const customPath = process.argv[2] || process.env.DEV_KEY_PATH
  if (customPath && existsSync(customPath)) {
    return readFileSync(customPath, 'utf8')
  }

  // Check sibling work directory relative to repository root
  const workDirKey = resolve(
    import.meta.dirname,
    '../../_work/keys/dev-extension-key.pem'
  )
  if (existsSync(workDirKey)) {
    return readFileSync(workDirKey, 'utf8')
  }

  const workDirPub = resolve(
    import.meta.dirname,
    '../../_work/keys/dev-extension-key.pub.txt'
  )
  if (existsSync(workDirPub)) {
    return readFileSync(workDirPub, 'utf8')
  }

  return process.env.NIODOWNLOADER_DEV_PUBLIC_KEY || DEFAULT_DEV_PUBLIC_KEY
}

function main() {
  const keySource = findKeySource()
  const der = resolvePublicKeyDer(keySource)
  const extensionId = computeExtensionId(der)
  const origin = `chrome-extension://${extensionId}/`

  console.log('Nio Downloader Extension Development ID')
  console.log('-----------------------------------------')
  console.log(`Extension ID:    ${extensionId}`)
  console.log(`Allowed Origin:  ${origin}\n`)
  console.log('Configuration Instructions:')
  console.log('1. Native Messaging Host Manifest (allowed_origins):')
  console.log(`   Add "${origin}" to the "allowed_origins" array in:`)
  console.log(
    '   - macOS:   ~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.nio.downloader.host.json'
  )
  console.log(
    '   - Windows: %AppData%\\Nio Downloader\\bridge\\manifests\\chrome.json'
  )
  console.log(
    '   - Linux:   ~/.config/google-chrome/NativeMessagingHosts/com.nio.downloader.host.json\n'
  )
  console.log('2. Desktop App Integration Settings:')
  console.log(
    `   In Nio Downloader: Settings -> Integration -> Trusted Extensions`
  )
  console.log(`   Add "${extensionId}" to allow browser extension pairing.`)
}

main()
