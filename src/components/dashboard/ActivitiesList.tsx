import { motion } from 'framer-motion';
import { useWalletStore } from '@/store/useWalletStore';
import { ActivityCard } from './ActivityCard';
import { FolderOpen } from 'lucide-react';

export function ActivitiesList() {
  const activities = useWalletStore((state) => state.activities);

  if (activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-display font-semibold text-lg mb-1">No activities yet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-[240px]">
          Create your first activity to start organizing your money
        </p>
      </motion.div>
    );
  }

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-lg">Your Activities</h2>
        <span className="text-sm text-muted-foreground">
          {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
        </span>
      </div>
      
      <div className="grid gap-3">
        {activities.map((activity, index) => (
          <ActivityCard 
            key={activity.id} 
            activity={activity} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
