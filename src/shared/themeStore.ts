import { extensionBrowser as browser } from '@/shared/browser'

const THEME_KEY = 'nio.theme'
const LEGACY_THEME_KEY = 'motrix.theme'

export type ThemeOverride = 'light' | 'dark'

export async function getThemeOverride(): Promise<ThemeOverride | null> {
  const got = (await browser.storage.local.get(THEME_KEY)) as Record<
    string,
    unknown
  >
  let v = got?.[THEME_KEY]
  if (v === undefined) {
    const leg = (await browser.storage.local.get(LEGACY_THEME_KEY)) as Record<
      string,
      unknown
    >
    v = leg?.[LEGACY_THEME_KEY]
  }
  return v === 'light' || v === 'dark' ? v : null
}

export async function setThemeOverride(v: ThemeOverride | null): Promise<void> {
  if (v === null) {
    await browser.storage.local.remove(THEME_KEY)
    await browser.storage.local.remove(LEGACY_THEME_KEY)
  } else {
    await browser.storage.local.set({ [THEME_KEY]: v })
    await browser.storage.local.remove(LEGACY_THEME_KEY)
  }
}

export { THEME_KEY }
