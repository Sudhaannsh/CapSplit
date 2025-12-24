import { createContext, useContext, ReactNode } from 'react';
import { useWalletData, DbWallet, DbActivity, DbTransaction } from '@/hooks/useWalletData';

interface WalletContextType {
  wallet: DbWallet | null;
  activities: DbActivity[];
  transactions: DbTransaction[];
  loading: boolean;
  balance: number;
  addMoney: (amount: number) => Promise<boolean>;
  withdrawMoney: (amount: number) => Promise<boolean>;
  addActivity: (data: {
    name: string;
    description?: string;
    targetBudget?: number;
    imageUrl?: string;
    isPaid?: boolean;
  }) => Promise<boolean>;
  deleteActivity: (activityId: string) => Promise<boolean>;
  updateActivity: (
    activityId: string,
    updates: { name?: string; description?: string; targetBudget?: number; imageUrl?: string }
  ) => Promise<boolean>;
  allocateToActivity: (activityId: string, amount: number) => Promise<boolean>;
  segregateMoney: (amount: number, activityIds: string[]) => Promise<boolean>;
  getUnallocatedBalance: () => number;
  getTotalAllocated: () => number;
  getActivityColor: (index: number) => string;
  getFreeActivityCount: () => number;
  refetch: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const walletData = useWalletData();

  return (
    <WalletContext.Provider value={walletData}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
