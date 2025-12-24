import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { WalletScene } from '@/components/3d/WalletScene';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { ActivitiesList } from '@/components/dashboard/ActivitiesList';
import { AddActivityModal } from '@/components/modals/AddActivityModal';
import { AddMoneyModal } from '@/components/modals/AddMoneyModal';
import { SegregateModal } from '@/components/modals/SegregateModal';

const Index = () => {
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showSegregate, setShowSegregate] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onAddActivity={() => setShowAddActivity(true)}
        onAddMoney={() => setShowAddMoney(true)}
        onSegregate={() => setShowSegregate(true)}
      />

      <main className="pt-24 pb-8">
        {/* 3D Wallet Scene */}
        <WalletScene />

        {/* Wallet Balance Card */}
        <div className="-mt-8 relative z-10">
          <WalletCard />
        </div>

        {/* Activities List */}
        <div className="mt-6">
          <ActivitiesList />
        </div>
      </main>

      {/* Modals */}
      <AddActivityModal isOpen={showAddActivity} onClose={() => setShowAddActivity(false)} />
      <AddMoneyModal isOpen={showAddMoney} onClose={() => setShowAddMoney(false)} />
      <SegregateModal isOpen={showSegregate} onClose={() => setShowSegregate(false)} />
    </div>
  );
};

export default Index;
