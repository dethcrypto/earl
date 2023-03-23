import { readFileSync } from 'fs'
import { join } from 'path'

import { Example } from './types'

export function generateTestFile(examples: Example[]): string {
  // cut off first few lines of preamble as they are comments
  const preamble = readFileSync(join(__dirname, './preamble.ts'), 'utf-8')
    .split('\n')
    .slice(2)
    .join('\n')

  return `
  import { expect } from 'earljs'
  
  describe('Examples from tsdocs', () => {
  
    ${preamble}
  
    ${examples.map(generateExampleTest).join('\n\n')}
  })
    `
}

function generateExampleTest(example: Example) {
  return `
    describe('${example.name}', () => {
      it('should work', () => {
        ${example.source}
      })
    })`
}
