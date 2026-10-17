import { describe, expect, it } from 'vitest'
import { serverFormSchema, takeoverFormSchema } from '@/options/tabs/schemas'

describe('serverFormSchema', () => {
  it('requires a server name', () => {
    expect(
      serverFormSchema.safeParse({
        name: '  ',
        url: 'wss://nio.example',
      }).success
    ).toBe(false)
  })

  it('requires a server url', () => {
    expect(
      serverFormSchema.safeParse({ name: 'Home', url: '  ' }).success
    ).toBe(false)
  })

  it('accepts strict WS and WSS server addresses', () => {
    expect(
      serverFormSchema.safeParse({
        name: 'Home',
        url: 'wss://nio.example/bridge/',
      }).success
    ).toBe(true)
    expect(
      serverFormSchema.safeParse({
        name: 'NAS',
        url: 'ws://nas.local:8888/bridge/',
      }).success
    ).toBe(true)
  })

  it.each([
    'http://nio.example',
    'wss://user:secret@nio.example',
    'wss://nio.example?token=secret',
    'wss://nio.example#fragment',
    ' wss://nio.example',
    'wss://nio.example ',
    'wss://nio.example/%252fadmin',
    'wss:\\nio.example\\bridge',
  ])('rejects ambiguous server URL %s', (url) => {
    const r = serverFormSchema.safeParse({ name: 'Home', url })
    expect(r.success).toBe(false)
  })
})

describe('takeoverFormSchema', () => {
  it('accepts empty thresholdMB', () => {
    expect(
      takeoverFormSchema.safeParse({
        downloadMode: 'direct',
        enabled: false,
        thresholdMB: '',
        unknownSizeAction: 'chrome',
        denylist: '',
      }).success
    ).toBe(true)
  })
  it('rejects negative thresholdMB', () => {
    expect(
      takeoverFormSchema.safeParse({
        downloadMode: 'direct',
        enabled: true,
        thresholdMB: '-3',
        unknownSizeAction: 'chrome',
        denylist: '',
      }).success
    ).toBe(false)
  })
})
