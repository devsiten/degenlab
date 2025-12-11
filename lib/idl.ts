export type PumpFun = {
  version: '0.1.0';
  name: 'pump';
  instructions: [
    {
      name: 'create';
      docs: ['Creates a new token with bonding curve'];
      accounts: [
        { name: 'mint'; isMut: true; isSigner: true },
        { name: 'mintAuthority'; isMut: false; isSigner: false },
        { name: 'bondingCurve'; isMut: true; isSigner: false },
        { name: 'associatedBondingCurve'; isMut: true; isSigner: false },
        { name: 'global'; isMut: false; isSigner: false },
        { name: 'mplTokenMetadata'; isMut: false; isSigner: false },
        { name: 'metadata'; isMut: true; isSigner: false },
        { name: 'user'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false },
        { name: 'tokenProgram'; isMut: false; isSigner: false },
        { name: 'associatedTokenProgram'; isMut: false; isSigner: false },
        { name: 'rent'; isMut: false; isSigner: false },
        { name: 'eventAuthority'; isMut: false; isSigner: false },
        { name: 'program'; isMut: false; isSigner: false }
      ];
      args: [
        { name: 'name'; type: 'string' },
        { name: 'symbol'; type: 'string' },
        { name: 'uri'; type: 'string' }
      ];
    },
    {
      name: 'buy';
      docs: ['Buys tokens from bonding curve'];
      accounts: [
        { name: 'global'; isMut: false; isSigner: false },
        { name: 'feeRecipient'; isMut: true; isSigner: false },
        { name: 'mint'; isMut: false; isSigner: false },
        { name: 'bondingCurve'; isMut: true; isSigner: false },
        { name: 'associatedBondingCurve'; isMut: true; isSigner: false },
        { name: 'associatedUser'; isMut: true; isSigner: false },
        { name: 'user'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false },
        { name: 'tokenProgram'; isMut: false; isSigner: false },
        { name: 'rent'; isMut: false; isSigner: false },
        { name: 'eventAuthority'; isMut: false; isSigner: false },
        { name: 'program'; isMut: false; isSigner: false }
      ];
      args: [
        { name: 'amount'; type: 'u64' },
        { name: 'maxSolCost'; type: 'u64' }
      ];
    },
    {
      name: 'sell';
      docs: ['Sells tokens into bonding curve'];
      accounts: [
        { name: 'global'; isMut: false; isSigner: false },
        { name: 'feeRecipient'; isMut: true; isSigner: false },
        { name: 'mint'; isMut: false; isSigner: false },
        { name: 'bondingCurve'; isMut: true; isSigner: false },
        { name: 'associatedBondingCurve'; isMut: true; isSigner: false },
        { name: 'associatedUser'; isMut: true; isSigner: false },
        { name: 'user'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false },
        { name: 'tokenProgram'; isMut: false; isSigner: false },
        { name: 'eventAuthority'; isMut: false; isSigner: false },
        { name: 'program'; isMut: false; isSigner: false }
      ];
      args: [
        { name: 'amount'; type: 'u64' },
        { name: 'minSolOutput'; type: 'u64' }
      ];
    }
  ];
  accounts: [
    {
      name: 'BondingCurve';
      type: {
        kind: 'struct';
        fields: [
          { name: 'virtualTokenReserves'; type: 'u64' },
          { name: 'virtualSolReserves'; type: 'u64' },
          { name: 'realTokenReserves'; type: 'u64' },
          { name: 'realSolReserves'; type: 'u64' },
          { name: 'tokenTotalSupply'; type: 'u64' },
          { name: 'complete'; type: 'bool' }
        ];
      };
    },
    {
      name: 'Global';
      type: {
        kind: 'struct';
        fields: [
          { name: 'initialized'; type: 'bool' },
          { name: 'authority'; type: 'publicKey' },
          { name: 'feeRecipient'; type: 'publicKey' },
          { name: 'initialVirtualTokenReserves'; type: 'u64' },
          { name: 'initialVirtualSolReserves'; type: 'u64' },
          { name: 'initialRealTokenReserves'; type: 'u64' },
          { name: 'tokenTotalSupply'; type: 'u64' },
          { name: 'feeBasisPoints'; type: 'u64' }
        ];
      };
    }
  ];
  events: [
    {
      name: 'CreateEvent';
      fields: [
        { name: 'name'; type: 'string'; index: false },
        { name: 'symbol'; type: 'string'; index: false },
        { name: 'uri'; type: 'string'; index: false },
        { name: 'mint'; type: 'publicKey'; index: false },
        { name: 'bondingCurve'; type: 'publicKey'; index: false },
        { name: 'user'; type: 'publicKey'; index: false }
      ];
    },
    {
      name: 'TradeEvent';
      fields: [
        { name: 'mint'; type: 'publicKey'; index: false },
        { name: 'solAmount'; type: 'u64'; index: false },
        { name: 'tokenAmount'; type: 'u64'; index: false },
        { name: 'isBuy'; type: 'bool'; index: false },
        { name: 'user'; type: 'publicKey'; index: false },
        { name: 'timestamp'; type: 'i64'; index: false },
        { name: 'virtualSolReserves'; type: 'u64'; index: false },
        { name: 'virtualTokenReserves'; type: 'u64'; index: false }
      ];
    },
    {
      name: 'CompleteEvent';
      fields: [
        { name: 'user'; type: 'publicKey'; index: false },
        { name: 'mint'; type: 'publicKey'; index: false },
        { name: 'bondingCurve'; type: 'publicKey'; index: false },
        { name: 'timestamp'; type: 'i64'; index: false }
      ];
    }
  ];
};

export const IDL: PumpFun = {
  version: '0.1.0',
  name: 'pump',
  instructions: [
    {
      name: 'create',
      docs: ['Creates a new token with bonding curve'],
      accounts: [
        { name: 'mint', isMut: true, isSigner: true },
        { name: 'mintAuthority', isMut: false, isSigner: false },
        { name: 'bondingCurve', isMut: true, isSigner: false },
        { name: 'associatedBondingCurve', isMut: true, isSigner: false },
        { name: 'global', isMut: false, isSigner: false },
        { name: 'mplTokenMetadata', isMut: false, isSigner: false },
        { name: 'metadata', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'associatedTokenProgram', isMut: false, isSigner: false },
        { name: 'rent', isMut: false, isSigner: false },
        { name: 'eventAuthority', isMut: false, isSigner: false },
        { name: 'program', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'name', type: 'string' },
        { name: 'symbol', type: 'string' },
        { name: 'uri', type: 'string' },
      ],
    },
    {
      name: 'buy',
      docs: ['Buys tokens from bonding curve'],
      accounts: [
        { name: 'global', isMut: false, isSigner: false },
        { name: 'feeRecipient', isMut: true, isSigner: false },
        { name: 'mint', isMut: false, isSigner: false },
        { name: 'bondingCurve', isMut: true, isSigner: false },
        { name: 'associatedBondingCurve', isMut: true, isSigner: false },
        { name: 'associatedUser', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'rent', isMut: false, isSigner: false },
        { name: 'eventAuthority', isMut: false, isSigner: false },
        { name: 'program', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'amount', type: 'u64' },
        { name: 'maxSolCost', type: 'u64' },
      ],
    },
    {
      name: 'sell',
      docs: ['Sells tokens into bonding curve'],
      accounts: [
        { name: 'global', isMut: false, isSigner: false },
        { name: 'feeRecipient', isMut: true, isSigner: false },
        { name: 'mint', isMut: false, isSigner: false },
        { name: 'bondingCurve', isMut: true, isSigner: false },
        { name: 'associatedBondingCurve', isMut: true, isSigner: false },
        { name: 'associatedUser', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'eventAuthority', isMut: false, isSigner: false },
        { name: 'program', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'amount', type: 'u64' },
        { name: 'minSolOutput', type: 'u64' },
      ],
    },
  ],
  accounts: [
    {
      name: 'BondingCurve',
      type: {
        kind: 'struct',
        fields: [
          { name: 'virtualTokenReserves', type: 'u64' },
          { name: 'virtualSolReserves', type: 'u64' },
          { name: 'realTokenReserves', type: 'u64' },
          { name: 'realSolReserves', type: 'u64' },
          { name: 'tokenTotalSupply', type: 'u64' },
          { name: 'complete', type: 'bool' },
        ],
      },
    },
    {
      name: 'Global',
      type: {
        kind: 'struct',
        fields: [
          { name: 'initialized', type: 'bool' },
          { name: 'authority', type: 'publicKey' },
          { name: 'feeRecipient', type: 'publicKey' },
          { name: 'initialVirtualTokenReserves', type: 'u64' },
          { name: 'initialVirtualSolReserves', type: 'u64' },
          { name: 'initialRealTokenReserves', type: 'u64' },
          { name: 'tokenTotalSupply', type: 'u64' },
          { name: 'feeBasisPoints', type: 'u64' },
        ],
      },
    },
  ],
  events: [
    {
      name: 'CreateEvent',
      fields: [
        { name: 'name', type: 'string', index: false },
        { name: 'symbol', type: 'string', index: false },
        { name: 'uri', type: 'string', index: false },
        { name: 'mint', type: 'publicKey', index: false },
        { name: 'bondingCurve', type: 'publicKey', index: false },
        { name: 'user', type: 'publicKey', index: false },
      ],
    },
    {
      name: 'TradeEvent',
      fields: [
        { name: 'mint', type: 'publicKey', index: false },
        { name: 'solAmount', type: 'u64', index: false },
        { name: 'tokenAmount', type: 'u64', index: false },
        { name: 'isBuy', type: 'bool', index: false },
        { name: 'user', type: 'publicKey', index: false },
        { name: 'timestamp', type: 'i64', index: false },
        { name: 'virtualSolReserves', type: 'u64', index: false },
        { name: 'virtualTokenReserves', type: 'u64', index: false },
      ],
    },
    {
      name: 'CompleteEvent',
      fields: [
        { name: 'user', type: 'publicKey', index: false },
        { name: 'mint', type: 'publicKey', index: false },
        { name: 'bondingCurve', type: 'publicKey', index: false },
        { name: 'timestamp', type: 'i64', index: false },
      ],
    },
  ],
};
