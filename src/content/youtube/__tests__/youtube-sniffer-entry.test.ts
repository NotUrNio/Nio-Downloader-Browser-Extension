import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { YoutubeSnifferHandle } from '@/content/youtube/youtubeSniffer'

type YoutubeWindow = Window & {
  __nioYoutubeSniffer?: YoutubeSnifferHandle
}

const youtubeWindow = window as YoutubeWindow
const VIDEO_URL =
  'https://r1.googlevideo.com/videoplayback?itag=137&entry=video'
const AUDIO_URL =
  'https://r1.googlevideo.com/videoplayback?itag=140&entry=audio'

describe('youtube-sniffer-entry lifecycle', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
      { name: VIDEO_URL },
      { name: AUDIO_URL },
    ] as unknown as PerformanceEntryList)
  })

  afterEach(() => {
    youtubeWindow.__nioYoutubeSniffer?.uninstall()
    delete youtubeWindow.__nioYoutubeSniffer
    vi.restoreAllMocks()
  })

  it('posts an explicit media envelope and clears its global handle on uninstall', async () => {
    const postMessage = vi.spyOn(window, 'postMessage')

    await import('@/content/youtube-sniffer-entry')
    const firstHandle = youtubeWindow.__nioYoutubeSniffer

    expect(firstHandle).toBeDefined()
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'nio-sniffer',
        type: 'media',
        items: [
          expect.objectContaining({
            kind: 'mux',
            url: VIDEO_URL,
            audioUrl: AUDIO_URL,
          }),
        ],
      }),
      '*'
    )

    firstHandle?.uninstall()
    expect(youtubeWindow.__nioYoutubeSniffer).toBeUndefined()

    vi.resetModules()
    await import('@/content/youtube-sniffer-entry')
    expect(youtubeWindow.__nioYoutubeSniffer).toBeDefined()
    expect(youtubeWindow.__nioYoutubeSniffer).not.toBe(firstHandle)
  })

  it('recovers from a stale handle whose scan throws', async () => {
    const stale = {
      scan: vi.fn(() => {
        throw new Error('stale handle')
      }),
      uninstall: vi.fn(),
      cacheSizes: () => ({ observed: 0, reported: 0, resourcePages: 0 }),
    } satisfies YoutubeSnifferHandle
    youtubeWindow.__nioYoutubeSniffer = stale

    await expect(
      import('@/content/youtube-sniffer-entry')
    ).resolves.toBeDefined()

    expect(stale.scan).toHaveBeenCalledOnce()
    expect(youtubeWindow.__nioYoutubeSniffer).toBeDefined()
    expect(youtubeWindow.__nioYoutubeSniffer).not.toBe(stale)
  })
})
