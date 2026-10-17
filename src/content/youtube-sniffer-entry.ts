// MAIN-world YouTube sniffer entry point — injected on-demand by bg.scanActiveTab
// when the active tab's host is a YouTube domain (full/Firefox build only).
//
// Uses the SAME postMessage envelope as the generic sniffer-entry so that the
// EXISTING ISOLATED-world sniffer-relay forwards detected media to bg.mediaDetected
// without any relay changes.
//
// MAIN-world scripts have NO extension runtime access. Results travel via
// postMessage to the static ISOLATED relay in Chromium and Firefox 128+.

import {
  installYoutubeSniffer,
  type YoutubeSnifferHandle,
  type YoutubeSnifferPageContext,
} from '@/content/youtube/youtubeSniffer'
import type { DetectedMedia } from '@/shared/media'

type YoutubeSnifferWindow = Window & {
  __nioYoutubeSniffer?: YoutubeSnifferHandle
}

const snifferWindow = window as YoutubeSnifferWindow
const currentPage = (): YoutubeSnifferPageContext => ({
  pageUrl: location.href,
  pageTitle: document.title,
})

const install = (): void => {
  const installed = installYoutubeSniffer(
    (item: DetectedMedia) => {
      // Wrap in an array to match the sniffer-relay's `items` envelope.
      window.postMessage(
        { source: 'nio-sniffer', type: 'media', items: [item] },
        '*'
      )
    },
    currentPage(),
    currentPage
  )
  const handle: YoutubeSnifferHandle = {
    scan: installed.scan,
    cacheSizes: installed.cacheSizes,
    uninstall: () => {
      try {
        installed.uninstall()
      } finally {
        if (snifferWindow.__nioYoutubeSniffer === handle) {
          delete snifferWindow.__nioYoutubeSniffer
        }
      }
    },
  }
  snifferWindow.__nioYoutubeSniffer = handle
}

const existing = snifferWindow.__nioYoutubeSniffer
if (existing && typeof existing.scan === 'function') {
  try {
    existing.scan(currentPage())
  } catch {
    delete snifferWindow.__nioYoutubeSniffer
    install()
  }
} else {
  delete snifferWindow.__nioYoutubeSniffer
  install()
}
