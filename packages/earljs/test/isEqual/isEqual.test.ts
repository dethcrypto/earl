/* eslint-disable symbol-description */
/* eslint-disable no-new-wrappers */
import { expect } from 'chai'

import { format, FormatOptions } from '../../src/format'
import { EqualityOptions, isEqual } from '../../src/isEqual'

describe('isEqual', () => {
  const DEFAULTS: EqualityOptions = {
    minusZero: false,
    uniqueNaNs: false,
  }
  const FORMAT_OPTIONS: FormatOptions = {
    ...DEFAULTS,
    minusZero: true,
    indentSize: 2,
    inline: true,
  }

  interface TestCaseGroup {
    name: string
    testCases: TestCase[]
  }
  type TestCase = [unknown, unknown, boolean, Partial<EqualityOptions>?]

  function twice<T>(value: T): [T, T] {
    return [value, value]
  }

  const groups: TestCaseGroup[] = [
    {
      name: 'numbers',
      testCases: [
        [1, 1, true],
        [-1, -1, true],
        [0, 0, true],
        [0, 1, false],
        [123.456, 123.456, true],
        [123.456, -123.456, false],
        [0, -0, true],
        [0, -0, false, { minusZero: true }],
        [NaN, NaN, true],
        [NaN, NaN, false, { uniqueNaNs: true }],
        [Infinity, Infinity, true],
        [Infinity, -Infinity, false],
        [-Infinity, -Infinity, true],
      ],
    },
    {
      name: 'symbols',
      testCases: [
        [Symbol(), Symbol(), false],
        [...twice(Symbol()), true],
        [Symbol('foo'), Symbol('foo'), false],
        [...twice(Symbol('foo')), true],
        [Symbol.for('foo'), Symbol.for('foo'), true],
        [Symbol.for('foo'), Symbol.for('bar'), false],
        [Symbol.for('foo'), Symbol('foo'), false],
        [Symbol.iterator, Symbol.iterator, true],
        [Symbol.iterator, Symbol.asyncIterator, false],
      ],
    },
    {
      name: 'strings',
      testCases: [
        ['foo', 'foo', true],
        ['foo', 'bar', false],
        ['', ' ', false],
      ],
    },
    {
      name: 'bigints',
      testCases: [
        [BigInt(1), BigInt(1), true],
        [BigInt(1), BigInt(-2), false],
        [BigInt(0), BigInt(-0), true],
        // minus zero does not affect bigint
        [BigInt(0), BigInt(-0), true, { minusZero: true }],
      ],
    },
    {
      name: 'other primitives',
      testCases: [
        [true, true, true],
        [true, false, false],
        [null, null, true],
        [undefined, undefined, true],
        [null, undefined, false],
      ],
    },
    {
      name: 'cross primitive',
      testCases: [
        [0, false, false],
        [0, '', false],
        [1, '1', false],
        [123, BigInt(123), false],
      ],
    },
    {
      name: 'functions',
      testCases: [
        ...(() => {
          const options = [
            function named() {},
            function* named() {},
            async function named() {},
            async function* named() {},
            function () {},
            function* () {},
            async function () {},
            async function* () {},
          ]
          const testCases: TestCase[] = []
          for (let i = 0; i < options.length; i++) {
            for (let j = i; j < options.length; j++) {
              testCases.push([options[i], options[j], options[i] === options[j]])
            }
          }
          return testCases
        })(),
        [Set.prototype.has, Set.prototype.has, true],
        [Set.prototype.has, Map.prototype.has, false],
        [class A {}, class A {}, false],
        [...twice(class A {}), true],
        [class {}, class {}, false],
        [...twice(class {}), true],
        [class A {}, function A() {}, false],
        [Array, Array, true],
        [Array, Map, false],
        [function x() {}, Object.assign(function x() {}, { foo: 'bar' }), false],
        [Object.assign(function x() {}, { foo: 'bar' }), Object.assign(function x() {}, { foo: 'bar' }), false],
        [...twice(Object.assign(function x() {}, { foo: 'bar' })), true],
      ],
    },
    {
      name: 'objects',
      testCases: [
        [{}, {}, true],
        [{ x: 1 }, { x: 1 }, true],
        [{ x: 1, y: 2 }, { x: 1, y: 2 }, true],
        [{ x: 1, y: 2 }, { x: 1, y: 3 }, false],
        [{ x: 1, y: { a: 'x', b: 'y' } }, { x: 1, y: { a: 'x', b: 'y' } }, true],
        [{ x: 1, y: 2 }, { y: 2, x: 1 }, true],
      ],
    },
    {
      name: 'self-referencing objects',
      testCases: [
        [
          (() => {
            const x = { y: 2 }
            ;(x as any).x = x
            return x
          })(),
          (() => {
            const x = { y: 2 }
            ;(x as any).x = x
            return x
          })(),
          true,
        ],
        [
          (() => {
            const x = { y: 2 }
            ;(x as any).x = x
            return x
          })(),
          (() => {
            const x = { x: { y: 2 }, y: 2 }
            ;(x.x as any).x = x
            return x
          })(),
          false,
        ],
        ...(() => {
          interface Node {
            prev?: Node
            next?: Node
            value: any
          }
          const node = (value: any): Node => ({ value })
          const list = (...values: any[]) =>
            values.map(node).map((node, index, nodes) => {
              node.prev = nodes[index - 1]
              node.next = nodes[index + 1]
              return node
            })[0]

          const a = list(1, 2, 3)
          const b = list(1, 2, 3)
          const c = list(4, 5)

          return [
            [a, b, true],
            [b, c, false],
          ] as TestCase[]
        })(),
      ],
    },
    {
      name: 'arrays',
      testCases: [
        [[], [], true],
        [[1, 2, 3], [1, 2, 3], true],
        [[1, 2, 3], [1, 'boo', 'asd'], false],
        [new Array(3), [undefined, undefined, undefined], false],
        [new Array(3), new Array(3), true],
        [new Array(3), new Array(4), false],
        [Object.assign([1, 2, 3], { foo: 'bar' }), [1, 2, 3], false],
        [Object.assign([1, 2, 3], { foo: 'bar' }), Object.assign([1, 2, 3], { foo: 'bar' }), true],
        [[1, 2, 3], { 0: 1, 1: 2, 2: 3 }, false],
      ],
    },
    {
      name: 'dates',
      testCases: [
        [new Date('2005-04-02T21:37:00.000+02:00'), new Date('2005-04-02T19:37:00.000Z'), true],
        [
          Object.assign(new Date('2005-04-02T21:37:00.000+02:00'), { foo: 'bar' }),
          new Date('2005-04-02T21:37:00.000+02:00'),
          false,
        ],
        [
          Object.assign(new Date('2005-04-02T21:37:00.000+02:00'), { foo: 'bar' }),
          Object.assign(new Date('2005-04-02T21:37:00.000+02:00'), { foo: 'bar' }),
          true,
        ],
      ],
    },
    {
      name: 'regexps',
      testCases: [
        [/asd/, /asd/, true],
        [/asd/, /asd/i, false],
        [Object.assign(/asd/, { foo: 'bar' }), /asd/, false],
        [Object.assign(/asd/, { foo: 'bar' }), Object.assign(/asd/, { foo: 'bar' }), true],
      ],
    },
    {
      name: 'primitive classes',
      testCases: [
        [new String('foo'), new String('foo'), true],
        [new String('foo'), new String('bar'), false],
        [new String('foo'), 'foo', false],
        [new Number(123), new Number(123), true],
        [new Number(123), new Number(456), false],
        [new Number(123), 123, false],
        [new Boolean(true), new Boolean(true), true],
        [new Boolean(true), new Boolean(false), false],
        [new Boolean(true), true, false],
        [Object.assign(new String('foo'), { foo: 'bar' }), new String('foo'), false],
        [Object.assign(new String('foo'), { foo: 'bar' }), Object.assign(new String('foo'), { foo: 'bar' }), true],
      ],
    },
    {
      name: 'unique instances',
      testCases: [
        [Promise.resolve('foo'), Promise.resolve('foo'), false],
        [...twice(Promise.resolve('foo')), true],
        [new WeakMap(), new WeakMap(), false],
        [...twice(new WeakMap()), true],
        [new WeakSet(), new WeakSet(), false],
        [...twice(new WeakSet()), true],
      ],
    },
  ]

  for (const { name, testCases } of groups) {
    describe(name, () => {
      for (const [a, b, expected, options] of testCases) {
        const aFmt = format(a, null, FORMAT_OPTIONS)
        const bFmt = format(b, a, FORMAT_OPTIONS)
        const operator = expected ? '==' : '!='
        const flags = options ? ` [${Object.keys(options).join(' ')}]` : ''
        describe(`${aFmt} ${operator} ${bFmt}${flags}`, () => {
          const equalityOptions = { ...DEFAULTS, ...options }
          const formatOptions = { ...equalityOptions, indentSize: 2, inline: false }

          it('a -> b', () => {
            const result = isEqual(a, b, equalityOptions)
            expect(result).to.equal(expected)
          })

          it('b -> a', () => {
            const result = isEqual(b, a, equalityOptions)
            expect(result).to.equal(expected)
          })

          it('format a -> b', () => {
            const aDiff = format(a, null, formatOptions)
            const bDiff = format(b, a, formatOptions)
            if (expected) {
              expect(aDiff).to.equal(bDiff)
            } else {
              expect(aDiff).not.to.equal(bDiff)
            }
          })

          it('format b -> a', () => {
            const aDiff = format(a, b, formatOptions)
            const bDiff = format(b, null, formatOptions)
            if (expected) {
              expect(aDiff).to.equal(bDiff)
            } else {
              expect(aDiff).not.to.equal(bDiff)
            }
          })
        })
      }
    })
  }
})
