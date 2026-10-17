import { describe, expect, it } from 'vitest'
import {
  backendAuthorityKey,
  createRemoteBackendAuthority,
  LOCAL_BACKEND_AUTHORITY,
} from '@/background/mbp1/backend-authority'

function remote(endpointId: string, wsBase: string) {
  return createRemoteBackendAuthority({ endpointId, wsBase })
}

describe('BackendAuthority', () => {
  it('canonicalizes equivalent WSS bases to one authority and key', () => {
    const a = remote('server-a', 'wss://NIO.Example:443/bridge///')
    const b = remote('server-a', 'wss://nio.example/bridge')

    expect(a.kind).toBe('remote')
    expect(a.endpointId).toBe('server-a')
    expect(a.canonicalWsBase).toBe('wss://nio.example/bridge')
    expect(backendAuthorityKey(a)).toBe(backendAuthorityKey(b))
  })

  it('accepts canonical WS while keeping its trust scope separate from WSS', () => {
    const ws = remote('server-a', 'WS://NAS.Local:80/bridge///')
    const wss = remote('server-a', 'wss://nas.local/bridge')

    expect(ws.canonicalWsBase).toBe('ws://nas.local/bridge')
    expect(backendAuthorityKey(ws)).not.toBe(backendAuthorityKey(wss))
  })

  it('changes scope when either endpoint id or canonical URL changes', () => {
    const original = remote('server-a', 'wss://nio.example/bridge')
    const renamedId = remote('server-b', 'wss://nio.example/bridge')
    const changedUrl = remote('server-a', 'wss://nio.example/other')

    expect(backendAuthorityKey(original)).not.toBe(
      backendAuthorityKey(renamedId)
    )
    expect(backendAuthorityKey(original)).not.toBe(
      backendAuthorityKey(changedUrl)
    )
  })

  it('does not put a display name into authority scope', () => {
    const before = {
      id: 'server-a',
      name: 'Office Server',
      url: 'wss://nio.example/bridge',
    }
    const after = { ...before, name: 'Renamed Server' }

    const beforeKey = backendAuthorityKey(remote(before.id, before.url))
    const afterKey = backendAuthorityKey(remote(after.id, after.url))
    expect(beforeKey).toBe(afterKey)
  })

  it('uses injective field encoding instead of a delimiter join', () => {
    const a = remote('a', 'wss://one.example/path|wss://two.example')
    const b = remote('a|wss://one.example/path', 'wss://two.example')

    // These deliberately collide under the tempting `id|url` encoding.
    expect(`${a.endpointId}|${a.canonicalWsBase}`).toBe(
      `${b.endpointId}|${b.canonicalWsBase}`
    )
    expect(backendAuthorityKey(a)).not.toBe(backendAuthorityKey(b))
  })

  it('domain-separates the local authority from every remote authority', () => {
    const localKey = backendAuthorityKey(LOCAL_BACKEND_AUTHORITY)
    const remoteKey = backendAuthorityKey(remote('local', 'wss://nio.example'))

    expect(backendAuthorityKey(LOCAL_BACKEND_AUTHORITY)).toBe(localKey)
    expect(remoteKey).not.toBe(localKey)
  })

  it('rejects a structurally forged authority', () => {
    const forged = {
      kind: 'remote',
      endpointId: 'server-a',
      canonicalWsBase: 'wss://nio.example',
    } as unknown as Parameters<typeof backendAuthorityKey>[0]

    expect(() => backendAuthorityKey(forged)).toThrow(
      'BackendAuthority must be created by its module factory'
    )
  })

  it('rejects a spread copy even when it copied the private brand', () => {
    const issued = remote('server-a', 'wss://nio.example')
    const copied = { ...issued }

    expect(() => backendAuthorityKey(copied)).toThrow(
      'BackendAuthority must be created by its module factory'
    )
  })

  it('rejects a persisted and deserialized authority', () => {
    const issued = remote('server-a', 'wss://nio.example')
    const restored = JSON.parse(JSON.stringify(issued)) as Parameters<
      typeof backendAuthorityKey
    >[0]

    expect(() => backendAuthorityKey(restored)).toThrow(
      'BackendAuthority must be created by its module factory'
    )
  })

  it.each([
    ['HTTP URL', 'https://nio.example'],
    ['userinfo', 'wss://user:secret@nio.example'],
    ['empty userinfo', 'wss://@nio.example'],
    ['query', 'wss://nio.example?token=legacy'],
    ['fragment', 'wss://nio.example#bridge'],
    ['backslash', 'wss://nio.example\\admin'],
    ['ASCII control', 'wss://nio.example/\u0001admin'],
    ['embedded whitespace', 'wss://nio.example/a b'],
    ['Unicode White_Space', 'wss://nio.example/a\u0085b'],
    ['encoded slash', 'wss://nio.example/%2fadmin'],
    ['encoded backslash', 'wss://nio.example/%5Cadmin'],
    ['double-encoded slash', 'wss://nio.example/%252fadmin'],
    ['split encoded backslash', 'wss://nio.example/%25%35%63admin'],
    ['invalid percent encoding', 'wss://nio.example/%zz'],
    ['leading whitespace', ' wss://nio.example'],
    ['trailing whitespace', 'wss://nio.example '],
    ['oversized URL', `wss://nio.example/${'a'.repeat(4096)}`],
    ['malformed URL', 'not a URL'],
  ])('rejects %s input', (_label, wsBase) => {
    expect(() => remote('server-a', wsBase)).toThrow()
  })

  it.each(['', '   ', ' server-a', 'server-a ', '服务器'])(
    'rejects an invalid endpoint id %j',
    (endpointId) => {
      expect(() => remote(endpointId, 'wss://nio.example')).toThrow()
    }
  )

  it('rejects oversized and control-bearing endpoint ids', () => {
    expect(() => remote('a'.repeat(129), 'wss://nio.example')).toThrow()
    expect(() => remote('server\u0000a', 'wss://nio.example')).toThrow()
  })
})
