import { ChainId } from './external'

export const DEX_V2_SUBGRAPH: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: 'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/joe-v2-fuji',
  [ChainId.AVALANCHE]: 'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/joe-v2 '
}
