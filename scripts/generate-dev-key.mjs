#!/usr/bin/env node
import { createHash, generateKeyPairSync } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Generates an RSA keypair for Chromium extension development.
 *
 * Chromium computes the extension ID for unpacked extensions from the "key"
 * field in manifest.json:
 * 1. Takes the DER-encoded SubjectPublicKeyInfo (SPKI).
 * 2. Computes the SHA-256 digest.
 * 3. Takes the first 16 bytes (128 bits / 32 hex nibbles).
 * 4. Maps each hex character [0-9a-f] to [a-p] (0 -> a, 1 -> b, ..., f -> p).
 */
export function generateExtensionKey() {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'der',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  })

  const base64Key = publicKey.toString('base64')
  const sha256 = createHash('sha256').update(publicKey).digest('hex')
  const extensionId = sha256
    .slice(0, 32)
    .split('')
    .map((char) => {
      const code = parseInt(char, 16)
      return String.fromCharCode('a'.charCodeAt(0) + code)
    })
    .join('')

  return {
    extensionId,
    publicKeyBase64: base64Key,
    privateKeyPem: privateKey,
  }
}

function main() {
  const args = process.argv.slice(2)
  const savePrivateKey = args.includes('--save-private')
  const keyInfo = generateExtensionKey()

  console.log('Generated Extension Key:')
  console.log(`- Extension ID: ${keyInfo.extensionId}`)
  console.log(`- Manifest "key" field:\n"${keyInfo.publicKeyBase64}"\n`)
  console.log(
    'Add the "key" field to your manifest.config.ts or manifest.json during development'
  )
  console.log(
    'to keep your extension ID stable across reloads and browser profiles.'
  )
  console.log(
    `Ensure "${keyInfo.extensionId}" is added to Nio Downloader's trusted extensions list.`
  )

  if (savePrivateKey) {
    const outPath = resolve(process.cwd(), 'dev-extension-key.pem')
    writeFileSync(outPath, keyInfo.privateKeyPem, 'utf8')
    console.log(`Private key written to: ${outPath}`)
  }
}

if (process.argv[1]?.endsWith('generate-dev-key.mjs')) {
  main()
}
