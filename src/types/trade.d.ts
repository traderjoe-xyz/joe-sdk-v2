import { Percent } from 'entities'
import { BigNumber } from 'ethers'

/** Interface representing a quote */
export interface Quote {
  route: string[]
  pairs: string[]
  binSteps: BigNumber[]
  amounts: BigNumber[]
  tradeValueAVAX: BigNumber
}

/** Options for producing the arguments to send call to the router. */
export interface TradeOptions {
  // How much the execution price is allowed to move unfavorably from the trade execution price.
  allowedSlippage: Percent
  // How long the swap is valid until it expires, in seconds. Used to produce a `deadline` parameter which is computed from when the swap call parameters are generated
  ttl: number 
  // The account that should receive the output of the swap.
  recipient: string 
  // Whether any of the tokens in the path are fee on transfer tokens, which should be handled with special methods
  feeOnTransfer?: boolean 
}

export interface TradeOptionsDeadline extends Omit<TradeOptions, 'ttl'> {
  // When the transaction expires. This is an atlernate to specifying the ttl, for when you do not want to use local time.
  deadline: number 
}

/** The parameters to use in the call to the Uniswap V2 Router to execute a trade. */
export interface SwapParameters {
  // The method to call on LBRouter
  methodName: string
  // The arguments to pass to the method, all hex encoded.
  args: (string | string[])[]
  // The amount of wei to send in hex.
  value: string
}
