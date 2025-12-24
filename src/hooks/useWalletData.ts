import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

export type DbWallet = Tables<'wallets'>;
export type DbActivity = Tables<'activities'>;
export type DbTransaction = Tables<'transactions'>;

const ACTIVITY_COLORS = [
  'hsl(160 60% 50%)',
  'hsl(199 89% 48%)',
  'hsl(271 81% 56%)',
  'hsl(25 95% 53%)',
  'hsl(340 75% 55%)',
  'hsl(45 93% 47%)',
];

export function useWalletData() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<DbWallet | null>(null);
  const [activities, setActivities] = useState<DbActivity[]>([]);
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all wallet data
  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      const [walletRes, activitiesRes, transactionsRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('activities').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at', { ascending: true }),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      ]);

      if (walletRes.error) throw walletRes.error;
      if (activitiesRes.error) throw activitiesRes.error;
      if (transactionsRes.error) throw transactionsRes.error;

      setWallet(walletRes.data);
      setActivities(activitiesRes.data || []);
      setTransactions(transactionsRes.data || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add money to wallet
  const addMoney = async (amount: number): Promise<boolean> => {
    if (!user || !wallet) return false;

    try {
      const newBalance = Number(wallet.balance) + amount;

      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id);

      if (walletError) throw walletError;

      const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        wallet_id: wallet.id,
        type: 'deposit',
        amount,
        description: `Added ₹${amount.toLocaleString('en-IN')} to wallet`,
        status: 'completed',
      });

      if (txError) throw txError;

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error adding money:', error);
      toast.error('Failed to add money');
      return false;
    }
  };

  // Withdraw money from wallet
  const withdrawMoney = async (amount: number): Promise<boolean> => {
    if (!user || !wallet) return false;

    const unallocated = getUnallocatedBalance();
    if (unallocated < amount) {
      toast.error('Insufficient unallocated balance');
      return false;
    }

    try {
      const newBalance = Number(wallet.balance) - amount;

      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id);

      if (walletError) throw walletError;

      const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        wallet_id: wallet.id,
        type: 'withdrawal',
        amount,
        description: `Withdrew ₹${amount.toLocaleString('en-IN')} from wallet`,
        status: 'completed',
      });

      if (txError) throw txError;

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error withdrawing money:', error);
      toast.error('Failed to withdraw money');
      return false;
    }
  };

  // Add a new activity
  const addActivity = async (data: {
    name: string;
    description?: string;
    targetBudget?: number;
    imageUrl?: string;
    isPaid?: boolean;
  }): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.from('activities').insert({
        user_id: user.id,
        name: data.name,
        description: data.description || null,
        target_amount: data.targetBudget || 0,
        image_url: data.imageUrl || null,
        is_paid: data.isPaid || false,
        allocated_amount: 0,
      });

      if (error) throw error;

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to create activity');
      return false;
    }
  };

  // Delete an activity (soft delete by setting is_active to false)
  const deleteActivity = async (activityId: string): Promise<boolean> => {
    if (!user) return false;

    const activity = activities.find(a => a.id === activityId);
    if (!activity) return false;

    if (Number(activity.allocated_amount) > 0) {
      toast.error('Cannot delete activity with allocated funds');
      return false;
    }

    try {
      const { error } = await supabase
        .from('activities')
        .update({ is_active: false })
        .eq('id', activityId);

      if (error) throw error;

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
      return false;
    }
  };

  // Update an activity
  const updateActivity = async (
    activityId: string,
    updates: { name?: string; description?: string; targetBudget?: number; imageUrl?: string }
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('activities')
        .update({
          name: updates.name,
          description: updates.description,
          target_amount: updates.targetBudget,
          image_url: updates.imageUrl,
        })
        .eq('id', activityId);

      if (error) throw error;

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Failed to update activity');
      return false;
    }
  };

  // Allocate money to an activity
  const allocateToActivity = async (activityId: string, amount: number): Promise<boolean> => {
    if (!user || !wallet) return false;

    const unallocated = getUnallocatedBalance();
    if (unallocated < amount) {
      toast.error('Insufficient unallocated balance');
      return false;
    }

    const activity = activities.find(a => a.id === activityId);
    if (!activity) return false;

    try {
      const newAllocated = Number(activity.allocated_amount) + amount;

      const { error: activityError } = await supabase
        .from('activities')
        .update({ allocated_amount: newAllocated })
        .eq('id', activityId);

      if (activityError) throw activityError;

      const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        wallet_id: wallet.id,
        activity_id: activityId,
        type: 'allocation',
        amount,
        description: `Allocated ₹${amount.toLocaleString('en-IN')} to ${activity.name}`,
        status: 'completed',
      });

      if (txError) throw txError;

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error allocating money:', error);
      toast.error('Failed to allocate money');
      return false;
    }
  };

  // Segregate money equally across selected activities
  const segregateMoney = async (amount: number, activityIds: string[]): Promise<boolean> => {
    if (!user || !wallet || activityIds.length === 0) return false;

    const unallocated = getUnallocatedBalance();
    if (unallocated < amount) {
      toast.error('Insufficient unallocated balance');
      return false;
    }

    const perActivity = Math.floor(amount / activityIds.length);
    if (perActivity < 1) {
      toast.error('Amount too small to split');
      return false;
    }

    try {
      const selectedActivities = activities.filter(a => activityIds.includes(a.id));

      // Update all activities and create transactions
      for (const activity of selectedActivities) {
        const newAllocated = Number(activity.allocated_amount) + perActivity;

        const { error: activityError } = await supabase
          .from('activities')
          .update({ allocated_amount: newAllocated })
          .eq('id', activity.id);

        if (activityError) throw activityError;

        const { error: txError } = await supabase.from('transactions').insert({
          user_id: user.id,
          wallet_id: wallet.id,
          activity_id: activity.id,
          type: 'allocation',
          amount: perActivity,
          description: `Segregated ₹${perActivity.toLocaleString('en-IN')} to ${activity.name}`,
          status: 'completed',
        });

        if (txError) throw txError;
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Error segregating money:', error);
      toast.error('Failed to segregate money');
      return false;
    }
  };

  // Helper: Get unallocated balance
  const getUnallocatedBalance = (): number => {
    if (!wallet) return 0;
    const totalAllocated = activities.reduce((sum, a) => sum + Number(a.allocated_amount), 0);
    return Number(wallet.balance) - totalAllocated;
  };

  // Helper: Get total allocated
  const getTotalAllocated = (): number => {
    return activities.reduce((sum, a) => sum + Number(a.allocated_amount), 0);
  };

  // Helper: Get activity color
  const getActivityColor = (index: number): string => {
    return ACTIVITY_COLORS[index % ACTIVITY_COLORS.length];
  };

  // Get free activity count
  const getFreeActivityCount = (): number => {
    return activities.filter(a => !a.is_paid).length;
  };

  return {
    wallet,
    activities,
    transactions,
    loading,
    balance: wallet ? Number(wallet.balance) : 0,
    addMoney,
    withdrawMoney,
    addActivity,
    deleteActivity,
    updateActivity,
    allocateToActivity,
    segregateMoney,
    getUnallocatedBalance,
    getTotalAllocated,
    getActivityColor,
    getFreeActivityCount,
    refetch: fetchData,
  };
}
