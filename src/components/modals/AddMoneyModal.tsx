import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWalletStore } from '@/store/useWalletStore';
import { toast } from 'sonner';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickAmounts = [500, 1000, 2000, 5000, 10000];

export function AddMoneyModal({ isOpen, onClose }: AddMoneyModalProps) {
  const [amount, setAmount] = useState('');
  const [isWithdraw, setIsWithdraw] = useState(false);
  
  const addMoney = useWalletStore((state) => state.addMoney);
  const withdrawMoney = useWalletStore((state) => state.withdrawMoney);
  const getUnallocatedBalance = useWalletStore((state) => state.getUnallocatedBalance);

  const handleSubmit = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (isWithdraw) {
      const success = withdrawMoney(value);
      if (success) {
        toast.success(`Withdrew ₹${value.toLocaleString('en-IN')} from wallet`);
      } else {
        toast.error('Insufficient unallocated funds');
        return;
      }
    } else {
      addMoney(value);
      toast.success(`Added ₹${value.toLocaleString('en-IN')} to wallet`);
    }
    
    setAmount('');
    onClose();
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

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
            className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
          >
            <div className="glass-card mx-4 mb-4 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold">
                  {isWithdraw ? 'Withdraw Money' : 'Add Money'}
                </h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Toggle */}
              <div className="flex p-1 rounded-xl bg-muted mb-6">
                <button
                  onClick={() => setIsWithdraw(false)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                    !isWithdraw ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <Plus className="h-4 w-4 inline mr-1" />
                  Add
                </button>
                <button
                  onClick={() => setIsWithdraw(true)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                    isWithdraw ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <Minus className="h-4 w-4 inline mr-1" />
                  Withdraw
                </button>
              </div>

              {isWithdraw && (
                <p className="text-xs text-muted-foreground mb-4">
                  Available: ₹{getUnallocatedBalance().toLocaleString('en-IN')}
                </p>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-display">₹</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="h-16 pl-10 text-3xl font-display font-bold text-center"
                  />
                </div>

                {/* Quick amounts */}
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleQuickAmount(value)}
                      className="flex-1 min-w-[60px] py-2 px-3 rounded-xl bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
                    >
                      ₹{value.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                <Button 
                  onClick={handleSubmit}
                  className="w-full"
                  variant={isWithdraw ? 'destructive' : 'wallet'}
                  size="lg"
                >
                  <Wallet className="h-5 w-5" />
                  {isWithdraw ? 'Withdraw' : 'Add to Wallet'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
