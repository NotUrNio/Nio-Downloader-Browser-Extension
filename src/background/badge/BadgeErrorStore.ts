import { extensionBrowser as browser } from '@/shared/browser'

const STORAGE_KEY = 'nio.badgeError'
const LEGACY_STORAGE_KEY = 'motrix.badgeError'

export class BadgeErrorStore {
  async get(): Promise<boolean> {
    const obj = (await browser.storage.local.get(STORAGE_KEY)) as Record<
      string,
      unknown
    >
    let v = obj[STORAGE_KEY]
    if (v === undefined) {
      const legacyObj = (await browser.storage.local.get(
        LEGACY_STORAGE_KEY
      )) as Record<string, unknown>
      v = legacyObj[LEGACY_STORAGE_KEY]
    }
    return typeof v === 'boolean' ? v : false
  }

  async set(v: boolean): Promise<void> {
    await browser.storage.local.set({ [STORAGE_KEY]: v })
  }
}
