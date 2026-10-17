import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { log } from '@/background/log'
import { makeLogLevelChangeHandler } from '@/background/logLevelSync'

let setLevelSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  setLevelSpy = vi.spyOn(log, 'setLevel')
})

afterEach(() => {
  log.setLevel('info')
  vi.restoreAllMocks()
})

describe('makeLogLevelChangeHandler', () => {
  it('applies a nio.logLevel change in the local area', () => {
    const handler = makeLogLevelChangeHandler()
    handler({ 'nio.logLevel': { newValue: 'debug' } }, 'local')
    expect(setLevelSpy).toHaveBeenCalledWith('debug')
  })
  it('falls back to info on an invalid newValue', () => {
    const handler = makeLogLevelChangeHandler()
    handler({ 'nio.logLevel': { newValue: 'bogus' } }, 'local')
    expect(setLevelSpy).toHaveBeenCalledWith('info')
  })
  it('ignores non-local areas', () => {
    const handler = makeLogLevelChangeHandler()
    handler({ 'nio.logLevel': { newValue: 'debug' } }, 'sync')
    expect(setLevelSpy).not.toHaveBeenCalled()
  })
  it('ignores changes without the log-level key', () => {
    const handler = makeLogLevelChangeHandler()
    handler({ 'nio.locale': { newValue: 'zh-CN' } }, 'local')
    expect(setLevelSpy).not.toHaveBeenCalled()
  })
})
