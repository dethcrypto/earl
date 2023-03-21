import { Control } from '../../Control'
import { registerValidator } from '../../expect'
import { Mock } from '../../mocks'
import { assertIsMock } from './utils'

declare module '../../expect' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Validators<T> {
    /**
     * Asserts that the mock function was called enough so that all the
     * specified one time overrides were used.
     *
     * If no one time overrides were specified, this will always pass.
     *
     * @example
     * ```ts
     * import { expect, mockFn } from 'earljs'
     *
     * const fn = mockFn().returnsOnce(420).returnsOnce(69)
     * expect(fn).not.toHaveBeenExhausted()
     * fn() // returns 420
     * fn() // returns 69
     * expect(fn).toHaveBeenExhausted()
     * ```
     */
    toHaveBeenExhausted(this: Validators<Mock<any[], any>>): void
  }
}

registerValidator('toHaveBeenExhausted', toHaveBeenExhausted)

export function toHaveBeenExhausted(control: Control) {
  assertIsMock(control)

  const remainingCalls = control.actual.getQueueLength()
  const remainingOverrides = control.actual.getOneTimeOverridesLength()

  let remaining = ''
  if (remainingCalls !== 0 && remainingOverrides === 0) {
    remaining = `${remainingCalls} calls remaining`
  } else if (remainingCalls === 0 && remainingOverrides !== 0) {
    remaining = `${remainingOverrides} conditional calls remaining`
  } else {
    remaining = `${remainingCalls} calls and ${remainingOverrides} conditional calls remaining`
  }

  control.assert({
    success: control.actual.isExhausted(),
    reason: `The mock function was not exhausted, ${remaining}.`,
    negatedReason: `The mock function has been exhausted, but it was not expected to be.`,
  })
}
