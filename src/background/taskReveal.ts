import type { TaskRevealParams, TaskRevealResult } from '@niodownloader/mdxp'
import { Methods } from '@niodownloader/mdxp'
import type { ConnectionManager } from '@/background/ConnectionManager'

type TaskRevealBridge = Pick<
  ConnectionManager,
  'getServerCapabilities' | 'request'
>

/**
 * Forward a user-initiated reveal only while the authenticated backend still
 * advertises the desktop-shell capability. Reading the capability at call
 * time prevents an endpoint switch or disconnect from reusing stale support.
 */
export async function requestTaskReveal(
  manager: TaskRevealBridge,
  params: TaskRevealParams
): Promise<TaskRevealResult> {
  if (manager.getServerCapabilities()?.taskReveal !== true) {
    throw new Error('connected Nio Downloader does not support task/reveal')
  }
  return manager.request(Methods.TaskReveal, params)
}
