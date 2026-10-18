import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const version = pkg.version
const outDir = join(root, 'artifacts')

mkdirSync(outDir, { recursive: true })

console.log(`Packaging Nio Downloader Browser Extension v${version}...`)

function zipDirectory(sourceDir, targetZip) {
  if (existsSync(targetZip)) {
    execFileSync('rm', ['-f', targetZip])
  }
  // Use zip -9 -X -q -r from inside source directory so entries are root-relative
  const result = spawnSync('zip', ['-9', '-X', '-q', '-r', targetZip, '.'], {
    cwd: sourceDir,
    stdio: 'inherit',
  })
  if (result.status !== 0) {
    throw new Error(
      `Failed to create ${basename(targetZip)}: exit ${result.status}`
    )
  }
}

// 1. Chromium package (from dist/webstore)
const chromiumZip = join(
  outDir,
  `nio-downloader-extension-${version}-chromium.zip`
)
const chromeEdgeZip = join(
  outDir,
  `nio-downloader-extension-${version}-chrome-edge.zip`
)
const webstoreDist = join(root, 'dist/webstore')
if (!existsSync(webstoreDist)) {
  console.log('Building webstore variant...')
  execFileSync('pnpm', ['run', 'build:webstore'], {
    cwd: root,
    stdio: 'inherit',
  })
}
zipDirectory(webstoreDist, chromiumZip)
copyFileSync(chromiumZip, chromeEdgeZip)
console.log(
  `✓ Created ${basename(chromiumZip)} (and ${basename(chromeEdgeZip)})`
)

// 2. Firefox package (from dist/firefox)
const firefoxZip = join(
  outDir,
  `nio-downloader-extension-${version}-firefox.zip`
)
const firefoxDist = join(root, 'dist/firefox')
if (!existsSync(firefoxDist)) {
  console.log('Building firefox variant...')
  execFileSync('pnpm', ['run', 'build:firefox'], {
    cwd: root,
    stdio: 'inherit',
  })
}
zipDirectory(firefoxDist, firefoxZip)
console.log(`✓ Created ${basename(firefoxZip)}`)

// 3. Firefox source package (including AMO_BUILD.md, package.json, pnpm-lock.yaml, etc.)
const firefoxSourceZip = join(
  outDir,
  `nio-downloader-extension-${version}-firefox-source.zip`
)
const genericSourceZip = join(
  outDir,
  `nio-downloader-extension-${version}-source.zip`
)
const gitArchiveResult = spawnSync(
  'git',
  ['archive', '--format=zip', `--output=${firefoxSourceZip}`, 'HEAD'],
  { cwd: root, stdio: 'inherit' }
)
if (gitArchiveResult.status !== 0) {
  throw new Error(`git archive failed with status ${gitArchiveResult.status}`)
}
copyFileSync(firefoxSourceZip, genericSourceZip)
console.log(
  `✓ Created ${basename(firefoxSourceZip)} (and ${basename(genericSourceZip)})`
)

// 4. Safari unsigned package
const safariZip = join(
  outDir,
  `nio-downloader-extension-${version}-safari-unsigned.zip`
)
const safariDist = join(root, 'dist/safari')
if (!existsSync(safariDist)) {
  console.log('Building safari variant...')
  execFileSync('pnpm', ['run', 'build:safari'], { cwd: root, stdio: 'inherit' })
}
zipDirectory(safariDist, safariZip)
console.log(`✓ Created ${basename(safariZip)}`)

// 5. Store assets package
const storeAssetsZip = join(outDir, `store-assets-${version}.zip`)
const tempAssetsDir = join(root, '.cache/store-assets-temp')
if (existsSync(tempAssetsDir)) {
  execFileSync('rm', ['-rf', tempAssetsDir])
}
mkdirSync(tempAssetsDir, { recursive: true })
mkdirSync(join(tempAssetsDir, 'icons'), { recursive: true })
mkdirSync(join(tempAssetsDir, 'locales'), { recursive: true })
mkdirSync(join(tempAssetsDir, 'docs'), { recursive: true })

// Copy icons
for (const icon of readdirSync(join(root, 'public/icons'))) {
  copyFileSync(
    join(root, 'public/icons', icon),
    join(tempAssetsDir, 'icons', icon)
  )
}
if (existsSync(join(root, 'public/app-icon.png'))) {
  copyFileSync(
    join(root, 'public/app-icon.png'),
    join(tempAssetsDir, 'app-icon.png')
  )
}

// Copy locales
const localesDir = join(root, 'public/_locales')
if (existsSync(localesDir)) {
  for (const locale of readdirSync(localesDir)) {
    const localeSrc = join(localesDir, locale)
    if (statSync(localeSrc).isDirectory()) {
      mkdirSync(join(tempAssetsDir, 'locales', locale), { recursive: true })
      copyFileSync(
        join(localeSrc, 'messages.json'),
        join(tempAssetsDir, 'locales', locale, 'messages.json')
      )
    }
  }
}

// Copy docs
if (existsSync(join(root, 'docs/STORE_IDENTIFIERS.md'))) {
  copyFileSync(
    join(root, 'docs/STORE_IDENTIFIERS.md'),
    join(tempAssetsDir, 'docs/STORE_IDENTIFIERS.md')
  )
}
if (existsSync(join(root, 'docs/store-submission.md'))) {
  copyFileSync(
    join(root, 'docs/store-submission.md'),
    join(tempAssetsDir, 'docs/store-submission.md')
  )
}
copyFileSync(join(root, 'README.md'), join(tempAssetsDir, 'README.md'))

zipDirectory(tempAssetsDir, storeAssetsZip)
execFileSync('rm', ['-rf', tempAssetsDir])
console.log(`✓ Created ${basename(storeAssetsZip)}`)

// 6. Generate SHA256SUMS.txt
const zipFiles = readdirSync(outDir)
  .filter((f) => f.endsWith('.zip'))
  .sort()

const checksumLines = zipFiles.map((file) => {
  const content = readFileSync(join(outDir, file))
  const hash = createHash('sha256').update(content).digest('hex')
  return `${hash}  ${file}`
})

const checksumFile = join(outDir, 'SHA256SUMS.txt')
writeFileSync(checksumFile, `${checksumLines.join('\n')}\n`)
console.log(
  `✓ Generated ${basename(checksumFile)} for ${zipFiles.length} archives:`
)
for (const line of checksumLines) {
  console.log(`  ${line}`)
}

console.log('\nPackaging complete!')
