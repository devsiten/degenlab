'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  Users,
  BarChart3,
  Twitter,
  Globe,
  MessageCircle,
  Zap,
  Share2
} from 'lucide-react';
import { TradePanel } from '@/components';
import { TokenData, useAppStore } from '@/lib/store';
import {
  fetchBondingCurve,
  calculateTokenPrice,
  calculateMarketCap,
  calculateProgress,
  shortenAddress,
  generateTokenColor,
  formatSolAmount,
  BondingCurveAccount,
} from '@/lib/pumpfun';

export default function TokenPage() {
  const params = useParams();
  const mint = params.mint as string;
  const { connection } = useConnection();
  const { addNotification } = useAppStore();

  const [token, setToken] = useState<TokenData | null>(null);
  const [bondingCurve, setBondingCurve] = useState<BondingCurveAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTokenData = async () => {
      setIsLoading(true);
      try {
        const mintPubkey = new PublicKey(mint);
        const curveData = await fetchBondingCurve(connection, mintPubkey);
        
        if (curveData) {
          setBondingCurve(curveData);
          
          const tokenData: TokenData = {
            mint,
            name: 'Token',
            symbol: 'TKN',
            image: '',
            creator: 'Unknown',
            marketCap: calculateMarketCap(curveData),
            price: calculateTokenPrice(curveData),
            volume24h: 0,
            progress: calculateProgress(curveData),
            isGraduated: curveData.complete,
            createdAt: Date.now(),
          };
          setToken(tokenData);
        } else {
          setToken({
            mint,
            name: 'Demo Token',
            symbol: 'DEMO',
            image: '',
            description: 'This is a demo token for testing purposes.',
            creator: '9AhKqLR67hwapvG8SA2JFXaCshXc9nALJjpKaHZrsbkw',
            marketCap: 25.5,
            price: 0.0000045,
            volume24h: 8.3,
            progress: 45,
            isGraduated: false,
            createdAt: Date.now() - 3600000,
            twitter: 'https://twitter.com',
            telegram: 'https://t.me',
            website: 'https://example.com',
          });
        }
      } catch (error) {
        console.error('Error fetching token:', error);
        setToken({
          mint,
          name: 'Demo Token',
          symbol: 'DEMO',
          image: '',
          description: 'This is a demo token.',
          creator: '9AhKqLR67hwapvG8SA2JFXaCshXc9nALJjpKaHZrsbkw',
          marketCap: 25.5,
          price: 0.0000045,
          volume24h: 8.3,
          progress: 45,
          isGraduated: false,
          createdAt: Date.now() - 3600000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (mint) {
      fetchTokenData();
    }
  }, [mint, connection]);

  const copyAddress = () => {
    navigator.clipboard.writeText(mint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addNotification({
      type: 'success',
      title: 'Copied!',
      message: 'Token address copied to clipboard',
    });
  };

  const handleTradeComplete = async () => {
    try {
      const mintPubkey = new PublicKey(mint);
      const curveData = await fetchBondingCurve(connection, mintPubkey);
      if (curveData) {
        setBondingCurve(curveData);
        setToken((prev) =>
          prev
            ? {
                ...prev,
                marketCap: calculateMarketCap(curveData),
                price: calculateTokenPrice(curveData),
                progress: calculateProgress(curveData),
                isGraduated: curveData.complete,
              }
            : null
        );
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-dark-300 rounded w-32" />
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-dark-300 rounded-2xl" />
                <div className="h-48 bg-dark-300 rounded-2xl" />
              </div>
              <div className="h-96 bg-dark-300 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Token Not Found</h2>
          <p className="text-gray-400 mb-4">This token does not exist or has not been created yet.</p>
          <Link href="/" className="text-primary-400 hover:text-primary-300">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Token Header */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-start gap-4">
                {token.image ? (
                  <Image
                    src={token.image}
                    alt={token.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-2xl object-cover"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                    style={{ backgroundColor: generateTokenColor(token.mint) }}
                  >
                    {token.symbol.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold">{token.name}</h1>
                    <span className="text-gray-400">${token.symbol}</span>
                    {token.isGraduated && (
                      <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs font-medium rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Graduated
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-sm text-gray-400 bg-dark-300 px-2 py-1 rounded">
                      {shortenAddress(token.mint, 8)}
                    </code>
                    <button
                      onClick={copyAddress}
                      className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-primary-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <a
                      href={`https://solscan.io/token/${token.mint}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {token.twitter && (
                      <a
                        href={token.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-dark-300 hover:bg-dark-200 rounded-lg transition-colors"
                      >
                        <Twitter className="w-4 h-4 text-blue-400" />
                      </a>
                    )}
                    {token.telegram && (
                      <a
                        href={token.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-dark-300 hover:bg-dark-200 rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                      </a>
                    )}
                    {token.website && (
                      <a
                        href={token.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-dark-300 hover:bg-dark-200 rounded-lg transition-colors"
                      >
                        <Globe className="w-4 h-4 text-primary-400" />
                      </a>
                    )}
                    <button className="p-2 bg-dark-300 hover:bg-dark-200 rounded-lg transition-colors ml-auto">
                      <Share2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {token.description && (
                <p className="text-gray-400 mt-4">{token.description}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Market Cap</span>
                </div>
                <p className="text-xl font-bold">{formatSolAmount(token.marketCap * 1e9)} SOL</p>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Price</span>
                </div>
                <p className="text-xl font-bold">{token.price.toFixed(10)} SOL</p>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Volume 24h</span>
                </div>
                <p className="text-xl font-bold">{formatSolAmount(token.volume24h * 1e9)} SOL</p>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Creator</span>
                </div>
                <p className="text-sm font-medium text-primary-400">
                  {shortenAddress(token.creator)}
                </p>
              </div>
            </div>

            {/* Bonding Curve Progress */}
            {!token.isGraduated && (
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Bonding Curve Progress</h3>
                  <span className="text-primary-400 font-bold">{token.progress.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-dark-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(token.progress, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  When the bonding curve reaches 100%, the token will graduate to PumpSwap DEX for open market trading.
                </p>
              </div>
            )}

            {/* Chart Placeholder */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Price Chart</h3>
              <div className="h-64 bg-dark-300 rounded-xl flex items-center justify-center">
                <p className="text-gray-500">Chart coming soon</p>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Recent Trades</h3>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        i % 2 === 0 ? 'bg-primary-500/20' : 'bg-red-500/20'
                      }`}>
                        <TrendingUp className={`w-4 h-4 ${
                          i % 2 === 0 ? 'text-primary-400' : 'text-red-400 rotate-180'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{i % 2 === 0 ? 'Buy' : 'Sell'}</p>
                        <p className="text-sm text-gray-400">{shortenAddress('9AhKqLR67hwapvG8SA2JFXaCshXc9nALJjpKaHZrsbkw')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{(Math.random() * 10).toFixed(2)} SOL</p>
                      <p className="text-sm text-gray-400">{i}m ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Trade Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <TradePanel
                token={token}
                bondingCurve={bondingCurve}
                onTradeComplete={handleTradeComplete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
