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

  // creates all [Token, Token] combinations given inputToken, outputToken, and bases
  public static createAllTokenPairs(inputToken: Token, outputToken: Token, bases: Token[]): [Token, Token][] {

    const basePairs = flatMap(bases, (base: Token) => bases.map((otherBase) => [base, otherBase])).filter(
      ([t0, t1]) => t0.address !== t1.address
    )

    const allTokenPairs : [Token, Token][]= [
      // the direct pair
      [inputToken, outputToken],
      // token A against all bases
      ...bases.map((base: Token) => [inputToken, base]),
      // token B against all bases
      ...bases.map((base: Token) => [outputToken, base]),
      // each base against all bases
      ...basePairs
    ]
      .filter((tokens): tokens is [Token, Token]  => Boolean(tokens[0] && tokens[1]))
      .filter(([t0, t1]) => t0.address !== t1.address)
    
    return allTokenPairs
  }

  // fetch pairs and initialize PairV2 
  // TODO: add pair id and fetch pair through contract to get reserves
  public static fetchAndInitPairs(tokenPairs: [Token, Token][]) : PairV2[]{
    
    const allPairs = tokenPairs.map((tokenPair: Token[]) => {
      return new PairV2(tokenPair[0], tokenPair[1])
    })

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
