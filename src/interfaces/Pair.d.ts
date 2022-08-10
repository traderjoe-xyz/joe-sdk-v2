import { ILBToken } from 'interfaces'
import { Token } from 'entities/token'
import { TokenAmount } from 'entities/fractions'
import { BigintIsh } from '../constants'

/* Interface for Pair */

export interface IPair {
  // static methods
  getAddress: (tokenA: Token, tokenB: Token) => string // Computes the pair address for the passed Tokens

  // properties (from joe-sdk-v1)
  token0: Token // Pair token with the lower sort order
  token1: Token // Pair token with the higher sort order
  reserve0: TokenAmount // Reserve of token0 across all bins
  reserve1: TokenAmount // Reserve of token1 across all bins

  // new properties for v2
  LBToken: ILBToken // LBToken representing the liquidity token for the pair
  activeBinId: number // Active bin id currently used for swaps
  binStep: number // Bin step: fixed parameter defined when pair is created that determines constant % chance in price between each bin

  // methods (from joe-sdk-v1)
  involvesToken(token: Token): boolean // Returns true if the token is either token0 or token1
  reserveOf(token: Token): TokenAmount // Returns reserve0 or reserve1, depending on whether token0 or token1 is passed in
  getOutputAmount(inputAmount: TokenAmount): [TokenAmount, IPair] // Pricing function for exact input amounts.  Returns maximum output amount based on current reserves and the new Pair that would exist if the trade were executed.
  getInputAmount(outputAmount: TokenAmount): [TokenAmount, IPair] // Pricing function for exact output amounts. Returns minimum input amount based on current reserves and the new Pair that would exist if the trade were executed.
  getLiquidityMinted(totalSupply: TokenAmount, tokenAmountA: TokenAmount, tokenAmountB: TokenAmount): TokenAmount // Calculates the exact amount of liquidity tokens minted from a given amount of token0 and token1.
  getLiquidityValue( // Calculates the exact amount of liquidity tokens minted from a given amount of token0 and token1.
    token: ILBToken,
    totalSupply: TokenAmount,
    liquidity: TokenAmount,
    feeOn: boolean,
    kLast?: BigintIsh
  ): TokenAmount

  // new methods for v2
  binReserveOf(token: Token): TokenAmount // Returns token0 or token1's active bin's reserve
}
