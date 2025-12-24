import { motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';

export function WalletCard() {
  const { balance, getUnallocatedBalance, getTotalAllocated, loading } = useWallet();
  
  const unallocated = getUnallocatedBalance();
  const allocated = getTotalAllocated();
  const allocationPercent = balance > 0 ? (allocated / balance) * 100 : 0;

  if (loading) {
    return (
      <div className="glass-card p-6 mx-4 flex items-center justify-center min-h-[180px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6 mx-4"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-6">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Balance</p>
            <h2 className="text-3xl font-display font-bold amount-display mt-1">
              ₹{balance.toLocaleString('en-IN')}
            </h2>
          </div>
          <div className="border-l border-border pl-6">
            <p className="text-sm text-muted-foreground font-medium">Wallet Balance</p>
            <h2 className="text-3xl font-display font-bold amount-display mt-1 text-primary">
              ₹{unallocated.toLocaleString('en-IN')}
            </h2>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-primary/10">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-xl bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="h-3 w-3 text-success" />
            <span className="text-xs text-muted-foreground">Allocated</span>
          </div>
          <p className="font-display font-semibold amount-display">
            ₹{allocated.toLocaleString('en-IN')}
          </p>
        </div>
        
        <div className="p-3 rounded-xl bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="h-3 w-3 text-warning" />
            <span className="text-xs text-muted-foreground">Unallocated</span>
          </div>
          <p className="font-display font-semibold amount-display">
            ₹{unallocated.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Allocation Progress */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Allocation Progress</span>
          <span>{allocationPercent.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${allocationPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
