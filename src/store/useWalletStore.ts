import { create } from 'zustand';

export interface Activity {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  targetBudget: number;
  allocatedAmount: number;
  color: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'allocate' | 'deallocate';
  amount: number;
  activityId?: string;
  description: string;
  createdAt: Date;
}

interface WalletState {
  balance: number;
  activities: Activity[];
  transactions: Transaction[];
  
  // Actions
  addMoney: (amount: number) => void;
  withdrawMoney: (amount: number) => boolean;
  addActivity: (activity: Omit<Activity, 'id' | 'allocatedAmount' | 'createdAt'>) => void;
  deleteActivity: (id: string) => boolean;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  allocateToActivity: (activityId: string, amount: number) => boolean;
  segregateMoney: (amount: number, activityIds: string[]) => boolean;
  getUnallocatedBalance: () => number;
  getTotalAllocated: () => number;
}

const ACTIVITY_COLORS = [
  'hsl(160 60% 50%)',   // Emerald
  'hsl(199 89% 48%)',   // Sky blue
  'hsl(271 81% 56%)',   // Purple
  'hsl(25 95% 53%)',    // Orange
  'hsl(340 75% 55%)',   // Pink
  'hsl(45 93% 47%)',    // Yellow
];

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 0,
  activities: [],
  transactions: [],

  addMoney: (amount: number) => {
    const transaction: Transaction = {
      id: generateId(),
      type: 'deposit',
      amount,
      description: `Added ₹${amount.toLocaleString('en-IN')} to wallet`,
      createdAt: new Date(),
    };
    
    set((state) => ({
      balance: state.balance + amount,
      transactions: [transaction, ...state.transactions],
    }));
  },

  withdrawMoney: (amount: number) => {
    const { getUnallocatedBalance } = get();
    if (getUnallocatedBalance() < amount) return false;
    
    const transaction: Transaction = {
      id: generateId(),
      type: 'withdraw',
      amount,
      description: `Withdrew ₹${amount.toLocaleString('en-IN')} from wallet`,
      createdAt: new Date(),
    };
    
    set((state) => ({
      balance: state.balance - amount,
      transactions: [transaction, ...state.transactions],
    }));
    return true;
  },

  addActivity: (activity) => {
    const { activities } = get();
    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      allocatedAmount: 0,
      color: ACTIVITY_COLORS[activities.length % ACTIVITY_COLORS.length],
      createdAt: new Date(),
    };
    
    set((state) => ({
      activities: [...state.activities, newActivity],
    }));
  },

  deleteActivity: (id: string) => {
    const { activities } = get();
    const activity = activities.find(a => a.id === id);
    if (!activity) return false;
    
    // Can't delete if has allocated funds
    if (activity.allocatedAmount > 0) return false;
    
    set((state) => ({
      activities: state.activities.filter(a => a.id !== id),
    }));
    return true;
  },

  updateActivity: (id: string, updates: Partial<Activity>) => {
    set((state) => ({
      activities: state.activities.map(a => 
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
  },

  allocateToActivity: (activityId: string, amount: number) => {
    const { getUnallocatedBalance, activities } = get();
    const activity = activities.find(a => a.id === activityId);
    
    if (!activity || getUnallocatedBalance() < amount) return false;
    
    const transaction: Transaction = {
      id: generateId(),
      type: 'allocate',
      amount,
      activityId,
      description: `Allocated ₹${amount.toLocaleString('en-IN')} to ${activity.name}`,
      createdAt: new Date(),
    };
    
    set((state) => ({
      activities: state.activities.map(a =>
        a.id === activityId 
          ? { ...a, allocatedAmount: a.allocatedAmount + amount }
          : a
      ),
      transactions: [transaction, ...state.transactions],
    }));
    return true;
  },

  segregateMoney: (amount: number, activityIds: string[]) => {
    const { getUnallocatedBalance, activities } = get();
    
    if (activityIds.length === 0 || getUnallocatedBalance() < amount) return false;
    
    const perActivity = Math.floor(amount / activityIds.length);
    if (perActivity < 1) return false;
    
    const transactions: Transaction[] = [];
    const selectedActivities = activities.filter(a => activityIds.includes(a.id));
    
    set((state) => {
      const updatedActivities = state.activities.map(a => {
        if (activityIds.includes(a.id)) {
          transactions.push({
            id: generateId(),
            type: 'allocate',
            amount: perActivity,
            activityId: a.id,
            description: `Segregated ₹${perActivity.toLocaleString('en-IN')} to ${a.name}`,
            createdAt: new Date(),
          });
          return { ...a, allocatedAmount: a.allocatedAmount + perActivity };
        }
        return a;
      });
      
      return {
        activities: updatedActivities,
        transactions: [...transactions, ...state.transactions],
      };
    });
    
    return true;
  },

  getUnallocatedBalance: () => {
    const { balance, activities } = get();
    const totalAllocated = activities.reduce((sum, a) => sum + a.allocatedAmount, 0);
    return balance - totalAllocated;
  },

  getTotalAllocated: () => {
    const { activities } = get();
    return activities.reduce((sum, a) => sum + a.allocatedAmount, 0);
  },
}));
