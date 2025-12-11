import { PublicKey } from '@solana/web3.js';

// PumpFun Program IDs
export const PUMP_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
export const PUMPSWAP_PROGRAM_ID = new PublicKey('pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA');

// System Programs
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
export const SYSTEM_PROGRAM_ID = new PublicKey('11111111111111111111111111111111');
export const RENT_PROGRAM_ID = new PublicKey('SysvarRent111111111111111111111111111111111');
export const METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// PumpFun Fee Recipient
export const PUMP_FEE_RECIPIENT = new PublicKey('CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM');

// PDA Seeds
export const GLOBAL_SEED = 'global';
export const MINT_AUTHORITY_SEED = 'mint-authority';
export const BONDING_CURVE_SEED = 'bonding-curve';
export const METADATA_SEED = 'metadata';

// Token Config
export const TOKEN_DECIMALS = 6;
export const TOTAL_SUPPLY = 1_000_000_000; // 1 billion
export const BONDING_CURVE_SUPPLY = 800_000_000; // 800 million on curve
export const LAMPORTS_PER_SOL = 1_000_000_000;

// Graduation threshold (~$69K market cap in SOL)
export const GRADUATION_THRESHOLD_SOL = 85; // approximately 85 SOL

// Jupiter API
export const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6';
export const JUPITER_SWAP_API = 'https://quote-api.jup.ag/v6/swap';

// RPC Endpoints
export const RPC_ENDPOINTS = {
  mainnet: process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
};

// Platform Config
export const PLATFORM_CONFIG = {
  name: 'DegenLab',
  description: 'Launch your memecoin in seconds',
  tradingFee: 1, // 1% trading fee on bonding curve
  platformFee: 0.5, // 0.5% platform fee
  slippageDefault: 10, // 10% default slippage for memecoins
  maxSlippage: 50, // 50% max slippage
};

// SOL Mint
export const SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');
export const WSOL_MINT = SOL_MINT;

// Image upload config
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Anchor Discriminators (pre-calculated)
export const DISCRIMINATORS = {
  create: Buffer.from([24, 30, 200, 40, 5, 28, 7, 119]),
  buy: Buffer.from([102, 6, 61, 18, 1, 218, 235, 234]),
  sell: Buffer.from([51, 230, 133, 164, 1, 127, 131, 173]),
  withdraw: Buffer.from([183, 18, 70, 156, 148, 109, 161, 34]),
};

// API Routes
export const API_ROUTES = {
  uploadImage: '/api/upload',
  createToken: '/api/token/create',
  getToken: '/api/token',
  getTrending: '/api/trending',
  getTrades: '/api/trades',
};
