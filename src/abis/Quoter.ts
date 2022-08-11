export default [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_routerV2',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_factoryV1',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_factoryV2',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_wavax',
        type: 'address'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [],
    name: 'factoryV1',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'factoryV2',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_route',
        type: 'address[]'
      },
      {
        internalType: 'uint256',
        name: '_amountIn',
        type: 'uint256'
      }
    ],
    name: 'findBestPathAmountIn',
    outputs: [
      {
        internalType: 'address[]',
        name: 'route',
        type: 'address[]'
      },
      {
        internalType: 'address[]',
        name: 'pairs',
        type: 'address[]'
      },
      {
        internalType: 'uint256[]',
        name: 'binSteps',
        type: 'uint256[]'
      },
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]'
      },
      {
        internalType: 'uint256',
        name: 'tradeValueAVAX',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_route',
        type: 'address[]'
      },
      {
        internalType: 'uint256',
        name: '_amountOut',
        type: 'uint256'
      }
    ],
    name: 'findBestPathAmountOut',
    outputs: [
      {
        internalType: 'address[]',
        name: 'route',
        type: 'address[]'
      },
      {
        internalType: 'address[]',
        name: 'pairs',
        type: 'address[]'
      },
      {
        internalType: 'uint256[]',
        name: 'binSteps',
        type: 'uint256[]'
      },
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]'
      },
      {
        internalType: 'uint256',
        name: 'tradeValueAVAX',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'routerV2',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'wavax',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]
