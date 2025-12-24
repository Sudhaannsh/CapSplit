import { motion } from 'framer-motion';
import { Activity } from '@/store/useWalletStore';
import { MoreVertical, TrendingUp } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  index: number;
  onClick?: () => void;
}

export function ActivityCard({ activity, index, onClick }: ActivityCardProps) {
  const progress = activity.targetBudget > 0 
    ? (activity.allocatedAmount / activity.targetBudget) * 100 
    : 0;
  
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
      {/* Gradient accent bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ backgroundColor: activity.color }}
      />
      
      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at 50% 50%, ${activity.color}20, transparent 70%)`
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
        <button className="p-1 hover:bg-muted rounded-lg transition-colors">
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="pl-3">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-display font-bold amount-display">
            ₹{activity.allocatedAmount.toLocaleString('en-IN')}
          </span>
          {activity.targetBudget > 0 && (
            <span className="text-xs text-muted-foreground">
              / ₹{activity.targetBudget.toLocaleString('en-IN')}
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
            style={{ backgroundColor: activity.color }}
          />
        </div>

        {progress > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3" style={{ color: activity.color }} />
            <span className="text-xs" style={{ color: activity.color }}>
              {progress.toFixed(0)}% allocated
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
