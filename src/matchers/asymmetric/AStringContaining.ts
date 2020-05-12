import { AsymmetricMatcher } from './Base'

/**
 * Matches any string that contains another string
 */
export class AStringContainingMatcher extends AsymmetricMatcher<string> {
  constructor(private readonly substring: string) {
    super()
  }

  toString() {
    return 'AMatcher'
  }

  check(v: any) {
    return typeof v === 'string' && v.indexOf(this.substring) !== -1
  }

  static make(substring: string): AStringContainingMatcher {
    return new AStringContainingMatcher(substring)
  }
}
