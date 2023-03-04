import { ChainId } from './internal'

export const DEX_V2_SUBGRAPH: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]:
    'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/joe-v2-fuji',
  [ChainId.AVALANCHE]:
    'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/joe-v2',
  [ChainId.ARBITRUM_ONE]:
    'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/joe-v2-arbitrum',
  [ChainId.ARB_GOERLI]:
    'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/joe-v2-arb-goerli',
  [ChainId.BNB_CHAIN]:
    'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/joe-v2-bnb',
  [ChainId.BNB_TESTNET]:
    'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/joe-v2-bnbtest'
}

export const DEXCANDLES_SUBGRAPH_V2: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]:
    'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/dex-candles-v2-fuji',
  [ChainId.AVALANCHE]:
    'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/dex-candles-v2',
  [ChainId.ARBITRUM_ONE]:
    'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/dexcandles-v2-arbitrum',
  [ChainId.ARB_GOERLI]:
    'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/dexcandles-v2-arb-goerli',
  [ChainId.BNB_CHAIN]:
    'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/dexcandles-v2-bnb',
  [ChainId.BNB_TESTNET]:
    'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/dexcandles-v2-bnbtest'
}
