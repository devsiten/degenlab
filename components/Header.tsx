'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  Rocket, 
  TrendingUp, 
  Plus, 
  Menu, 
  X, 
  Zap,
  BarChart3,
  Wallet
} from 'lucide-react';

export const Header: FC = () => {
  const { connected } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-purple rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-cyan rounded-full animate-pulse" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              DegenLab
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </Link>
            <Link 
              href="/create" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </Link>
            <Link 
              href="/#how-it-works" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>How it Works</span>
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Create Button - Desktop */}
            <Link 
              href="/create"
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-4 py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Token</span>
            </Link>

            {/* Wallet Button */}
            <WalletMultiButton className="!bg-dark-100 !border !border-white/10 !rounded-xl !h-10 !font-semibold hover:!bg-dark-200 hover:!border-white/20 transition-all" />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-white/5">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Trending</span>
            </Link>
            <Link
              href="/create"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create Token</span>
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <Zap className="w-5 h-5" />
              <span>How it Works</span>
            </Link>

            {/* Mobile Create Button */}
            <Link
              href="/create"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-4 py-3 rounded-xl mt-4"
            >
              <Rocket className="w-5 h-5" />
              <span>Launch Token</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
