import { ChainId } from './external'

/**
 * Lending SDK
 */

export const UNITROLLER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0xf817f74bb514cb0AF7d3b56299c33C33895630f2',
  [ChainId.AVALANCHE]: '0xdc13687554205E5b89Ac783db14bb5bba4A1eDaC'
}

// used to get jToken balances, jToken metadata, account’s borrow limit & claimable rewards
export const JOELENS_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x3A2C79d45EEdcE68d3993F807336D4b0b41741b0',
  [ChainId.AVALANCHE]: '0x994Ed0698F5145211Fd5DAE458dD7d91c2da6CEC'
}

export const JAVAX_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0xE2b2CF0Cc751223C4F2Dc9EF1Cd8d2F27f92a84a',
  [ChainId.AVALANCHE]: '0xC22F01ddc8010Ee05574028528614634684EC29e'
}

// used to repay an account’s borrow amount in the jAvax market
export const MAXIMILLION_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x7b647D11b2E9354fA570B8613BD361AE51e51c27',
  [ChainId.AVALANCHE]: '0xe5cDdAFd0f7Af3DEAf4bd213bBaee7A5927AB7E7'
}
