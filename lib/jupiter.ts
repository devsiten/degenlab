import { Connection, PublicKey, VersionedTransaction, TransactionMessage, AddressLookupTableAccount } from '@solana/web3.js';
import { JUPITER_QUOTE_API, JUPITER_SWAP_API, SOL_MINT } from './constants';

export interface QuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: RoutePlan[];
  contextSlot: number;
  timeTaken: number;
}

export interface RoutePlan {
  swapInfo: {
    ammKey: string;
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
  };
  percent: number;
}

export interface SwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
}

// Get swap quote from Jupiter
export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50,
  swapMode: 'ExactIn' | 'ExactOut' = 'ExactIn'
): Promise<QuoteResponse | null> {
  try {
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippageBps.toString(),
      swapMode,
    });

    const response = await fetch(`${JUPITER_QUOTE_API}/quote?${params}`);
    
    if (!response.ok) {
      throw new Error(`Jupiter quote error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting Jupiter quote:', error);
    return null;
  }
}

// Get swap transaction from Jupiter
export async function getJupiterSwapTransaction(
  quoteResponse: QuoteResponse,
  userPublicKey: string,
  wrapAndUnwrapSol: boolean = true,
  feeAccount?: string,
  platformFeeBps?: number
): Promise<SwapResponse | null> {
  try {
    const body: Record<string, unknown> = {
      quoteResponse,
      userPublicKey,
      wrapAndUnwrapSol,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: 'auto',
    };

    // Add platform fee if provided
    if (feeAccount && platformFeeBps) {
      body.feeAccount = feeAccount;
      body.platformFeeBps = platformFeeBps;
    }

    const response = await fetch(JUPITER_SWAP_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Jupiter swap error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting Jupiter swap transaction:', error);
    return null;
  }
}

// Deserialize and prepare transaction for signing
export async function prepareJupiterTransaction(
  connection: Connection,
  swapResponse: SwapResponse
): Promise<VersionedTransaction> {
  const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, 'base64');
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
  
  return transaction;
}

// Execute full Jupiter swap flow
export async function executeJupiterSwap(
  connection: Connection,
  inputMint: string,
  outputMint: string,
  amount: number,
  userPublicKey: PublicKey,
  slippageBps: number = 50,
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>
): Promise<string | null> {
  try {
    // 1. Get quote
    const quote = await getJupiterQuote(inputMint, outputMint, amount, slippageBps);
    if (!quote) throw new Error('Failed to get quote');

    // 2. Get swap transaction
    const swapResponse = await getJupiterSwapTransaction(
      quote,
      userPublicKey.toString()
    );
    if (!swapResponse) throw new Error('Failed to get swap transaction');

    // 3. Prepare and sign transaction
    const transaction = await prepareJupiterTransaction(connection, swapResponse);
    const signedTransaction = await signTransaction(transaction);

    // 4. Send transaction
    const rawTransaction = signedTransaction.serialize();
    const signature = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 3,
    });

    // 5. Confirm transaction
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: swapResponse.lastValidBlockHeight,
    });

    return signature;
  } catch (error) {
    console.error('Error executing Jupiter swap:', error);
    return null;
  }
}

// Get token price in SOL via Jupiter
export async function getTokenPriceInSol(tokenMint: string): Promise<number | null> {
  try {
    // Get quote for 1 token -> SOL
    const quote = await getJupiterQuote(
      tokenMint,
      SOL_MINT.toString(),
      1_000_000, // 1 token with 6 decimals
      100,
      'ExactIn'
    );

    if (!quote) return null;

    // outAmount is in lamports
    const solAmount = parseInt(quote.outAmount) / 1e9;
    return solAmount;
  } catch (error) {
    console.error('Error getting token price:', error);
    return null;
  }
}

// Get SOL price in USD (via USDC)
export async function getSolPriceUsd(): Promise<number | null> {
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
  
  try {
    const quote = await getJupiterQuote(
      SOL_MINT.toString(),
      USDC_MINT,
      1_000_000_000, // 1 SOL in lamports
      100,
      'ExactIn'
    );

    if (!quote) return null;

    // USDC has 6 decimals
    const usdAmount = parseInt(quote.outAmount) / 1e6;
    return usdAmount;
  } catch (error) {
    console.error('Error getting SOL price:', error);
    return null;
  }
}

// Format price impact
export function formatPriceImpact(priceImpactPct: string): string {
  const impact = parseFloat(priceImpactPct);
  if (impact < 0.01) return '<0.01%';
  if (impact < 1) return `${impact.toFixed(2)}%`;
  return `${impact.toFixed(1)}%`;
}

// Get route labels for display
export function getRouteLabels(routePlan: RoutePlan[]): string[] {
  return routePlan.map(route => route.swapInfo.label);
}
