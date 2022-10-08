import { ChainId } from './external'

/**
 * DEX v2 SDK
 */
export const MULTICALL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0xb465Fd2d9C71d5D6e6c069aaC9b4E21c69aAA78f',
  [ChainId.AVALANCHE]: ''
}

export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x0C926BF1E71725eD68AE3041775e9Ba29142dca9',
  [ChainId.AVALANCHE]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x0C344c52841d3F8d488E1CcDBafB42CE2C7fdFA9',
  [ChainId.AVALANCHE]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x2950b9bd19152C91d69227364747b3e6EFC8Ab7F',
  [ChainId.AVALANCHE]: ''
}
