import { expect } from 'earljs'

describe('earljs/mocha', () => {
  it('successful test', () => {
    expect(2).toMatchSnapshot()
  })
  it('failing test', () => {
    expect(Math.random()).toMatchSnapshot()
  })
})
