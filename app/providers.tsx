'use client';

import { FC, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletContextProvider, Header, Notifications } from '@/components';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletContextProvider>
        <div className="min-h-screen bg-dark-400">
          <Header />
          <main className="pt-16">{children}</main>
          <Notifications />
        </div>
      </WalletContextProvider>
    </QueryClientProvider>
  );
};
