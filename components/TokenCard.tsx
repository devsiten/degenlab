'use client';

import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, TrendingDown, Users, Clock, Zap } from 'lucide-react';
import { TokenData } from '@/lib/store';
import { formatSolAmount, shortenAddress, generateTokenColor } from '@/lib/pumpfun';

interface TokenCardProps {
  token: TokenData;
}

export const TokenCard: FC<TokenCardProps> = ({ token }) => {
  const priceChange = Math.random() > 0.5 ? Math.random() * 100 : -Math.random() * 50;
  const isPriceUp = priceChange >= 0;
  
  // Calculate time ago
  const timeAgo = getTimeAgo(token.createdAt);
  
  return (
    <Link href={`/token/${token.mint}`}>
      <div className="glass rounded-2xl p-4 card-hover cursor-pointer group">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Token Image */}
          <div className="relative">
            {token.image ? (
              <Image
                src={token.image}
                alt={token.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: generateTokenColor(token.mint) }}
              >
                {token.symbol.slice(0, 2).toUpperCase()}
              </div>
            )}
            {/* Live indicator */}
            {!token.isGraduated && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
            )}
          </div>

          {/* Token Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white truncate group-hover:text-primary-400 transition-colors">
                {token.name}
              </h3>
              {token.isGraduated && (
                <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs font-medium rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  DEX
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm">${token.symbol}</p>
          </div>

          {/* Price Change */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            isPriceUp ? 'bg-primary-500/20 text-primary-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isPriceUp ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="text-xs font-medium">
              {isPriceUp ? '+' : ''}{priceChange.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Progress Bar (for bonding curve) */}
        {!token.isGraduated && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">Bonding Curve</span>
              <span className="text-primary-400 font-medium">{token.progress.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-dark-300 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan rounded-full transition-all duration-500"
                style={{ width: `${Math.min(token.progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="bg-dark-300/50 rounded-lg p-2 text-center">
            <p className="text-gray-400 text-xs">Market Cap</p>
            <p className="text-white font-semibold text-sm">
              {formatSolAmount(token.marketCap * 1e9)} SOL
            </p>
          </div>
          <div className="bg-dark-300/50 rounded-lg p-2 text-center">
            <p className="text-gray-400 text-xs">Volume 24h</p>
            <p className="text-white font-semibold text-sm">
              {formatSolAmount(token.volume24h * 1e9)} SOL
            </p>
          </div>
          <div className="bg-dark-300/50 rounded-lg p-2 text-center">
            <p className="text-gray-400 text-xs">Created</p>
            <p className="text-white font-semibold text-sm">{timeAgo}</p>
          </div>
        </div>

        {/* Creator */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-400">
            <Users className="w-3 h-3" />
            <span>Created by</span>
            <span className="text-primary-400 font-medium">
              {shortenAddress(token.creator)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Helper function to get time ago string
function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

// Loading skeleton
export const TokenCardSkeleton: FC = () => {
  return (
    <div className="glass rounded-2xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-dark-300 rounded-xl" />
        <div className="flex-1">
          <div className="h-5 bg-dark-300 rounded w-24 mb-2" />
          <div className="h-4 bg-dark-300 rounded w-16" />
        </div>
        <div className="h-6 bg-dark-300 rounded w-16" />
      </div>
      <div className="mt-4">
        <div className="h-2 bg-dark-300 rounded-full" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="h-14 bg-dark-300 rounded-lg" />
        <div className="h-14 bg-dark-300 rounded-lg" />
        <div className="h-14 bg-dark-300 rounded-lg" />
      </div>
    </div>
  );
};
