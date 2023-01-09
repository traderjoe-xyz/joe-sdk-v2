/** Class with helper functions related to bin id and price */
export class Bin {
  /**
   * @static
   * Returns the price of bin given its id and the bin step
   *
   * @param {number} id - The bin id
   * @param {number} binStep
   * @returns {number}
   */
  public static getPriceFromId(id: number, binStep: number): number {
    return (1 + binStep / 10_000) ** (id - 8388608)
  }

  /**
   * @static
   * Returns the bin id given its price and the bin step
   *
   * @param {number} price - The price of the bin
   * @param {number} binStep
   * @returns {number}
   */
  public static getIdFromPrice(price: number, binStep: number): number {
    return (
      Math.trunc(Math.log(price) / Math.log(1 + binStep / 10_000)) + 8388608
    )
  }

  /**
   * @static
   * Returns idSlippage given slippage tolerance and the bin step
   *
   * @param {number} priceSlippage
   * @param {number} binStep
   * @returns {number}
   */
  public static getIdSlippageFromPriceSlippage(
    priceSlippage: number,
    binStep: number
  ): number {
    return Math.floor(
      Math.log(1 + priceSlippage) / Math.log(1 + binStep / 10_000)
    )
  }
}
