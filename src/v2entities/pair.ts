import { Token } from './token'
import flatMap from 'lodash.flatmap'

/** Class representing a pair. */
export class PairV2 {
  public readonly token0: Token
  public readonly token1: Token

  public constructor(tokenA: Token, tokenB: Token) {
    if (tokenA.sortsBefore(tokenB)) {
      this.token0 = tokenA
      this.token1 = tokenB
    } else {
      this.token0 = tokenB
      this.token1 = tokenA
    }
  }

  /**
   * Checks whether the pairs are equal
   *
   * @param {PairV2} pair
   * @returns {boolean} true if equal, otherwise false
   */
  public equals(pair: PairV2) {
    if (this.token0.address === pair.token0.address && this.token1.address === pair.token1.address) {
      return true
    }
    return false
  }

  /**
   * @static
   * Returns all possible combination of token pairs
   *
   * @param {Token} inputToken
   * @param {Token} outputToken
   * @param {Token[]} bases
   * @returns {[Token, Token][]}
   */
  public static createAllTokenPairs(inputToken: Token, outputToken: Token, bases: Token[]): [Token, Token][] {
    const basePairs = flatMap(bases, (base: Token) => bases.map((otherBase) => [base, otherBase])).filter(
      ([t0, t1]) => t0.address !== t1.address
    )

    const allTokenPairs: [Token, Token][] = [
      // the direct pair
      [inputToken, outputToken],
      // token A against all bases
      ...bases.map((base: Token) => [inputToken, base]),
      // token B against all bases
      ...bases.map((base: Token) => [outputToken, base]),
      // each base against all bases
      ...basePairs
    ]
      .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
      .filter(([t0, t1]) => t0.address !== t1.address)

    return allTokenPairs
  }

  /**
   * @static
   * Returns the initialized pairs given a list of token pairs
   *
   * @param {[Token, Token][]} tokenPairs
   * @returns {PairV2[]}
   */
  public static fetchAndInitPairs(tokenPairs: [Token, Token][]): PairV2[] {
    // TODO: compute pair address and fetch pair data from contract

    const allPairs = tokenPairs.map((tokenPair: Token[]) => {
      return new PairV2(tokenPair[0], tokenPair[1])
    })

    // TODO: improve this by using Pair address
    const uniquePairs: PairV2[] = []
    allPairs.forEach((pair: PairV2) => {
      if (!uniquePairs.some((pair2: PairV2) => pair.equals(pair2))) {
        uniquePairs.push(pair)
      }
    })

    // TODO: check for valid pairs before returning
    return uniquePairs
  }

  /**
   * Returns the price of bin given its id and the bin step
   * 
   * @param {number} id - The bin id
   * @param {number} binStep 
   * @returns {number} 
   */
  public static getPriceFromId(id: number, binStep: number): number {
    return (1 + binStep / 20_000) ** (id - 8388608)
  }

  /**
   * Returns the bin id given its price and the bin step
   * 
   * @param {number} price - The price of the bin
   * @param {number} binStep 
   * @returns {number} 
   */
  public static getIdFromPrice(price: number, binStep: number): number {
    return Math.floor(Math.log(price) / Math.log(1 + binStep / 20_000)) + 8388608
  }

  /**
   * Returns idSlippage given slippage tolerance and the bin step
   * 
   * @param {number} priceSlippage 
   * @param {number} binStep 
   * @returns {number} 
   */
  public static getIdSlippageFromPriceSlippage(priceSlippage: number, binStep: number): number {
    return Math.floor(Math.log(1 + priceSlippage) / Math.log(1 + binStep / 20_000))
  }
}
