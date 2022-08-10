import { Currency, Price, Token } from 'entities'
import { IPair } from 'interfaces'

/* Interface for Route */

interface IRoute {
  // properties (from joe-sdk-v1)
  pairs: IPair[] // Pairs in order that the route is comprise of
  path: Token[] // Full path from input token to output token
  input: Currency // Input token
  output: Currency // Output token
  midPrice: Price // Price that reflects the ratio of reserves in one or more pairs (relative value of one token in terms of the other)
}
