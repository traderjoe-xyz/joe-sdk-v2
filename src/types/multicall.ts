export interface MulticallResult {
  success: boolean
  returnData: string
}

export interface MulticallCall {
  target: string
  allowFailure: boolean
  callData: string
}
