import { ChainId } from './external'

/**
 * DEX v2 SDK
 */
export const MULTICALL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0xb465Fd2d9C71d5D6e6c069aaC9b4E21c69aAA78f',
  [ChainId.AVALANCHE]: ''
}

export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x095808Ee0C8248bF37d7Bf0C050d563f078Ef674',
  [ChainId.AVALANCHE]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x88080086a243616008294725A4B0fD78B4d6a6c2',
  [ChainId.AVALANCHE]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x2c2A4F4F0d5BABB0E501784F4D66a7131eff86F1',
  [ChainId.AVALANCHE]: ''
}
