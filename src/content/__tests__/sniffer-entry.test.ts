import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SnifferHandle } from '@/content/mediaSniffer'

type SnifferWindow = Window & {
  __nioSniffer?: SnifferHandle
}

const snifferWindow = window as SnifferWindow

afterEach(() => {
  snifferWindow.__nioSniffer?.uninstall()
  delete snifferWindow.__nioSniffer
  vi.restoreAllMocks()
})

describe('sniffer-entry reinjection', () => {
  it('re-harvests through the existing handle instead of stacking hooks', async () => {
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
      { name: 'https://cdn.test/master.m3u8' },
    ] as unknown as PerformanceEntryList)
    const postMessage = vi.spyOn(window, 'postMessage')

    await import('@/content/sniffer-entry')
    const installedHandle = snifferWindow.__nioSniffer
    expect(installedHandle).toBeDefined()
    expect(postMessage).toHaveBeenCalledOnce()
    expect(postMessage).toHaveBeenLastCalledWith(
      { source: 'nio-sniffer', type: 'hello' },
      '*'
    )

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: { source: 'nio-sniffer-relay', type: 'ready' },
      })
    )
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'nio-sniffer',
        type: 'media',
        items: expect.arrayContaining([
          expect.objectContaining({
            url: 'https://cdn.test/master.m3u8',
          }),
        ]),
      }),
      '*'
    )
    expect(postMessage).toHaveBeenLastCalledWith(
      { source: 'nio-sniffer', type: 'ack' },
      '*'
    )

    postMessage.mockClear()
    vi.resetModules()
    await import('@/content/sniffer-entry')

    expect(snifferWindow.__nioSniffer).toBe(installedHandle)
    expect(postMessage).toHaveBeenCalledOnce()
  })
})
