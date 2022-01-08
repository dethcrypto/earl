import { CanonicalType } from '../isEqual'
import { FormatOptions } from './FormatOptions'
import { formatWithObject } from './formatWithObject'
import { getTypeName } from './getTypeName'

export function formatPrimitiveInstance(
  type: CanonicalType,
  value: object,
  sibling: unknown,
  options: FormatOptions,
  valueStack: unknown[],
  siblingStack: unknown[],
): [number, string][] {
  const typeName = options.ignorePrototypes ? type : getTypeName(value, sibling)
  const formatted = `${typeName} ${JSON.stringify(value)}`
  return formatWithObject(type, formatted, value, sibling, options, valueStack, siblingStack)
}
