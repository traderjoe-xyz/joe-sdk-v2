import { Token } from 'entities'
import flatMap from 'lodash.flatmap'

export class PairV2  {
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

  public equals(pair: PairV2){
    if (this.token0.address=== pair.token0.address && this.token1.address=== pair.token1.address){
      return true
    } 
    return false
  }

  public static createAllPairs(inputToken: Token, outputToken: Token, bases: Token[]): PairV2[] {

    const basePairs = flatMap(bases, (base: Token) => bases.map((otherBase) => [base, otherBase])).filter(
      ([t0, t1]) => t0.address !== t1.address
    )

    const allTokenPairs = [
      // the direct pair
      [inputToken, outputToken],
      // token A against all bases
      ...bases.map((base) => [inputToken, base]),
      // token B against all bases
      ...bases.map((base) => [outputToken, base]),
      // each base against all bases
      ...basePairs
    ]
      .filter((tokens) => Boolean(tokens[0] && tokens[1]))
      .filter(([t0, t1]) => t0.address !== t1.address)

    const allPairs = allTokenPairs.map((tokenPair: Token[]) => new PairV2(tokenPair[0], tokenPair[1]))

    // TODO: improve this by using Pair address
    const uniquePairs : PairV2[] = []
    allPairs.forEach((pair:PairV2) => {
      if (!uniquePairs.some((pair2: PairV2) => pair.equals(pair2))){
        uniquePairs.push(pair)
      }
    })

    // TODO: check for valid pairs before returning
    return uniquePairs
  }
}
