import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWalletStore } from '@/store/useWalletStore';
import { toast } from 'sonner';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddActivityModal({ isOpen, onClose }: AddActivityModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetBudget, setTargetBudget] = useState('');
  
  const addActivity = useWalletStore((state) => state.addActivity);
  const activities = useWalletStore((state) => state.activities);
  
  const freeLimit = 3;
  const isFree = activities.length < freeLimit;

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Please enter a name for your activity');
      return;
    }
    
    // For now, just create the activity (payment flow to be added with backend)
    addActivity({
      name: name.trim(),
      description: description.trim(),
      targetBudget: parseFloat(targetBudget) || 0,
      color: '',
    });
    
    toast.success(`Activity "${name}" created!`);
    setName('');
    setDescription('');
    setTargetBudget('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
          >
            <div className="glass-card mx-4 mb-4 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold">New Activity</h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!isFree && (
                <div className="mb-4 p-3 rounded-xl bg-warning/10 border border-warning/20">
                  <p className="text-sm text-warning">
                    This will be your {activities.length + 1}th activity. A fee of ₹19 will apply.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                    Activity Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Vacation Fund"
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium mb-2 block">
                    Description (Optional)
                  </Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this activity for?"
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="budget" className="text-sm font-medium mb-2 block">
                    Target Budget (Optional)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      id="budget"
                      type="number"
                      value={targetBudget}
                      onChange={(e) => setTargetBudget(e.target.value)}
                      placeholder="0"
                      className="h-12 pl-8"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  className="w-full"
                  variant="wallet"
                  size="lg"
                >
                  <Plus className="h-5 w-5" />
                  {isFree ? 'Create Activity' : 'Pay ₹19 & Create'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
