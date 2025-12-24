import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { ActivitiesList } from '@/components/dashboard/ActivitiesList';
import { useAuth } from '@/hooks/useAuth';
import { WalletProvider } from '@/contexts/WalletContext';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components
const WalletScene = lazy(() => import('@/components/3d/WalletScene').then(m => ({ default: m.WalletScene })));
const AddActivityModal = lazy(() => import('@/components/modals/AddActivityModal').then(m => ({ default: m.AddActivityModal })));
const AddMoneyModal = lazy(() => import('@/components/modals/AddMoneyModal').then(m => ({ default: m.AddMoneyModal })));
const SegregateModal = lazy(() => import('@/components/modals/SegregateModal').then(m => ({ default: m.SegregateModal })));

const Index = () => {
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showSegregate, setShowSegregate] = useState(false);
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <WalletProvider>
      <div className="min-h-screen bg-background">
        <Navbar
          onAddActivity={() => setShowAddActivity(true)}
          onAddMoney={() => setShowAddMoney(true)}
          onSegregate={() => setShowSegregate(true)}
        />

        <main className="pt-24 pb-8">
          {/* 3D Wallet Scene */}
          <Suspense fallback={<div className="w-full h-[300px] bg-background/50" />}>
            <WalletScene />
          </Suspense>

          {/* Wallet Balance Card */}
          <div className="-mt-8 relative z-10">
            <WalletCard />
          </div>

          {/* Activities List */}
          <div className="mt-6">
            <ActivitiesList />
          </div>
        </main>

        {/* Modals - Only render when open */}
        <Suspense fallback={null}>
          {showAddActivity && <AddActivityModal isOpen={showAddActivity} onClose={() => setShowAddActivity(false)} />}
          {showAddMoney && <AddMoneyModal isOpen={showAddMoney} onClose={() => setShowAddMoney(false)} />}
          {showSegregate && <SegregateModal isOpen={showSegregate} onClose={() => setShowSegregate(false)} />}
        </Suspense>
      </div>
    </WalletProvider>
  );
};

export default Index;
