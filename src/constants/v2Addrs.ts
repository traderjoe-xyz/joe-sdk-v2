import { ChainId } from './internal'

/**
 * DEX v2 SDK
 */
export const MULTICALL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0xb465Fd2d9C71d5D6e6c069aaC9b4E21c69aAA78f',
  [ChainId.AVALANCHE]: '',
  [ChainId.ARBITRUM_ONE]: '',
  [ChainId.ARB_GOERLI]: ''
}

export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x2644fE413b8Fe94D69c4706455108368fa36354F',
  [ChainId.AVALANCHE]: '0x51409fD32C15E9857eeF9F28275FA0842C3C4545',
  [ChainId.ARBITRUM_ONE]: '',
  [ChainId.ARB_GOERLI]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x7b50046cEC8252ca835b148b1eDD997319120a12',
  [ChainId.AVALANCHE]: '0xE3Ffc583dC176575eEA7FD9dF2A7c65F7E23f4C3',
  [ChainId.ARBITRUM_ONE]: '',
  [ChainId.ARB_GOERLI]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x6B8E020098cd1B3Ec9f811024bc24e51C660F768',
  [ChainId.AVALANCHE]: '0x6E77932A92582f504FF6c4BdbCef7Da6c198aEEf',
  [ChainId.ARBITRUM_ONE]: '',
  [ChainId.ARB_GOERLI]: ''
}

export const DEXLENS_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x8b9e4f329f013320670459Bcab01C2b8DC9C32c3',
  [ChainId.AVALANCHE]: '0x16978e42a9b14A19878161A7EdE255637ce361e0',
  [ChainId.ARBITRUM_ONE]: '',
  [ChainId.ARB_GOERLI]: ''
}
