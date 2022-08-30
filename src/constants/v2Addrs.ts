import { ChainId } from './external'

/**
 * DEX v2 SDK
 */
export const MULTICALL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0xb465Fd2d9C71d5D6e6c069aaC9b4E21c69aAA78f',
  [ChainId.AVALANCHE]: ''
}

export const QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x0810F74007A72651037B1aD3F119A5b4e409d13C',
  [ChainId.AVALANCHE]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x670E135F3eC6D3635B67db5fCB5841F6cA85787C',
  [ChainId.AVALANCHE]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0xF4Aa1047dEebB0D01933B7124c67393aF66D2Bd2',
  [ChainId.AVALANCHE]: ''
}
