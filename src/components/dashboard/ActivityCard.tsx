import { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, TrendingUp, Trash2, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type DbActivity = Tables<'activities'>;

interface ActivityCardProps {
  activity: DbActivity;
  color: string;
  index: number;
  onClick?: () => void;
}

export function ActivityCard({ activity, color, index, onClick }: ActivityCardProps) {
  const [showAddAmount, setShowAddAmount] = useState(false);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteActivity, allocateToActivity, getUnallocatedBalance } = useWallet();
  
  const allocatedAmount = Number(activity.allocated_amount);
  const targetAmount = Number(activity.target_amount || 0);
  
  const progress = targetAmount > 0 
    ? (allocatedAmount / targetAmount) * 100 
    : 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allocatedAmount > 0) {
      toast.error('Cannot delete activity with allocated funds');
      return;
    }
    const success = await deleteActivity(activity.id);
    if (success) {
      toast.success('Activity deleted');
    }
  };

  const handleAddAmount = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (numAmount > getUnallocatedBalance()) {
      toast.error('Insufficient unallocated balance');
      return;
    }
    setIsSubmitting(true);
    const success = await allocateToActivity(activity.id, numAmount);
    setIsSubmitting(false);
    if (success) {
      toast.success(`₹${numAmount.toLocaleString('en-IN')} added to ${activity.name}`);
      setAmount('');
      setShowAddAmount(false);
    }
  };
  
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card p-4 cursor-pointer relative overflow-hidden group"
    >
      {/* Activity Image Background */}
      {activity.image_url && (
        <div 
          className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
          style={{ 
            backgroundImage: `url(${activity.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      {/* Gradient accent bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl z-10"
        style={{ backgroundColor: color }}
      />
      
      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at 50% 50%, ${color}20, transparent 70%)`
        }}
      />

      <div className="flex items-start justify-between mb-3 pl-3">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-foreground">
            {activity.name}
          </h3>
          {activity.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {activity.description}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-1 hover:bg-muted rounded-lg transition-colors">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => setShowAddAmount(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Amount
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="pl-3">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-display font-bold amount-display">
            ₹{allocatedAmount.toLocaleString('en-IN')}
          </span>
          {targetAmount > 0 && (
            <span className="text-xs text-muted-foreground">
              / ₹{targetAmount.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>

        {progress > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3" style={{ color }} />
            <span className="text-xs" style={{ color }}>
              {progress.toFixed(0)}% allocated
            </span>
          </div>
        )}

        {/* Inline Add Amount Form */}
        {showAddAmount && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddAmount}
            onClick={(e) => e.stopPropagation()}
            className="mt-3 flex gap-2"
          >
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="flex-1 px-3 py-1.5 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddAmount(false)}
              className="px-3 py-1.5 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80"
            >
              Cancel
            </button>
          </motion.form>
        )}
      </div>
    </motion.div>
  );
}
