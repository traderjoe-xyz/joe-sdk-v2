import { ChainId } from "./external"

/**
 * DEX v2 SDK
 */
export const MULTICALL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0xb465Fd2d9C71d5D6e6c069aaC9b4E21c69aAA78f',
  [ChainId.AVALANCHE]: ''
}

export const QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x0EE0e8e2E35F9008835312AD012B0Ae0983338EC',
  [ChainId.AVALANCHE]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0xE9e38190D2440d6cD28cF0Ce453FB86CB8725f8A',
  [ChainId.AVALANCHE]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x7e4bEe572255673044035d62802c6D2d8Ef1fF9f',
  [ChainId.AVALANCHE]: ''
}
