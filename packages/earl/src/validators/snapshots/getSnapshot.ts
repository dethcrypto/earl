import { readFileSync } from 'node:fs'
import path from 'node:path'

import { getTestFile, getTestName, type TestContext } from './TestContext.js'
import { parseSnapshot } from './format.js'
import type { SnapshotUpdateMode } from './getSnapshotUpdateMode.js'

const counters = new Map<string, Map<string, number>>()
const snapshots = new Map<string, Record<string, string>>()

export function resetSnapshotCache() {
  counters.clear()
  snapshots.clear()
}

export function getSnapshot(
  controlFileName: string | undefined,
  context: TestContext,
  mode: SnapshotUpdateMode,
) {
  const filePath = getTestFile(context) ?? controlFileName
  if (!filePath) {
    throw new TypeError(
      'Invalid test context. Cannot determine test file path.',
    )
  }
  const file = path.join(
    path.dirname(filePath),
    `${path.basename(filePath)}.snapshot`,
  )
  const testName = getTestName(context)
  if (!testName) {
    throw new TypeError('Invalid test context. Cannot determine test name.')
  }

  const counter = counters.get(file) ?? new Map<string, number>()
  counters.set(file, counter)
  const count = counter.get(testName) ?? 1
  counter.set(testName, count + 1)

  const name = `${testName} ${count}`

  let content = snapshots.get(file)
  if (!content || mode === 'all') {
    try {
      content = parseSnapshot(readFileSync(file, 'utf8'))
    } catch {}
  }
  content = content ?? {}
  snapshots.set(file, content)

  const expected = content[name]

  return {
    file,
    name,
    content,
    expected: typeof expected === 'string' ? expected : undefined,
  }
}
