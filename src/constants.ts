import JSBI from 'jsbi'

// exports for external consumption
export type BigintIsh = JSBI | bigint | string

export enum ChainId {
  RINKEBY = 4,
  FUJI = 43113,
  AVALANCHE = 43114
}

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP
}

/**
 * DEX SDK
 */
export const FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x86f83be9770894d8e46301b12E88e14AdC6cdb5F',
  [ChainId.FUJI]: '0x7eeccb3028870540EEc3D88C2259506f2d34fEE0',
  [ChainId.AVALANCHE]: '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10'
}

export const JOE_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0xce347E069B68C53A9ED5e7DA5952529cAF8ACCd4',
  [ChainId.FUJI]: '0xcee9d937E3627E55F08240072D63f32c3a60fF2D',
  [ChainId.AVALANCHE]: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd'
}

export const MASTERCHEF_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x1F51b7697A1919cF301845c93D4843FD620ad7Cc',
  [ChainId.FUJI]: '0x2d388F47c3Ae5CC0C7F8ad73296B208cfaCd35ae',
  [ChainId.AVALANCHE]: '0xd6a4F121CA35509aF06A0Be99093d08462f53052'
}

export const MASTERCHEF_V3_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0xEedf119022F1Bb5F63676BbE855c82151B7198AF',
  [ChainId.FUJI]: '0x0000000000000000000000000000000000000000',
  [ChainId.AVALANCHE]: '0x0000000000000000000000000000000000000000'
}

export const BAR_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x33A86aFC0f728882F48E5105bc98758b3eAe2081',
  [ChainId.FUJI]: '0x171B28d39De22EF001029117F3d241fF78c7DC5C',
  [ChainId.AVALANCHE]: '0x57319d41F71E81F3c65F2a47CA4e001EbAFd4F33'
}

export const ZAP_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x70c949152D2AC84FbB809228606db4654773D994',
  [ChainId.FUJI]: '0x5BBFA5f49EC557eABA9427Ac434F21b69113Fe20',
  [ChainId.AVALANCHE]: '0x2C7B8e971c704371772eDaf16e0dB381A8D02027'
}

export const ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x7E2528476b14507f003aE9D123334977F5Ad7B14',
  [ChainId.FUJI]: '0x5db0735cf88F85E78ed742215090c465979B5006',
  [ChainId.AVALANCHE]: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4'
}

export const MAKER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0xbEFE1d0756Da706B3F0EbaEa7b4ae10D0AdF2f3F',
  [ChainId.FUJI]: '0x0529719e33AA2f15c13b12be01D7E876454Caf02',
  [ChainId.AVALANCHE]: '0x861726BFE27931A4E22a7277bDe6cb8432b65856'
}

export const ROLL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0xD6344FF98d12adD998cBcfaC16A215396e9bCb8c',
  [ChainId.FUJI]: '0x41d5f5F66e4cEd197Ff273308A1c194E9E249f4F',
  [ChainId.AVALANCHE]: '0xacFF0fBf56bAeb9Ef677DE19ADED8F7A950BCb58'
}

export const BORINGHELPER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x9bB44606E6E201b5c1cCF54A4246cCb61A3D948a',
  [ChainId.FUJI]: '0xD28be693a573a26f50195213613EC893Ad5c4460',
  [ChainId.AVALANCHE]: '0x1dd4D86180EEe39ac4fB35ECa67CACF608Ab5741'
}

export const BORINGTOKENSCANNER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0xdd5C40b5f0f5Df9c8BF0aA4703d73867ea7f022D',
  [ChainId.FUJI]: '0xD28be693a573a26f50195213613EC893Ad5c4460',
  [ChainId.AVALANCHE]: '0x5cFcA5b2149A20A166508B28e5FCFA65c44c6B9c'
}

export const BORINGDASHBOARD_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0xeC208ef9F8aEDbbF28722286E334a3939acEA646',
  [ChainId.FUJI]: '0xD28be693a573a26f50195213613EC893Ad5c4460',
  [ChainId.AVALANCHE]: '0x1Af353148F2316487b5311Fcd522c037842D232c'
}

export const INIT_CODE_HASH = '0x0bbca9af0511ad1a1da383135cf3a8d2ac620e549ef9f6ae3a4c33c2fed0af91'

export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

// exports for internal consumption
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const TWO = JSBI.BigInt(2)
export const THREE = JSBI.BigInt(3)
export const FIVE = JSBI.BigInt(5)
export const TEN = JSBI.BigInt(10)
export const _100 = JSBI.BigInt(100)
export const _997 = JSBI.BigInt(997)
export const _1000 = JSBI.BigInt(1000)

export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256'
}

export const SOLIDITY_TYPE_MAXIMA = {
  [SolidityType.uint8]: JSBI.BigInt('0xff'),
  [SolidityType.uint256]: JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
}

/**
 * Lending SDK
 */

export const UNITROLLER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x5b0a2Fa14808E34C5518E19f0DBc39F61d080B11',
  [ChainId.FUJI]: '0x0000000000000000000000000000000000000000',
  [ChainId.AVALANCHE]: '0xdc13687554205E5b89Ac783db14bb5bba4A1eDaC'
}

export const JOELENS_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x4F101798dd4AF8A2A8325F4C54C195a61C59Dc62',
  [ChainId.FUJI]: '0x0000000000000000000000000000000000000000',
  [ChainId.AVALANCHE]: '0xFDF50FEa3527FaD31Fa840B748FD3694aE8a47cc'
}

export const JOELENSVIEW_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x51fBdc8FCa72CeF1E1b558DB0c502e874DB5602A',
  [ChainId.FUJI]: '0x0000000000000000000000000000000000000000',
  [ChainId.AVALANCHE]: '0x0000000000000000000000000000000000000000'
}

export const JAVAX_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x0444dcF838055493519F26021dE63Afa72EEe0D2',
  [ChainId.FUJI]: '0x0000000000000000000000000000000000000000',
  [ChainId.AVALANCHE]: '0xC22F01ddc8010Ee05574028528614634684EC29e'
}

export const MAXIMILLION_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0xC48B0159d3e7F240ac76cc3Ce39dF62fCd4656b0',
  [ChainId.FUJI]: '0x0000000000000000000000000000000000000000',
  [ChainId.AVALANCHE]: '0xe5cDdAFd0f7Af3DEAf4bd213bBaee7A5927AB7E7'
}
