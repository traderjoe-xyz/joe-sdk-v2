import { Token } from 'entities/token'

/* interface for LBToken */

export interface ILBToken extends Token {
  binId: string // id of the bin identifier where the liquidity currently resides
}
