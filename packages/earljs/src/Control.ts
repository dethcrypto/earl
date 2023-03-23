import { AssertionError } from './errors'
import { format } from './format'

export interface ValidationResult {
  success: boolean
  hint?: string
  reason: string
  negatedReason: string
  actual?: unknown
  expected?: unknown
}

export interface ControlOptions {
  actual?: unknown
  isNegated?: boolean
}

export class Control {
  private readonly _location
  public readonly actual: unknown

  public isNegated = false

  constructor(options: ControlOptions) {
    this.actual = options.actual
    this.isNegated = options.isNegated ?? false

    this._location = AssertionError.getLocation()
  }

  get file() {
    return this._location.file
  }

  assert = (result: ValidationResult) => {
    if (this.isNegated === result.success) {
      throw new AssertionError({
        message: result.success ? result.negatedReason : result.reason,
        stack: this._location.stack,
        ...formatActualAndExpected(result),
      })
    }
  }

  fail = (
    result: Omit<ValidationResult, 'success' | 'negatedReason'>,
  ): never => {
    throw new AssertionError({
      message: result.reason,
      stack: this._location.stack,
      ...formatActualAndExpected(result),
    })
  }
}

function formatActualAndExpected(
  result: Pick<ValidationResult, 'actual' | 'expected'>,
) {
  if (!('actual' in result && 'expected' in result)) {
    return {}
  }

  if (
    typeof result.actual === 'string' &&
    typeof result.expected === 'string'
  ) {
    return { actual: result.actual, expected: result.expected }
  }

  return {
    actual: format(result.actual, null),
    expected: format(result.expected, result.actual),
  }
}
