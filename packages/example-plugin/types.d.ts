import { plugin } from './dist'

type Matchers = typeof plugin['matchers']
type Validators = typeof plugin['validators']

declare module 'earljs' {
  interface ExpectInterface extends Matchers {}
  interface Expectation<T> extends Validators {}
}
