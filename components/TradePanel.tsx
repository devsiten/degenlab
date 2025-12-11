'use client';

import { FC, useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import BN from 'bn.js';
import { 
  ArrowUpDown, 
  Loader2, 
  Settings, 
  Info,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';
import { TokenData, useAppStore } from '@/lib/store';
import {
  getBondingCurvePDA,
  getGlobalPDA,
  getEventAuthorityPDA,
  calculateBuyAmount,
  calculateSellAmount,
  calculateWithSlippage,
  buildBuyInstructionData,
  buildSellInstructionData,
  formatSolAmount,
  formatTokenAmount,
  BondingCurveAccount,
} from '@/lib/pumpfun';
import {
  PUMP_PROGRAM_ID,
  PUMP_FEE_RECIPIENT,
  TOKEN_DECIMALS,
} from '@/lib/constants';

interface TradePanelProps {
  token: TokenData;
  bondingCurve: BondingCurveAccount | null;
  onTradeComplete?: () => void;
}

type TradeMode = 'buy' | 'sell';

const QUICK_AMOUNTS = [0.1, 0.5, 1, 5];

export const TradePanel: FC<TradePanelProps> = ({ token, bondingCurve, onTradeComplete }) => {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { slippage, setSlippage, addNotification } = useAppStore();

  const [mode, setMode] = useState<TradeMode>('buy');
  const [amount, setAmount] = useState<string>('');
  const [estimatedOutput, setEstimatedOutput] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [tokenBalance, setTokenBalance] = useState<number>(0);

  // Fetch balances
  useEffect(() => {
    if (!connected || !publicKey || !connection) return;

    const fetchBalances = async () => {
      try {
        const balance = await connection.getBalance(publicKey);
        setSolBalance(balance / LAMPORTS_PER_SOL);

        const tokenMint = new PublicKey(token.mint);
        const ata = await getAssociatedTokenAddress(tokenMint, publicKey);
        
        try {
          const tokenAccount = await connection.getTokenAccountBalance(ata);
          setTokenBalance(parseFloat(tokenAccount.value.uiAmountString || '0'));
        } catch {
          setTokenBalance(0);
        }
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [connected, publicKey, connection, token.mint]);

  // Calculate estimated output
  useEffect(() => {
    if (!amount || !bondingCurve || parseFloat(amount) === 0) {
      setEstimatedOutput('0');
      return;
    }

    const inputAmount = parseFloat(amount);
    
    if (mode === 'buy') {
      const solLamports = new BN(Math.floor(inputAmount * LAMPORTS_PER_SOL));
      const tokenOut = calculateBuyAmount(bondingCurve, solLamports);
      setEstimatedOutput(formatTokenAmount(tokenOut));
    } else {
      const tokenLamports = new BN(Math.floor(inputAmount * Math.pow(10, TOKEN_DECIMALS)));
      const solOut = calculateSellAmount(bondingCurve, tokenLamports);
      setEstimatedOutput(formatSolAmount(solOut));
    }
  }, [amount, mode, bondingCurve]);

  const handleTrade = async () => {
    if (!connected || !publicKey || !signTransaction || !bondingCurve) {
      addNotification({
        type: 'error',
        title: 'Wallet not connected',
        message: 'Please connect your wallet to trade',
      });
      return;
    }

    if (!amount || parseFloat(amount) === 0) {
      addNotification({
        type: 'error',
        title: 'Invalid amount',
        message: 'Please enter a valid amount',
      });
      return;
    }

    setIsLoading(true);

    try {
      const tokenMint = new PublicKey(token.mint);
      const bondingCurvePDA = getBondingCurvePDA(tokenMint);
      const globalPDA = getGlobalPDA();
      const eventAuthority = getEventAuthorityPDA();
      
      const userATA = await getAssociatedTokenAddress(tokenMint, publicKey);
      const bondingCurveATA = await getAssociatedTokenAddress(tokenMint, bondingCurvePDA, true);

      const transaction = new Transaction();

      try {
        await connection.getTokenAccountBalance(userATA);
      } catch {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            userATA,
            publicKey,
            tokenMint
          )
        );
      }

      if (mode === 'buy') {
        const solAmount = new BN(Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL));
        const expectedTokens = calculateBuyAmount(bondingCurve, solAmount);
        const maxSolCost = calculateWithSlippage(solAmount, slippage * 100, true);

        const instructionData = buildBuyInstructionData(expectedTokens, maxSolCost);

        transaction.add({
          programId: PUMP_PROGRAM_ID,
          keys: [
            { pubkey: globalPDA, isSigner: false, isWritable: false },
            { pubkey: PUMP_FEE_RECIPIENT, isSigner: false, isWritable: true },
            { pubkey: tokenMint, isSigner: false, isWritable: false },
            { pubkey: bondingCurvePDA, isSigner: false, isWritable: true },
            { pubkey: bondingCurveATA, isSigner: false, isWritable: true },
            { pubkey: userATA, isSigner: false, isWritable: true },
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
            { pubkey: eventAuthority, isSigner: false, isWritable: false },
            { pubkey: PUMP_PROGRAM_ID, isSigner: false, isWritable: false },
          ],
          data: instructionData,
        });
      } else {
        const tokenAmount = new BN(Math.floor(parseFloat(amount) * Math.pow(10, TOKEN_DECIMALS)));
        const expectedSol = calculateSellAmount(bondingCurve, tokenAmount);
        const minSolOutput = calculateWithSlippage(expectedSol, slippage * 100, false);

        const instructionData = buildSellInstructionData(tokenAmount, minSolOutput);

        transaction.add({
          programId: PUMP_PROGRAM_ID,
          keys: [
            { pubkey: globalPDA, isSigner: false, isWritable: false },
            { pubkey: PUMP_FEE_RECIPIENT, isSigner: false, isWritable: true },
            { pubkey: tokenMint, isSigner: false, isWritable: false },
            { pubkey: bondingCurvePDA, isSigner: false, isWritable: true },
            { pubkey: bondingCurveATA, isSigner: false, isWritable: true },
            { pubkey: userATA, isSigner: false, isWritable: true },
            { pubkey: publicKey, isSigner: true, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: eventAuthority, isSigner: false, isWritable: false },
            { pubkey: PUMP_PROGRAM_ID, isSigner: false, isWritable: false },
          ],
          data: instructionData,
        });
      }

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: true,
      });

      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      addNotification({
        type: 'success',
        title: `${mode === 'buy' ? 'Buy' : 'Sell'} Successful!`,
        message: `Transaction confirmed`,
        txSignature: signature,
      });

      setAmount('');
      onTradeComplete?.();
    } catch (error: any) {
      console.error('Trade error:', error);
      addNotification({
        type: 'error',
        title: 'Transaction Failed',
        message: error.message || 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-dark-300 rounded-xl mb-4">
        <button
          onClick={() => setMode('buy')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
            mode === 'buy'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Buy
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
            mode === 'sell'
              ? 'bg-red-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Sell
        </button>
      </div>

      {/* Amount Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-400">
            {mode === 'buy' ? 'You Pay (SOL)' : `You Sell (${token.symbol})`}
          </label>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Slippage Settings */}
        {showSettings && (
          <div className="bg-dark-300 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Slippage Tolerance</span>
              <div className="flex items-center gap-2">
                {[5, 10, 15, 25].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlippage(s)}
                    className={`px-2 py-1 text-xs rounded-lg transition-all ${
                      slippage === s
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-200 text-gray-400 hover:text-white'
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Field */}
        <div className="bg-dark-300 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-2xl font-bold text-white outline-none"
            />
            <div className="flex items-center gap-2 px-3 py-2 bg-dark-200 rounded-lg">
              {mode === 'buy' ? (
                <>
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full" />
                  <span className="font-medium">SOL</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {token.symbol.slice(0, 1)}
                  </div>
                  <span className="font-medium">{token.symbol}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Balance */}
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-gray-400">
              Balance: {mode === 'buy' ? solBalance.toFixed(4) : tokenBalance.toFixed(2)} {mode === 'buy' ? 'SOL' : token.symbol}
            </span>
            <button
              onClick={() => setAmount(mode === 'buy' ? solBalance.toFixed(4) : tokenBalance.toString())}
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Quick Amounts */}
        {mode === 'buy' && (
          <div className="flex gap-2">
            {QUICK_AMOUNTS.map((qa) => (
              <button
                key={qa}
                onClick={() => setAmount(qa.toString())}
                className="flex-1 py-2 bg-dark-300 hover:bg-dark-200 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-all"
              >
                {qa} SOL
              </button>
            ))}
          </div>
        )}

        {/* Arrow Divider */}
        <div className="flex items-center justify-center">
          <div className="p-2 bg-dark-300 rounded-lg">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Output Display */}
        <div className="bg-dark-300 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">
                {mode === 'buy' ? `You Receive (${token.symbol})` : 'You Receive (SOL)'}
              </p>
              <p className="text-2xl font-bold text-white">{estimatedOutput}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-dark-200 rounded-lg">
              {mode === 'buy' ? (
                <>
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {token.symbol.slice(0, 1)}
                  </div>
                  <span className="font-medium">{token.symbol}</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full" />
                  <span className="font-medium">SOL</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Trade Info */}
        <div className="bg-dark-300/50 rounded-xl p-3 space-y-2 text-sm">
          <div className="flex items-center justify-between text-gray-400">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3" />
              Slippage
            </span>
            <span>{slippage}%</span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Trading Fee</span>
            <span>1%</span>
          </div>
        </div>

        {/* Trade Button */}
        {connected ? (
          <button
            onClick={handleTrade}
            disabled={isLoading || !amount || parseFloat(amount) === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              mode === 'buy'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white disabled:opacity-50'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white disabled:opacity-50'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                {mode === 'buy' ? 'Buy' : 'Sell'} {token.symbol}
              </>
            )}
          </button>
        ) : (
          <WalletMultiButton className="!w-full !justify-center !py-4 !rounded-xl !font-bold !text-lg" />
        )}
      </div>
    </div>
  );
};
