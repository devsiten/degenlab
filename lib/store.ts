import { create } from 'zustand';
import { Connection, PublicKey } from '@solana/web3.js';
import { BondingCurveAccount } from './pumpfun';

// Token data interface
export interface TokenData {
  mint: string;
  name: string;
  symbol: string;
  image: string;
  description?: string;
  creator: string;
  bondingCurve?: BondingCurveAccount;
  marketCap: number;
  price: number;
  volume24h: number;
  progress: number;
  isGraduated: boolean;
  createdAt: number;
  twitter?: string;
  telegram?: string;
  website?: string;
}

// Trade data interface
export interface TradeData {
  signature: string;
  mint: string;
  type: 'buy' | 'sell';
  solAmount: number;
  tokenAmount: number;
  trader: string;
  timestamp: number;
  price: number;
}

// App state interface
interface AppState {
  // Connection
  connection: Connection | null;
  setConnection: (connection: Connection) => void;

  // Tokens
  tokens: TokenData[];
  setTokens: (tokens: TokenData[]) => void;
  addToken: (token: TokenData) => void;
  updateToken: (mint: string, updates: Partial<TokenData>) => void;

  // Selected token
  selectedToken: TokenData | null;
  setSelectedToken: (token: TokenData | null) => void;

  // Trades
  trades: TradeData[];
  setTrades: (trades: TradeData[]) => void;
  addTrade: (trade: TradeData) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Filters
  sortBy: 'newest' | 'marketCap' | 'volume' | 'progress';
  setSortBy: (sort: 'newest' | 'marketCap' | 'volume' | 'progress') => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Trading
  slippage: number;
  setSlippage: (slippage: number) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  txSignature?: string;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Connection
  connection: null,
  setConnection: (connection) => set({ connection }),

  // Tokens
  tokens: [],
  setTokens: (tokens) => set({ tokens }),
  addToken: (token) => set((state) => ({ 
    tokens: [token, ...state.tokens] 
  })),
  updateToken: (mint, updates) => set((state) => ({
    tokens: state.tokens.map((t) => 
      t.mint === mint ? { ...t, ...updates } : t
    ),
  })),

  // Selected token
  selectedToken: null,
  setSelectedToken: (token) => set({ selectedToken: token }),

  // Trades
  trades: [],
  setTrades: (trades) => set({ trades }),
  addTrade: (trade) => set((state) => ({
    trades: [trade, ...state.trades].slice(0, 100), // Keep last 100 trades
  })),

  // UI state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Filters
  sortBy: 'newest',
  setSortBy: (sort) => set({ sortBy: sort }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Trading
  slippage: 10, // 10% default for memecoins
  setSlippage: (slippage) => set({ slippage }),

  // Notifications
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [
      ...state.notifications,
      { ...notification, id: Math.random().toString(36).slice(2) },
    ],
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
}));

// Selector hooks for common patterns
export const useTokens = () => useAppStore((state) => state.tokens);
export const useSelectedToken = () => useAppStore((state) => state.selectedToken);
export const useTrades = () => useAppStore((state) => state.trades);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useSlippage = () => useAppStore((state) => state.slippage);
export const useNotifications = () => useAppStore((state) => state.notifications);

// Get filtered and sorted tokens
export const useFilteredTokens = () => {
  const tokens = useAppStore((state) => state.tokens);
  const sortBy = useAppStore((state) => state.sortBy);
  const searchQuery = useAppStore((state) => state.searchQuery);

  let filtered = tokens;

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.symbol.toLowerCase().includes(query) ||
        t.mint.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  switch (sortBy) {
    case 'newest':
      filtered = [...filtered].sort((a, b) => b.createdAt - a.createdAt);
      break;
    case 'marketCap':
      filtered = [...filtered].sort((a, b) => b.marketCap - a.marketCap);
      break;
    case 'volume':
      filtered = [...filtered].sort((a, b) => b.volume24h - a.volume24h);
      break;
    case 'progress':
      filtered = [...filtered].sort((a, b) => b.progress - a.progress);
      break;
  }

  return filtered;
};
