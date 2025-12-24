import { Plus, Wallet, ArrowLeftRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface NavbarProps {
  onAddActivity: () => void;
  onAddMoney: () => void;
  onSegregate: () => void;
}

export function Navbar({ onAddActivity, onAddMoney, onSegregate }: NavbarProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 safe-top"
    >
      <div className="glass-card mx-4 mt-4 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-display font-bold text-gradient">
          CapSplit
        </h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddActivity}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddMoney}
            className="gap-1"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Add Money</span>
          </Button>
          
          <Button
            variant="gradient"
            size="sm"
            onClick={onSegregate}
            className="gap-1"
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">Segregate</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-1 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
