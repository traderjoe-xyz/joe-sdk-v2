import { ChainId } from './internal'

/**
 * DEX v2 SDK
 */
export const MULTICALL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0xb465Fd2d9C71d5D6e6c069aaC9b4E21c69aAA78f',
  [ChainId.AVALANCHE]: ''
}

export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x2644fE413b8Fe94D69c4706455108368fa36354F',
  [ChainId.AVALANCHE]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x7b50046cEC8252ca835b148b1eDD997319120a12',
  [ChainId.AVALANCHE]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x6B8E020098cd1B3Ec9f811024bc24e51C660F768',
  [ChainId.AVALANCHE]: ''
}

export const DEXLENS_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x8b9e4f329f013320670459Bcab01C2b8DC9C32c3',
  [ChainId.AVALANCHE]: ''
}
