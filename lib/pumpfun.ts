import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import BN from 'bn.js';
import {
  PUMP_PROGRAM_ID,
  PUMP_FEE_RECIPIENT,
  GLOBAL_SEED,
  BONDING_CURVE_SEED,
  MINT_AUTHORITY_SEED,
  METADATA_SEED,
  METAPLEX_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  RENT_PROGRAM_ID,
  TOKEN_DECIMALS,
} from './constants';

// Bonding curve account structure
export interface BondingCurveAccount {
  virtualTokenReserves: BN;
  virtualSolReserves: BN;
  realTokenReserves: BN;
  realSolReserves: BN;
  tokenTotalSupply: BN;
  complete: boolean;
}

// Get Global PDA
export function getGlobalPDA(): PublicKey {
  const [globalPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_SEED)],
    PUMP_PROGRAM_ID
  );
  return globalPDA;
}

// Get Mint Authority PDA
export function getMintAuthorityPDA(): PublicKey {
  const [mintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from(MINT_AUTHORITY_SEED)],
    PUMP_PROGRAM_ID
  );
  return mintAuthority;
}

// Get Bonding Curve PDA for a token
export function getBondingCurvePDA(mint: PublicKey): PublicKey {
  const [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from(BONDING_CURVE_SEED), mint.toBuffer()],
    PUMP_PROGRAM_ID
  );
  return bondingCurve;
}

// Get Metadata PDA
export function getMetadataPDA(mint: PublicKey): PublicKey {
  const [metadata] = PublicKey.findProgramAddressSync(
    [Buffer.from(METADATA_SEED), METAPLEX_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    METAPLEX_PROGRAM_ID
  );
  return metadata;
}

// Get Event Authority PDA
export function getEventAuthorityPDA(): PublicKey {
  const [eventAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('__event_authority')],
    PUMP_PROGRAM_ID
  );
  return eventAuthority;
}

// Parse bonding curve account data
export function parseBondingCurveAccount(data: Buffer): BondingCurveAccount {
  // Skip 8 byte discriminator
  const offset = 8;
  
  return {
    virtualTokenReserves: new BN(data.slice(offset, offset + 8), 'le'),
    virtualSolReserves: new BN(data.slice(offset + 8, offset + 16), 'le'),
    realTokenReserves: new BN(data.slice(offset + 16, offset + 24), 'le'),
    realSolReserves: new BN(data.slice(offset + 24, offset + 32), 'le'),
    tokenTotalSupply: new BN(data.slice(offset + 32, offset + 40), 'le'),
    complete: data[offset + 40] === 1,
  };
}

// Calculate token price from bonding curve
export function calculateTokenPrice(bondingCurve: BondingCurveAccount): number {
  const virtualSol = bondingCurve.virtualSolReserves.toNumber();
  const virtualToken = bondingCurve.virtualTokenReserves.toNumber();
  
  if (virtualToken === 0) return 0;
  
  // Price = virtual_sol_reserves / virtual_token_reserves
  const price = virtualSol / virtualToken;
  return price / LAMPORTS_PER_SOL * Math.pow(10, TOKEN_DECIMALS);
}

// Calculate market cap in SOL
export function calculateMarketCap(bondingCurve: BondingCurveAccount): number {
  const price = calculateTokenPrice(bondingCurve);
  const totalSupply = bondingCurve.tokenTotalSupply.toNumber() / Math.pow(10, TOKEN_DECIMALS);
  return price * totalSupply;
}

// Calculate bonding curve progress (0-100%)
export function calculateProgress(bondingCurve: BondingCurveAccount): number {
  const realSol = bondingCurve.realSolReserves.toNumber();
  // Graduation happens around 85 SOL
  const graduationThreshold = 85 * LAMPORTS_PER_SOL;
  return Math.min((realSol / graduationThreshold) * 100, 100);
}

// Calculate buy amount (tokens out for SOL in)
export function calculateBuyAmount(
  bondingCurve: BondingCurveAccount,
  solAmount: BN
): BN {
  const virtualSol = bondingCurve.virtualSolReserves;
  const virtualToken = bondingCurve.virtualTokenReserves;
  
  // Constant product formula: (x + dx) * (y - dy) = x * y
  // dy = y - (x * y) / (x + dx)
  // dy = y * dx / (x + dx)
  
  const numerator = virtualToken.mul(solAmount);
  const denominator = virtualSol.add(solAmount);
  const tokenAmount = numerator.div(denominator);
  
  return tokenAmount;
}

// Calculate sell amount (SOL out for tokens in)
export function calculateSellAmount(
  bondingCurve: BondingCurveAccount,
  tokenAmount: BN
): BN {
  const virtualSol = bondingCurve.virtualSolReserves;
  const virtualToken = bondingCurve.virtualTokenReserves;
  
  // Constant product formula
  // dx = x * dy / (y + dy)
  
  const numerator = virtualSol.mul(tokenAmount);
  const denominator = virtualToken.add(tokenAmount);
  const solAmount = numerator.div(denominator);
  
  return solAmount;
}

// Calculate with slippage
export function calculateWithSlippage(amount: BN, slippageBps: number, isBuy: boolean): BN {
  const slippageMultiplier = new BN(10000 + (isBuy ? slippageBps : -slippageBps));
  return amount.mul(slippageMultiplier).div(new BN(10000));
}

// Fetch bonding curve data
export async function fetchBondingCurve(
  connection: Connection,
  mint: PublicKey
): Promise<BondingCurveAccount | null> {
  const bondingCurvePDA = getBondingCurvePDA(mint);
  
  try {
    const accountInfo = await connection.getAccountInfo(bondingCurvePDA);
    if (!accountInfo) return null;
    
    return parseBondingCurveAccount(accountInfo.data);
  } catch (error) {
    console.error('Error fetching bonding curve:', error);
    return null;
  }
}

// Create instruction discriminator
function createDiscriminator(instructionName: string): Buffer {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  hash.update(`global:${instructionName}`);
  return Buffer.from(hash.digest().slice(0, 8));
}

// Build create token instruction data
export function buildCreateInstructionData(
  name: string,
  symbol: string,
  uri: string
): Buffer {
  const discriminator = Buffer.from([24, 30, 200, 40, 5, 28, 7, 119]); // 'create' discriminator
  
  const nameBuffer = Buffer.from(name, 'utf8');
  const symbolBuffer = Buffer.from(symbol, 'utf8');
  const uriBuffer = Buffer.from(uri, 'utf8');
  
  // Borsh serialization
  const nameLenBuffer = Buffer.alloc(4);
  nameLenBuffer.writeUInt32LE(nameBuffer.length);
  
  const symbolLenBuffer = Buffer.alloc(4);
  symbolLenBuffer.writeUInt32LE(symbolBuffer.length);
  
  const uriLenBuffer = Buffer.alloc(4);
  uriLenBuffer.writeUInt32LE(uriBuffer.length);
  
  return Buffer.concat([
    discriminator,
    nameLenBuffer,
    nameBuffer,
    symbolLenBuffer,
    symbolBuffer,
    uriLenBuffer,
    uriBuffer,
  ]);
}

// Build buy instruction data
export function buildBuyInstructionData(amount: BN, maxSolCost: BN): Buffer {
  const discriminator = Buffer.from([102, 6, 61, 18, 1, 218, 235, 234]); // 'buy' discriminator
  
  const amountBuffer = Buffer.alloc(8);
  amountBuffer.writeBigUInt64LE(BigInt(amount.toString()));
  
  const maxSolCostBuffer = Buffer.alloc(8);
  maxSolCostBuffer.writeBigUInt64LE(BigInt(maxSolCost.toString()));
  
  return Buffer.concat([discriminator, amountBuffer, maxSolCostBuffer]);
}

// Build sell instruction data
export function buildSellInstructionData(amount: BN, minSolOutput: BN): Buffer {
  const discriminator = Buffer.from([51, 230, 133, 164, 1, 127, 131, 173]); // 'sell' discriminator
  
  const amountBuffer = Buffer.alloc(8);
  amountBuffer.writeBigUInt64LE(BigInt(amount.toString()));
  
  const minSolOutputBuffer = Buffer.alloc(8);
  minSolOutputBuffer.writeBigUInt64LE(BigInt(minSolOutput.toString()));
  
  return Buffer.concat([discriminator, amountBuffer, minSolOutputBuffer]);
}

// Format token amount for display
export function formatTokenAmount(amount: BN | number, decimals: number = TOKEN_DECIMALS): string {
  const num = typeof amount === 'number' ? amount : amount.toNumber();
  const value = num / Math.pow(10, decimals);
  
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2) + 'B';
  } else if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + 'M';
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(2) + 'K';
  }
  return value.toFixed(2);
}

// Format SOL amount
export function formatSolAmount(lamports: BN | number): string {
  const num = typeof lamports === 'number' ? lamports : lamports.toNumber();
  const sol = num / LAMPORTS_PER_SOL;
  
  if (sol >= 1000) {
    return sol.toFixed(0);
  } else if (sol >= 1) {
    return sol.toFixed(2);
  } else if (sol >= 0.01) {
    return sol.toFixed(4);
  }
  return sol.toFixed(6);
}

// Shorten address for display
export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Generate random color for token avatar
export function generateTokenColor(mint: string): string {
  let hash = 0;
  for (let i = 0; i < mint.length; i++) {
    const char = mint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const colors = [
    '#22c55e', '#3b82f6', '#a855f7', '#ec4899',
    '#f97316', '#eab308', '#06b6d4', '#ef4444',
  ];
  
  return colors[Math.abs(hash) % colors.length];
}
