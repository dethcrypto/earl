import { EqualityOptions } from './EqualityOptions'
import { CanonicalType } from './getCanonicalType'
import { getKeys } from './getKeys'
import { isEqualUnknown } from './isEqualUnknown'

export function isEqualObject(
  value: object,
  valueStack: unknown[],
  other: object,
  otherStack: unknown[],
  options: EqualityOptions,
  type: CanonicalType,
) {
  const keys = getKeys(value, type, options)
  const otherKeys = getKeys(other, type, options)
  if (keys.length !== otherKeys.length) {
    return false
  }
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] !== otherKeys[i]) {
      return false
    }
  }
  valueStack.push(value)
  otherStack.push(other)
  let result = true
  for (let i = 0; i < keys.length; i++) {
    if (
      !isEqualUnknown(
        (value as any)[keys[i]],
        valueStack,
        (other as any)[otherKeys[i]],
        otherStack,
        options,
      )
    ) {
      result = false
      break
    }
  }
  valueStack.pop()
  otherStack.pop()
  return result
}
