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

export const FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x86f83be9770894d8e46301b12E88e14AdC6cdb5F',
  [ChainId.FUJI]: '0x7eeccb3028870540EEc3D88C2259506f2d34fEE0',
  [ChainId.AVALANCHE]: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88' // TODO
}

export const JOE_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x4bCa851F272B1a3DAdb077e86AFa94910160d03E',
  [ChainId.FUJI]: '0xcee9d937E3627E55F08240072D63f32c3a60fF2D',
  [ChainId.AVALANCHE]: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88' // TODO
}

export const MASTERCHEF_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x30e112880b60Cc8046653B246b147EB681BC2D79',
  [ChainId.FUJI]: '0x2d388F47c3Ae5CC0C7F8ad73296B208cfaCd35ae',
  [ChainId.AVALANCHE]: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88' // TODO
}

export const BAR_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0xd7FeB56CAc77d610b0ab006eF2a0511b7EbF4a3E',
  [ChainId.FUJI]: '0x171B28d39De22EF001029117F3d241fF78c7DC5C',
  [ChainId.AVALANCHE]: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88' // TODO
}

export const ZAP_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x545d2C81b91c290d39D09B4cB00BA6E5c3CC01C2',
  [ChainId.FUJI]: '0x5BBFA5f49EC557eABA9427Ac434F21b69113Fe20', // TODO
  [ChainId.AVALANCHE]: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88' // TODO
}

export const ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x7E2528476b14507f003aE9D123334977F5Ad7B14',
  [ChainId.FUJI]: '0x5db0735cf88F85E78ed742215090c465979B5006',
  [ChainId.AVALANCHE]: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88' // TODO
}

export const MAKER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x5B29eb224f30Cf3d9a91149167cd761F1975CF9a',
  [ChainId.FUJI]: '0x0529719e33AA2f15c13b12be01D7E876454Caf02',
  [ChainId.AVALANCHE]: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88' // TODO
}

export const ROLL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x14261F7A78D3394D6144AeD73b52Bb8d1A146b38',
  [ChainId.FUJI]: '0x41d5f5F66e4cEd197Ff273308A1c194E9E249f4F',
  [ChainId.AVALANCHE]: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88' // TODO
}

export const BORINGHELPER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x7281BF1a2A595a9fe838CAe309c5838376727D63',
  [ChainId.FUJI]: '0xD28be693a573a26f50195213613EC893Ad5c4460',
  [ChainId.AVALANCHE]: '0x5cFcA5b2149A20A166508B28e5FCFA65c44c6B9c' // TODO
}

export const BORINGTOKENSCANNER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0xb759070037e96507BA713777995f9a2C3C84D4F1',
  [ChainId.FUJI]: '0xD28be693a573a26f50195213613EC893Ad5c4460',
  [ChainId.AVALANCHE]: '0x5cFcA5b2149A20A166508B28e5FCFA65c44c6B9c' // TODO
}

export const BORINGDASHBOARD_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x4cD67EB0EcBB55fEd5206aa3625813E5832C77DB',
  [ChainId.FUJI]: '0xD28be693a573a26f50195213613EC893Ad5c4460',
  [ChainId.AVALANCHE]: '0x5cFcA5b2149A20A166508B28e5FCFA65c44c6B9c' // TODO
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
