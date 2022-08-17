import { PairV2 } from './pair'
import { Token } from './token'

/** Class representing a trade route. */
export class RouteV2 {
  public readonly pairs: PairV2[]
  public readonly path: Token[]
  public readonly input: Token
  public readonly output: Token

  public constructor(pairs: PairV2[], input: Token, output?: Token) {
    const path: Token[] = [input]

    for (const [i, pair] of pairs.entries()) {
      const currentInput = path[i]
      const output = currentInput.equals(pair.token0) ? pair.token1 : pair.token0
      path.push(output)
    }

    this.pairs = pairs
    this.path = path
    this.input = input
    this.output = output ?? path[path.length - 1]
  }

  /**
   * Returns the list of token addresses for this route
   * 
   * @returns {string[]} 
   */
   public pathToStrArr():string[]{
    return this.path.map((token:Token)=>token.address)
  }

  /**
   * @static
   * Returns all possible trade routes
   * 
   * @param {PairV2[]} pairs - The pairs to consider
   * @param {Token} inputToken - The input token
   * @param {Token} outputToken - The output token
   * @param {PairV2[]} currentPairs - The current list of pairs forming a route (used in recursion)
   * @param {Token} originalInputToken - The original value of the inputToken param (used in recursion)
   * @param {RouteV2[]} outcome - The current list of routes (used in recursion)
   * @returns {RouteV2[]} An array of constructured routes
   */
  public static createAllRoutes(
    pairs: PairV2[],
    inputToken: Token,
    outputToken: Token,
    currentPairs: PairV2[] = [],
    originalInputToken: Token = inputToken,
    outcome: RouteV2[] = []
  ): RouteV2[] {
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i]

      // pair irrelevant
      if (!pair.token0.equals(inputToken) && !pair.token1.equals(inputToken)) continue

      // next token to consider
      const nextToken = pair.token0.equals(inputToken) ? pair.token1 : pair.token0

      // arrived at the output token
      if (nextToken.equals(outputToken)) {
        outcome.push(new RouteV2([...currentPairs, pair], originalInputToken, outputToken))
      } else {
        const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length))

        // otherwise, consider all the other paths that lead from this token
        RouteV2.createAllRoutes(
          pairsExcludingThisPair,
          nextToken,
          outputToken,
          [...currentPairs, pair],
          originalInputToken,
          outcome
        )
      }
    }
    return outcome
  }
}
