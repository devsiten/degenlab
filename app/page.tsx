'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Rocket, 
  TrendingUp, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight,
  Sparkles,
  BarChart3,
  Clock,
  Filter
} from 'lucide-react';
import { TokenCard, TokenCardSkeleton } from '@/components';
import { TokenData, useAppStore, useFilteredTokens } from '@/lib/store';

// Mock data for demo - in production, fetch from your backend
const MOCK_TOKENS: TokenData[] = [
  {
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    name: 'Bonk',
    symbol: 'BONK',
    image: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
    description: 'The first Solana dog coin',
    creator: '9AhKqLR67hwapvG8SA2JFXaCshXc9nALJjpKaHZrsbkw',
    marketCap: 45.5,
    price: 0.0000023,
    volume24h: 12.3,
    progress: 100,
    isGraduated: true,
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    name: 'Moon Cat',
    symbol: 'MCAT',
    image: '',
    description: 'To the moon!',
    creator: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    marketCap: 23.4,
    price: 0.000045,
    volume24h: 5.6,
    progress: 67,
    isGraduated: false,
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    mint: 'So11111111111111111111111111111111111111112',
    name: 'Degen Pepe',
    symbol: 'DPEPE',
    image: '',
    description: 'The most degen Pepe',
    creator: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    marketCap: 15.2,
    price: 0.000012,
    volume24h: 8.9,
    progress: 45,
    isGraduated: false,
    createdAt: Date.now() - 3600000,
  },
  {
    mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    name: 'Solana Shiba',
    symbol: 'SSHIB',
    image: '',
    description: 'Shiba on Solana',
    creator: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    marketCap: 8.7,
    price: 0.0000067,
    volume24h: 3.2,
    progress: 28,
    isGraduated: false,
    createdAt: Date.now() - 1800000,
  },
];

export default function HomePage() {
  const { setTokens, sortBy, setSortBy, searchQuery, setSearchQuery } = useAppStore();
  const filteredTokens = useFilteredTokens();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setTokens(MOCK_TOKENS);
      setIsLoading(false);
    }, 1000);
  }, [setTokens]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-400 font-medium">
              #1 Memecoin Launchpad on Solana
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Launch Your</span>
            <br />
            <span className="text-white">Memecoin in Seconds</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Create, trade, and discover the hottest memecoins on Solana. 
            No coding required. Fair launch guaranteed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/create"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-lg rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5"
            >
              <Rocket className="w-5 h-5" />
              Launch Token
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#tokens"
              className="flex items-center gap-2 px-8 py-4 bg-dark-100 border border-white/10 hover:border-white/20 text-white font-bold text-lg rounded-xl transition-all"
            >
              <TrendingUp className="w-5 h-5" />
              Explore Tokens
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            {[
              { label: 'Tokens Created', value: '12,345' },
              { label: 'Total Volume', value: '$45.2M' },
              { label: 'Unique Traders', value: '89.5K' },
              { label: 'Graduated', value: '234' },
            ].map((stat, index) => (
              <div key={index} className="glass rounded-2xl p-4">
                <p className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Launch your memecoin in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Rocket className="w-8 h-8" />,
                title: 'Create Token',
                description: 'Upload your meme, pick a name and symbol. Your token launches instantly on a bonding curve.',
                color: 'from-primary-500 to-primary-600',
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Trade & Grow',
                description: 'Anyone can buy and sell on the bonding curve. Price increases as more people buy.',
                color: 'from-accent-cyan to-blue-500',
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Graduate to DEX',
                description: 'At ~$69K market cap, your token graduates to PumpSwap for open market trading.',
                color: 'from-accent-purple to-pink-500',
              },
            ].map((step, index) => (
              <div key={index} className="glass rounded-2xl p-6 card-hover">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-4`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-dark-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Shield className="w-6 h-6" />, title: 'Fair Launch', desc: 'No presales, no team tokens' },
              { icon: <Zap className="w-6 h-6" />, title: 'Instant', desc: 'Launch in under 10 seconds' },
              { icon: <Users className="w-6 h-6" />, title: 'Community', desc: 'Built for degens, by degens' },
              { icon: <BarChart3 className="w-6 h-6" />, title: 'Transparent', desc: 'All trades on-chain' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-4 p-4 glass rounded-xl">
                <div className="p-3 bg-primary-500/20 rounded-xl text-primary-400">
                  {feature.icon}
                </div>
                <div>
                  <p className="font-semibold">{feature.title}</p>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tokens Section */}
      <section id="tokens" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trending Tokens</h2>
              <p className="text-gray-400">Discover the hottest memecoins</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-10 py-2 bg-dark-300 rounded-xl border border-white/10 focus:border-primary-500 focus:outline-none w-48"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1 p-1 bg-dark-300 rounded-xl">
                {[
                  { value: 'newest', label: 'New', icon: <Clock className="w-4 h-4" /> },
                  { value: 'marketCap', label: 'Cap', icon: <BarChart3 className="w-4 h-4" /> },
                  { value: 'progress', label: 'Progress', icon: <TrendingUp className="w-4 h-4" /> },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      sortBy === option.value
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Token Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <TokenCardSkeleton key={i} />)
            ) : filteredTokens.length > 0 ? (
              filteredTokens.map((token) => <TokenCard key={token.mint} token={token} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400">No tokens found</p>
              </div>
            )}
          </div>

          {/* Load More */}
          {!isLoading && filteredTokens.length > 0 && (
            <div className="text-center mt-8">
              <button className="px-8 py-3 bg-dark-300 hover:bg-dark-200 rounded-xl font-semibold transition-colors">
                Load More
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-purple/10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Launch Your Token?
              </h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of creators who have launched successful memecoins on DegenLab
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-purple hover:from-primary-600 hover:to-accent-purple/90 text-white font-bold text-lg rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/25"
              >
                <Rocket className="w-5 h-5" />
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-purple rounded-lg flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">DegenLab</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2025 DegenLab. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Twitter
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Discord
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
