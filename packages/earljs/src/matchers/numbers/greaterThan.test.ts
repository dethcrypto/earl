import { expect as earl } from '../../index'
import { testMatcher, testMatcherFormat } from '../../test/matchers'
import { TEST_VALUES } from '../../test/values'
import { greaterThan } from './greaterThan'

describe(greaterThan.name, () => {
  testMatcherFormat(earl.greaterThan(10), 'greaterThan(10)')

  describe('greaterThan(10)', () => {
    testMatcher(
      greaterThan(10),
      [11, 10.5, 100, 12356.789, Infinity, BigInt(11), BigInt(100)],
      [
        10,
        0,
        0.5,
        1,
        -0.0001,
        9.998,
        5,
        -4,
        NaN,
        -Infinity,
        BigInt(10),
        BigInt(0),
        BigInt(-100),
        ...TEST_VALUES.filter(
          (x) => typeof x !== 'number' && typeof x !== 'bigint',
        ),
      ],
    )
  })

  describe('greaterThan(10n)', () => {
    testMatcher(
      greaterThan(BigInt(10)),
      [11, 10.5, 100, 12356.789, BigInt(11), BigInt(100)],
      [10, 0, 0.5, 1, -0.0001, 9.998, BigInt(10), BigInt(0), BigInt(-100)],
    )
  })
})
