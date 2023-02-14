export const VaultABI = [
  {
    inputs: [
      {
        internalType: 'contract IVaultFactory',
        name: 'factory',
        type: 'address'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  { inputs: [], name: 'BaseVault__BurnMinShares', type: 'error' },
  { inputs: [], name: 'BaseVault__InvalidNativeAmount', type: 'error' },
  { inputs: [], name: 'BaseVault__InvalidShares', type: 'error' },
  { inputs: [], name: 'BaseVault__InvalidStrategy', type: 'error' },
  { inputs: [], name: 'BaseVault__InvalidToken', type: 'error' },
  { inputs: [], name: 'BaseVault__NativeTransferFailed', type: 'error' },
  { inputs: [], name: 'BaseVault__NoNativeToken', type: 'error' },
  { inputs: [], name: 'BaseVault__OnlyFactory', type: 'error' },
  { inputs: [], name: 'BaseVault__SameStrategy', type: 'error' },
  { inputs: [], name: 'BaseVault__ZeroAmount', type: 'error' },
  { inputs: [], name: 'BaseVault__ZeroShares', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'prod1', type: 'uint256' },
      { internalType: 'uint256', name: 'denominator', type: 'uint256' }
    ],
    name: 'Math512Bits__MulDivOverflow',
    type: 'error'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256'
      }
    ],
    name: 'Approval',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'fee', type: 'uint256' }
    ],
    name: 'DepositFeeSet',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256'
      }
    ],
    name: 'Deposited',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' }
    ],
    name: 'Initialized',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'contract IStrategy',
        name: 'strategy',
        type: 'address'
      }
    ],
    name: 'StrategySet',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256'
      }
    ],
    name: 'Transfer',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'fee', type: 'uint256' }
    ],
    name: 'WithdrawalFeeSet',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256'
      }
    ],
    name: 'Withdrawn',
    type: 'event'
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'subtractedValue', type: 'uint256' }
    ],
    name: 'decreaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amountX', type: 'uint256' },
      { internalType: 'uint256', name: 'amountY', type: 'uint256' }
    ],
    name: 'deposit',
    outputs: [
      { internalType: 'uint256', name: 'shares', type: 'uint256' },
      { internalType: 'uint256', name: 'effectiveX', type: 'uint256' },
      { internalType: 'uint256', name: 'effectiveY', type: 'uint256' }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amountX', type: 'uint256' },
      { internalType: 'uint256', name: 'amountY', type: 'uint256' }
    ],
    name: 'depositNative',
    outputs: [
      { internalType: 'uint256', name: 'shares', type: 'uint256' },
      { internalType: 'uint256', name: 'effectiveX', type: 'uint256' },
      { internalType: 'uint256', name: 'effectiveY', type: 'uint256' }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getBalances',
    outputs: [
      { internalType: 'uint256', name: 'amountX', type: 'uint256' },
      { internalType: 'uint256', name: 'amountY', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getFactory',
    outputs: [
      { internalType: 'contract IVaultFactory', name: '', type: 'address' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getOperators',
    outputs: [
      { internalType: 'address', name: 'defaultOperator', type: 'address' },
      { internalType: 'address', name: 'operator', type: 'address' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getPair',
    outputs: [{ internalType: 'contract ILBPair', name: '', type: 'address' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getPendingFees',
    outputs: [
      { internalType: 'uint256', name: 'feesX', type: 'uint256' },
      { internalType: 'uint256', name: 'feesY', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getRange',
    outputs: [
      { internalType: 'uint24', name: 'low', type: 'uint24' },
      { internalType: 'uint24', name: 'upper', type: 'uint24' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getStrategistFee',
    outputs: [
      { internalType: 'uint256', name: 'strategistFee', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getStrategy',
    outputs: [
      { internalType: 'contract IStrategy', name: '', type: 'address' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getTokenX',
    outputs: [
      { internalType: 'contract IERC20Upgradeable', name: '', type: 'address' }
    ],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getTokenY',
    outputs: [
      { internalType: 'contract IERC20Upgradeable', name: '', type: 'address' }
    ],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'addedValue', type: 'uint256' }
    ],
    name: 'increaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'symbol', type: 'string' }
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pauseVault',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'shares', type: 'uint256' }],
    name: 'previewAmounts',
    outputs: [
      { internalType: 'uint256', name: 'amountX', type: 'uint256' },
      { internalType: 'uint256', name: 'amountY', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amountX', type: 'uint256' },
      { internalType: 'uint256', name: 'amountY', type: 'uint256' }
    ],
    name: 'previewShares',
    outputs: [
      { internalType: 'uint256', name: 'shares', type: 'uint256' },
      { internalType: 'uint256', name: 'effectiveX', type: 'uint256' },
      { internalType: 'uint256', name: 'effectiveY', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'contract IERC20Upgradeable',
        name: 'token',
        type: 'address'
      },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'recoverERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'contract IStrategy',
        name: 'newStrategy',
        type: 'address'
      }
    ],
    name: 'setStrategy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'shares', type: 'uint256' }],
    name: 'withdraw',
    outputs: [
      { internalType: 'uint256', name: 'amountX', type: 'uint256' },
      { internalType: 'uint256', name: 'amountY', type: 'uint256' }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const
