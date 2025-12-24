import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeftRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWalletStore } from '@/store/useWalletStore';
import { toast } from 'sonner';

interface SegregateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SegregateModal({ isOpen, onClose }: SegregateModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  
  const activities = useWalletStore((state) => state.activities);
  const segregateMoney = useWalletStore((state) => state.segregateMoney);
  const getUnallocatedBalance = useWalletStore((state) => state.getUnallocatedBalance);

  const unallocated = getUnallocatedBalance();

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedActivities.length === activities.length) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(activities.map((a) => a.id));
    }
  };

  const handleSubmit = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (value > unallocated) {
      toast.error('Amount exceeds available balance');
      return;
    }

    if (selectedActivities.length === 0) {
      toast.error('Please select at least one activity');
      return;
    }

    const success = segregateMoney(value, selectedActivities);
    if (success) {
      const perActivity = Math.floor(value / selectedActivities.length);
      toast.success(`Segregated ₹${perActivity.toLocaleString('en-IN')} to each activity`);
      setAmount('');
      setSelectedActivities([]);
      onClose();
    } else {
      toast.error('Failed to segregate money');
    }
  };

  const perActivity = selectedActivities.length > 0 
    ? Math.floor(parseFloat(amount || '0') / selectedActivities.length)
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 safe-bottom max-h-[80vh] overflow-y-auto"
          >
            <div className="glass-card mx-4 mb-4 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold">Segregate Money</h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Available: ₹{unallocated.toLocaleString('en-IN')}
              </p>

              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Create activities first to segregate money</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="segregate-amount" className="text-sm font-medium mb-2 block">
                      Amount to Split Equally
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-display">₹</span>
                      <Input
                        id="segregate-amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="h-14 pl-10 text-2xl font-display font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Select Activities</Label>
                      <button
                        onClick={selectAll}
                        className="text-xs text-primary hover:underline"
                      >
                        {selectedActivities.length === activities.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {activities.map((activity) => (
                        <button
                          key={activity.id}
                          onClick={() => toggleActivity(activity.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                            selectedActivities.includes(activity.id)
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: activity.color }}
                            />
                            <span className="font-medium">{activity.name}</span>
                          </div>
                          {selectedActivities.includes(activity.id) && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {perActivity > 0 && selectedActivities.length > 0 && (
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <p className="text-sm text-center">
                        Each activity will receive{' '}
                        <span className="font-bold text-primary">
                          ₹{perActivity.toLocaleString('en-IN')}
                        </span>
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handleSubmit}
                    className="w-full"
                    variant="gradient"
                    size="lg"
                    disabled={!amount || selectedActivities.length === 0}
                  >
                    <ArrowLeftRight className="h-5 w-5" />
                    Segregate to {selectedActivities.length} {selectedActivities.length === 1 ? 'Activity' : 'Activities'}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
