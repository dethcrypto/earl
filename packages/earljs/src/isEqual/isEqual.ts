import { EqualityOptions } from './EqualityOptions'
import { isEqualFunction } from './isEqualFunction'
import { isEqualNumber } from './isEqualNumber'
import { isEqualSymbol } from './isEqualSymbol'

export function isEqual(value: unknown, other: unknown, options: EqualityOptions) {
  if (typeof value !== typeof other) {
    return false
  } else if (typeof value === 'number') {
    return isEqualNumber(value, other as number, options)
  } else if (typeof value === 'symbol') {
    return isEqualSymbol(value, other as symbol, options)
  } else if (typeof value === 'function') {
    return isEqualFunction(value, other as Function, options)
  }
  return value === other
}