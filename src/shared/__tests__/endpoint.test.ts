import { describe, expect, it } from 'vitest'
import { normalizeRemoteEndpoint, parseRemoteEndpoint } from '@/shared/endpoint'

describe('remote endpoint parsing', () => {
  it('canonicalizes host casing, default ports, and trailing slashes', () => {
    expect(normalizeRemoteEndpoint('wss://NIO.Example:443/')).toBe(
      'wss://nio.example'
    )
    expect(normalizeRemoteEndpoint('WSS://[2001:DB8::1]:443/bridge///')).toBe(
      'wss://[2001:db8::1]/bridge'
    )
    expect(normalizeRemoteEndpoint('WS://NAS.Local:80/bridge///')).toBe(
      'ws://nas.local/bridge'
    )
  })

  it('preserves a path as a reverse-proxy base path', () => {
    expect(normalizeRemoteEndpoint('wss://nio.example/bridge/')).toBe(
      'wss://nio.example/bridge'
    )
  })

  it('reports effective websocket ports', () => {
    expect(parseRemoteEndpoint('wss://nio.example').port).toBe(443)
    expect(parseRemoteEndpoint('wss://nio.example:9443').port).toBe(9443)
    expect(parseRemoteEndpoint('ws://nas.local').port).toBe(80)
    expect(parseRemoteEndpoint('ws://nas.local:8888').port).toBe(8888)
  })

  it.each([
    'https://nio.example',
    'wss://user:secret@nio.example',
    'wss://@nio.example',
    'wss://nio.example?token=secret',
    'wss://nio.example?',
    'wss://nio.example#fragment',
    'wss://nio.example#',
    ' wss://nio.example',
    'wss://nio.example ',
    'wss://nio.example/a b',
    'wss://nio.example/a\u0085b',
    'wss:\\nio.example\\bridge',
    'wss://nio.example/bridge\u0000tail',
    'wss://nio.example/bridge%2ftail',
    'wss://nio.example/bridge%5ctail',
    'wss://nio.example/bridge%252ftail',
    'wss://nio.example/bridge%25%35%63tail',
    'wss://nio.example/bridge%zz',
    `wss://nio.example/${'a'.repeat(4096)}`,
    'not a url',
  ])('rejects ambiguous or unsafe URL %s', (value) => {
    expect(() => parseRemoteEndpoint(value)).toThrow()
  })

  it('is byte-stable after canonicalization', () => {
    const canonical = normalizeRemoteEndpoint(
      'WSS://B\u00dcCHER.example:443/bridge/\u8d44\u6e90///'
    )
    expect(normalizeRemoteEndpoint(canonical)).toBe(canonical)
    expect(normalizeRemoteEndpoint('ws://nas.local/bridge')).toBe(
      'ws://nas.local/bridge'
    )
  })
})
