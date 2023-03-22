import { Control } from '../../Control'
import { registerValidator } from '../../expect'
import { formatCompact } from '../../format'
import { greaterThan } from '../../matchers/numbers/greaterThan'

declare module '../../expect' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Validators<T> {
    /**
     * Asserts that a number is greater than the target value.
     *
     * Works for both numbers and bigints.
     *
     * If you want to match a nested value, use the matcher
     * `expect.greaterThan(target)` instead.
     *
     * @param target - The target value to compare to.
     *
     * @example
     * ```ts
     * expect(100_000n).toBeGreaterThan(50_000n)
     *
     * expect(1337n).not.toBeGreaterThan(1337n)
     * expect(0xCAFEBABE).not.toBeGreaterThan(0xDEADBEEF)
     * ```
     */
    toBeGreaterThan(
      this: Validators<number | bigint>,
      target: number | bigint,
    ): void
  }
}

registerValidator('toBeGreaterThan', toBeGreaterThan)

export function toBeGreaterThan(control: Control, target: number | bigint) {
  const actualInline = formatCompact(control.actual)
  const targetInline = formatCompact(target)

  control.assert({
    success: greaterThan(target)(control.actual),
    reason: `The value ${actualInline} is not greater than ${targetInline}, but it was expected to be.`,
    negatedReason: `The value ${actualInline} is greater than ${targetInline}, but it was expected not to be.`,
  })
}
