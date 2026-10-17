import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getLocaleOverride, setLocaleOverride } from '@/shared/localeStore'
import { SUPPORTED_LOCALES } from '@/shared/supportedLocales'

declare const browser: {
  storage: {
    local: {
      get: (k: string) => Promise<Record<string, unknown>>
      set: (i: Record<string, unknown>) => Promise<void>
      remove: (k: string) => Promise<void>
    }
  }
}

beforeEach(() => {
  let bag: Record<string, unknown> = {}
  browser.storage.local.get = vi.fn(async (k: string | string[]) => {
    const keys = Array.isArray(k) ? k : [k]
    const res: Record<string, unknown> = {}
    for (const key of keys) {
      if (key in bag) res[key] = bag[key]
    }
    return res
  })
  browser.storage.local.set = vi.fn(async (i: Record<string, unknown>) => {
    bag = { ...bag, ...i }
  })
  browser.storage.local.remove = vi.fn(async (k: string | string[]) => {
    const keys = Array.isArray(k) ? k : [k]
    for (const key of keys) delete bag[key]
  })
})

describe('localeStore', () => {
  it('defaults to null (follow browser)', async () => {
    expect(await getLocaleOverride()).toBeNull()
  })
  it.each(SUPPORTED_LOCALES)('persists %s', async (locale) => {
    await setLocaleOverride(locale)
    expect(await getLocaleOverride()).toBe(locale)
  })
  it('ignores unsupported stored values', async () => {
    await browser.storage.local.set({ 'nio.locale': 'unknown' })
    expect(await getLocaleOverride()).toBeNull()
  })
  it('clears the override with null', async () => {
    await setLocaleOverride('en-US')
    await setLocaleOverride(null)
    expect(await getLocaleOverride()).toBeNull()
  })
})
