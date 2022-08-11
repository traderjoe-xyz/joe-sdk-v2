import { BigNumber, Contract } from 'ethers'
import { Provider } from '@ethersproject/abstract-provider'
import { MULTICALL_ADDRESS, QUOTER_ADDRESS, ChainId } from '../constants'
import MultiCallABI from '../abis/MultiCall'
import QuoterABI from '../abis/Quoter'

export class Quote {
  public readonly route: string[]
  public readonly pairs: string[]
  public readonly binSteps: BigNumber[]
  public readonly amounts: BigNumber[]
  public readonly tradeValueAVAX: BigNumber

  public constructor(
    route: string[],
    pairs: string[],
    binSteps: BigNumber[],
    amounts: BigNumber[],
    tradeValueAVAX: BigNumber
  ) {
    this.route = route
    this.pairs = pairs
    this.binSteps = binSteps
    this.amounts = amounts
    this.tradeValueAVAX = tradeValueAVAX
  }

  public static async getQuotes(
    routes: string[],
    amountIn: number,
    provider: Provider,
    chainId: ChainId
  ): Promise<Quote[]> {
    const multicall = new Contract(MULTICALL_ADDRESS[chainId], MultiCallABI, provider)
    const quoter = new Contract(QUOTER_ADDRESS[chainId], QuoterABI, provider)

    const call = await multicall.aggregate(
      routes.map((route) => {
        return {
          target: QUOTER_ADDRESS[chainId],
          callData: quoter.interface.encodeFunctionData('findBestPathAmountIn', [route, amountIn])
        }
      })
    )

    const quotes: Quote[] = call[1].map((res: any) => {
      return (quoter.interface.decodeFunctionResult('findBestPathAmountIn', res) as unknown) as Quote
    })

    return quotes
  }
}
