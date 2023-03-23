import FastGlob from 'fast-glob'
import { readFileSync, writeFileSync } from 'fs'
import { basename, join } from 'path'

import { generateTestFile } from './generate'
import { Example } from './types'

export async function main() {
  console.log('Generating test examples from tsdocs...')
  const filePaths = await FastGlob('src/**/*.ts', {
    absolute: true,
    cwd: join(__dirname, '../../../earljs'),
    ignore: [
      '**/*.test.ts',
      '**/*/schema.ts', // ignore this one particular file because it imports external dependencies like zod
      '**/*/toMatchSchema.ts', // ignore this one particular file because it imports external dependencies like zod
    ],
  })
  const files = filePaths.map((filePath) => ({
    name: basename(filePath, '.ts'),
    source: readFileSync(filePath, 'utf-8'),
  }))

  const examples: Example[] = files
    .map((file) => ({
      name: file.name,
      source: extractExample(file.source),
    }))
    .filter((example): example is Example => !!example.source)
  console.log(
    `Found ${examples.length} examples across ${filePaths.length} source files`,
  )

  const testFile = generateTestFile(examples)

  writeFileSync(join(__dirname, './output/examples.test.ts'), testFile)
}

function extractExample(source: string): string | undefined {
  const sourceLines = source.split('\n')

  const exampleStartIndex = sourceLines.findIndex((line) =>
    line.includes('* @example'),
  )
  if (exampleStartIndex === -1) {
    return undefined
  }

  const exampleEndIndex = sourceLines.findIndex(
    (line, i) => i > exampleStartIndex + 1 && line.includes('* ```'),
  )

  const example = sourceLines
    .slice(exampleStartIndex + 2, exampleEndIndex)
    .map((line) => line.replace(/^\s*\*\s*/, '').trim())
    .filter((line) => !line.startsWith('import'))
    .join('\n')

  return example
}

main().catch((e) => {
  console.error('Error occured: ', e)
  process.exit(1)
})