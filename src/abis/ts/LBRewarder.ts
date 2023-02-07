export const LBRewarderABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    inputs: [
      {
        internalType: 'contract IERC20Upgradeable',
        name: 'token',
        type: 'address'
      }
    ],
    name: 'Rewarder__AlreadySetForEpoch',
    type: 'error'
  },
  { inputs: [], name: 'Rewarder__ClawbackDelayNotPassed', type: 'error' },
  { inputs: [], name: 'Rewarder__ClawbackDelayTooLow', type: 'error' },
  { inputs: [], name: 'Rewarder__EmptyMerkleEntries', type: 'error' },
  { inputs: [], name: 'Rewarder__EpochCanceled', type: 'error' },
  { inputs: [], name: 'Rewarder__EpochDoesNotExist', type: 'error' },
  {
    inputs: [
      {
        internalType: 'contract IERC20Upgradeable',
        name: 'token',
        type: 'address'
      }
    ],
    name: 'Rewarder__InsufficientBalance',
    type: 'error'
  },
  { inputs: [], name: 'Rewarder__InvalidAmount', type: 'error' },
  { inputs: [], name: 'Rewarder__InvalidEpoch', type: 'error' },
  { inputs: [], name: 'Rewarder__InvalidLength', type: 'error' },
  { inputs: [], name: 'Rewarder__InvalidProof', type: 'error' },
  { inputs: [], name: 'Rewarder__InvalidRoot', type: 'error' },
  { inputs: [], name: 'Rewarder__InvalidStart', type: 'error' },
  {
    inputs: [],
    name: 'Rewarder__MarketAlreadyWhitelisted',
    type: 'error'
  },
  { inputs: [], name: 'Rewarder__MarketNotWhitelisted', type: 'error' },
  { inputs: [], name: 'Rewarder__NativeTransferFailed', type: 'error' },
  { inputs: [], name: 'Rewarder__OnlyClaimForSelf', type: 'error' },
  { inputs: [], name: 'Rewarder__OnlyValidLatestEpoch', type: 'error' },
  { inputs: [], name: 'Rewarder__OverlappingEpoch', type: 'error' },
  { inputs: [], name: 'Rewarder__ZeroAddress', type: 'error' },
  {
    inputs: [],
    name: 'SafeAccessControl__DefaultAdminRoleBoundToOwner',
    type: 'error'
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
    name: 'SafeAccessControl__OnlyOwnerOrRole',
    type: 'error'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint96',
        name: 'newClawbackDelay',
        type: 'uint96'
      }
    ],
    name: 'ClawbackDelayUpdated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'newClawbackRecipient',
        type: 'address'
      }
    ],
    name: 'ClawbackRecipientUpdated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'market',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'epoch',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'start',
        type: 'uint128'
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'duration',
        type: 'uint128'
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32'
      }
    ],
    name: 'EpochAdded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'market',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'epoch',
        type: 'uint256'
      }
    ],
    name: 'EpochCanceled',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8'
      }
    ],
    name: 'Initialized',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'market',
        type: 'address'
      }
    ],
    name: 'MarketAddedToWhitelist',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'market',
        type: 'address'
      }
    ],
    name: 'MarketRemovedFromWhitelist',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'OwnershipTransferStarted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'OwnershipTransferred',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'Paused',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'market',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'contract IERC20Upgradeable',
        name: 'token',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'epoch',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'released',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'unreleased',
        type: 'uint256'
      }
    ],
    name: 'RewardClaimed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'market',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'contract IERC20Upgradeable',
        name: 'token',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'epoch',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'clawbackAmount',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address'
      }
    ],
    name: 'RewardClawedBack',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32'
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'previousAdminRole',
        type: 'bytes32'
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'newAdminRole',
        type: 'bytes32'
      }
    ],
    name: 'RoleAdminChanged',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address'
      }
    ],
    name: 'RoleGranted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address'
      }
    ],
    name: 'RoleRevoked',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address'
      }
    ],
    name: 'Unpaused',
    type: 'event'
  },
  {
    inputs: [],
    name: 'CLAWBACK_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'PAUSER_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'UNPAUSER_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'market', type: 'address' }],
    name: 'addMarketToWhitelist',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'market', type: 'address' },
          { internalType: 'uint256', name: 'epoch', type: 'uint256' },
          {
            internalType: 'contract IERC20Upgradeable',
            name: 'token',
            type: 'address'
          },
          { internalType: 'address', name: 'user', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          {
            internalType: 'bytes32[]',
            name: 'merkleProof',
            type: 'bytes32[]'
          }
        ],
        internalType: 'struct IRewarder.MerkleEntry[]',
        name: 'merkleEntries',
        type: 'tuple[]'
      }
    ],
    name: 'batchClaim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'market', type: 'address' },
          { internalType: 'uint256', name: 'epoch', type: 'uint256' },
          {
            internalType: 'contract IERC20Upgradeable',
            name: 'token',
            type: 'address'
          },
          { internalType: 'address', name: 'user', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          {
            internalType: 'bytes32[]',
            name: 'merkleProof',
            type: 'bytes32[]'
          }
        ],
        internalType: 'struct IRewarder.MerkleEntry[]',
        name: 'merkleEntries',
        type: 'tuple[]'
      }
    ],
    name: 'batchClawback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'market', type: 'address' },
      { internalType: 'uint256', name: 'epoch', type: 'uint256' }
    ],
    name: 'cancelEpoch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'market', type: 'address' },
      { internalType: 'uint256', name: 'epoch', type: 'uint256' },
      {
        internalType: 'contract IERC20Upgradeable',
        name: 'token',
        type: 'address'
      },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      {
        internalType: 'bytes32[]',
        name: 'merkleProof',
        type: 'bytes32[]'
      }
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'market', type: 'address' },
      { internalType: 'uint256', name: 'epoch', type: 'uint256' },
      {
        internalType: 'contract IERC20Upgradeable',
        name: 'token',
        type: 'address'
      },
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      {
        internalType: 'bytes32[]',
        name: 'merkleProof',
        type: 'bytes32[]'
      }
    ],
    name: 'clawback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'market', type: 'address' },
          { internalType: 'uint256', name: 'epoch', type: 'uint256' },
          {
            internalType: 'contract IERC20Upgradeable',
            name: 'token',
            type: 'address'
          },
          { internalType: 'address', name: 'user', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          {
            internalType: 'bytes32[]',
            name: 'merkleProof',
            type: 'bytes32[]'
          }
        ],
        internalType: 'struct IRewarder.MerkleEntry[]',
        name: 'merkleEntries',
        type: 'tuple[]'
      }
    ],
    name: 'getBatchReleasableAmounts',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'releasableAmounts',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getClawbackParameters',
    outputs: [
      {
        internalType: 'address',
        name: 'clawbackRecipient',
        type: 'address'
      },
      { internalType: 'uint96', name: 'clawbackDelay', type: 'uint96' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'market', type: 'address' },
      { internalType: 'uint256', name: 'epoch', type: 'uint256' }
    ],
    name: 'getEpochParameters',
    outputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'root', type: 'bytes32' },
          { internalType: 'uint128', name: 'start', type: 'uint128' },
          { internalType: 'uint128', name: 'duration', type: 'uint128' }
        ],
        internalType: 'struct IRewarder.EpochParameters',
        name: 'params',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'market', type: 'address' }],
    name: 'getNumberOfEpochs',
    outputs: [{ internalType: 'uint256', name: 'epochs', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getNumberOfWhitelistedMarkets',
    outputs: [{ internalType: 'uint256', name: 'count', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'market', type: 'address' },
      { internalType: 'uint256', name: 'epoch', type: 'uint256' },
      {
        internalType: 'contract IERC20Upgradeable',
        name: 'token',
        type: 'address'
      },
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      {
        internalType: 'bytes32[]',
        name: 'merkleProof',
        type: 'bytes32[]'
      }
    ],
    name: 'getReleasableAmount',
    outputs: [{ internalType: 'uint256', name: 'releasable', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'market', type: 'address' },
      { internalType: 'uint256', name: 'epoch', type: 'uint256' },
      {
        internalType: 'contract IERC20Upgradeable',
        name: 'token',
        type: 'address'
      },
      { internalType: 'address', name: 'user', type: 'address' }
    ],
    name: 'getReleased',
    outputs: [{ internalType: 'uint256', name: 'released', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
    name: 'getWhitelistedMarket',
    outputs: [{ internalType: 'address', name: 'market', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' }
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' }
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint96', name: 'clawbackDelay', type: 'uint96' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'market', type: 'address' }],
    name: 'isMarketWhitelisted',
    outputs: [{ internalType: 'bool', name: 'isWhitelisted', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'market', type: 'address' }],
    name: 'removeMarketFromWhitelist',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' }
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' }
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint96', name: 'newClawbackDelay', type: 'uint96' }
    ],
    name: 'setClawbackDelay',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'newRecipient', type: 'address' }
    ],
    name: 'setClawbackRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'market', type: 'address' },
      { internalType: 'uint256', name: 'epoch', type: 'uint256' },
      { internalType: 'uint128', name: 'start', type: 'uint128' },
      { internalType: 'uint128', name: 'duration', type: 'uint128' },
      {
        internalType: 'contract IERC20Upgradeable[]',
        name: 'tokens',
        type: 'address[]'
      },
      {
        internalType: 'uint256[]',
        name: 'totalAmountToRelease',
        type: 'uint256[]'
      },
      { internalType: 'bytes32', name: 'root', type: 'bytes32' }
    ],
    name: 'setNewEpoch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'market', type: 'address' },
      { internalType: 'uint256', name: 'epoch', type: 'uint256' },
      {
        internalType: 'contract IERC20Upgradeable',
        name: 'token',
        type: 'address'
      },
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      {
        internalType: 'bytes32[]',
        name: 'merkleProof',
        type: 'bytes32[]'
      }
    ],
    name: 'verify',
    outputs: [{ internalType: 'bool', name: 'isValid', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  { stateMutability: 'payable', type: 'receive' }
]
