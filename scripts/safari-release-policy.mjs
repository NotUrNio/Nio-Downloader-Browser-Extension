import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Release archives must never inherit an opt-in local diagnostic configuration. */
export function validateSafariReleaseOptions(args, environment) {
  if (!args.has('--archive')) return
  if (environment.NIODOWNLOADER_SAFARI_RELEASE !== '1')
    throw new Error(
      'Archive requires NIODOWNLOADER_SAFARI_RELEASE=1 and a release web build'
    )
  for (const flag of ['--build', '--bootstrap-client-only'])
    if (!args.has(flag)) throw new Error(`Archive requires ${flag}`)
  if (args.has('--signed') === args.has('--unsigned-archive'))
    throw new Error('Choose exactly one of --signed and --unsigned-archive')
  if (args.has('--unsigned-archive')) {
    if (!/^[A-Z0-9]{10}$/.test(environment.NIODOWNLOADER_SAFARI_TEAM_ID ?? ''))
      throw new Error('Unsigned archive requires NIODOWNLOADER_SAFARI_TEAM_ID')
    safariCIBuildNumber(environment.NIODOWNLOADER_SAFARI_BUILD_NUMBER)
  }
  if (args.has('--bootstrap') || args.has('--bootstrap-development-host'))
    throw new Error('Archive must use the sandboxed client-only container')
  for (const name of [
    'NIODOWNLOADER_SAFARI_FEATURE_PROBE',
    'NIODOWNLOADER_SAFARI_VERIFY_PORT',
    'NIO_DEV_PAIR_BACKOFF_MS',
  ])
    if (environment[name] !== undefined)
      throw new Error(
        `Remove development environment variable ${name} before archiving`
      )
}

export function safariCIBuildNumber(value) {
  if (!/^[1-9][0-9]{0,4}$/.test(value ?? '') || Number(value) > 65535)
    throw new Error(
      'NIODOWNLOADER_SAFARI_BUILD_NUMBER must be an integer from 1 to 65535'
    )
  return Number(value)
}

export function verifySafariReleaseResources(directory) {
  function visit(path) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const file = join(path, entry.name)
      if (entry.isDirectory()) {
        visit(file)
        continue
      }
      if (!entry.isFile())
        throw new Error(`Unexpected release resource: ${file}`)
      if (/\.map$|(?:popup|options)-preview\.html$/.test(entry.name))
        throw new Error(`Development resource in Safari archive: ${entry.name}`)
      if (/\.(?:js|html)$/.test(entry.name)) {
        const source = readFileSync(file, 'utf8')
        if (
          /sourceMappingURL|nio(?:downloader)?\.safari\.featureProbe\.v1|safariNativeProbe|Nio Native Verification|@vite\/client/.test(
            source
          )
        )
          throw new Error(`Development code in Safari archive: ${entry.name}`)
      }
    }
  }
  visit(directory)
  const manifest = JSON.parse(
    readFileSync(join(directory, 'manifest.json'), 'utf8')
  )
  const isAllowedName =
    manifest.name === 'Nio Downloader Extension' ||
    manifest.name === 'Nio Downloader Plugin' ||
    manifest.name === '__MSG_appName__'
  if (!isAllowedName || !manifest.permissions?.includes('nativeMessaging'))
    throw new Error(
      'Archive requires the packaged Nio Downloader Extension manifest'
    )
}
