import React, { useState, useEffect } from 'react';
import { WalletButton } from './components/WalletButton';
import { PassengerDashboard } from './components/PassengerDashboard';
import { OperatorDashboard } from './components/OperatorDashboard';
import { PaymentLinkView } from './components/PaymentLinkView';
import { VaultDashboard } from './components/VaultDashboard';
import { WalletState, UserRole, PaymentLink, VaultState } from './types';
import { ShieldCheck, Bus, LayoutDashboard, Send, Menu, X, Landmark } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<UserRole | 'LINK_PAYMENT' | 'VAULT'>(UserRole.PASSENGER);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Global State
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0
  });

  // Vault State
  const [vault, setVault] = useState<VaultState>({
    balance: 0,
    lockedAmount: 0,
    yieldEarned: 12.45, // Mock initial yield
    points: 120, // Mock initial points
    apy: 4.5,
    nfts: [],
    lockPeriod: 'NONE'
  });

  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [targetLinkId, setTargetLinkId] = useState<string | null>(null);

  // Mock Wallet Actions
  const connectWallet = () => {
    setWallet({
      isConnected: true,
      address: '0x71C...9A23',
      balance: 145.50
    });
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: 0
    });
  };

  const updateBalance = (newBalance: number) => {
    setWallet(prev => ({ ...prev, balance: newBalance }));
  };

  const createLink = (link: PaymentLink) => {
    setPaymentLinks(prev => [link, ...prev]);
  };

  const handlePayLink = (id: string) => {
    setPaymentLinks(prev => prev.map(l => l.id === id ? { ...l, isPaid: true } : l));
    const link = paymentLinks.find(l => l.id === id);
    if (link) {
        // Check if paying from vault or wallet? For now assumed wallet in Link Payment View
        updateBalance(wallet.balance - link.amount);
    }
  };

  // Helper to switch view for specific link payment
  const openLinkPayment = (id?: string) => {
      if (id) setTargetLinkId(id);
      setView('LINK_PAYMENT');
      setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 md:pb-0">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(UserRole.PASSENGER)}>
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Bus size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">TRANSIT ARC</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
               <button 
                onClick={() => setView(UserRole.PASSENGER)}
                className={`text-sm font-medium transition-colors ${view === UserRole.PASSENGER ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
               >
                Passenger
               </button>
               <button 
                onClick={() => setView('VAULT')}
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${view === 'VAULT' ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'}`}
               >
                Vault & Rewards
               </button>
               <button 
                onClick={() => setView(UserRole.OPERATOR)}
                className={`text-sm font-medium transition-colors ${view === UserRole.OPERATOR ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
               >
                Operator Portal
               </button>
               <button 
                onClick={() => openLinkPayment()}
                className={`text-sm font-medium transition-colors ${view === 'LINK_PAYMENT' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
               >
                Pay for Others
               </button>
            </div>

            {/* Wallet & Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              <WalletButton 
                walletState={wallet} 
                onConnect={connectWallet} 
                onDisconnect={disconnectWallet} 
              />
              <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                 {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white absolute w-full shadow-lg">
             <div className="px-4 py-3 space-y-2">
               <button 
                onClick={() => { setView(UserRole.PASSENGER); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
               >
                Passenger
               </button>
               <button 
                onClick={() => { setView('VAULT'); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
               >
                Vault & Rewards
               </button>
               <button 
                onClick={() => { setView(UserRole.OPERATOR); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
               >
                Operator Portal
               </button>
               <button 
                onClick={() => { openLinkPayment(); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
               >
                Pay for Others
               </button>
             </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {view === UserRole.PASSENGER && (
          <div className="max-w-3xl mx-auto">
             <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Where to next?</h1>
                <p className="text-slate-500">Book tickets instantly or generate payment links.</p>
             </div>
             <PassengerDashboard 
                walletState={wallet} 
                onUpdateWallet={updateBalance} 
                onCreateLink={createLink}
             />
          </div>
        )}

        {view === 'VAULT' && (
          <div className="max-w-4xl mx-auto">
             <div className="mb-8 flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">My Vault</h1>
                  <p className="text-slate-500">Deposit USDC, earn yield, and collect exclusive NFTs.</p>
                </div>
                <div className="hidden sm:block">
                  <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm">
                    <Landmark size={18} />
                    <span>Backed by Transit Treasury</span>
                  </div>
                </div>
             </div>
             {!wallet.isConnected ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200 text-center px-4">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                        <Landmark size={40} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Connect Wallet to Access Vault</h3>
                    <p className="text-slate-500 max-w-md mb-6">Start earning passive income on your transit funds and unlock exclusive commuter rewards.</p>
                    <WalletButton walletState={wallet} onConnect={connectWallet} onDisconnect={disconnectWallet} />
                </div>
             ) : (
                <VaultDashboard 
                   walletState={wallet} 
                   vaultState={vault} 
                   onUpdateVault={setVault}
                   onUpdateWallet={updateBalance}
                />
             )}
          </div>
        )}

        {view === UserRole.OPERATOR && (
          <div className="max-w-5xl mx-auto">
             <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Operator Dashboard</h1>
                    <p className="text-slate-500">Real-time revenue analytics and validation.</p>
                </div>
                <div className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck size={12} /> Secure Connection
                </div>
             </div>
             <OperatorDashboard />
          </div>
        )}

        {view === 'LINK_PAYMENT' && (
           <PaymentLinkView 
              linkId={targetLinkId}
              walletState={wallet}
              onConnect={connectWallet}
              onDisconnect={disconnectWallet}
              availableLinks={paymentLinks} // In a real app, this would query an API
              onPay={handlePayLink}
              onClose={() => setView(UserRole.PASSENGER)}
           />
        )}

      </main>

      {/* Debug Info (For Demo Purposes) */}
      <div className="fixed bottom-4 right-4 z-40 hidden lg:block">
          <div className="bg-black/80 backdrop-blur text-white text-xs p-3 rounded-lg max-w-xs">
              <p className="font-bold text-slate-300 mb-1">DEMO STATE</p>
              <p>Wallet: {wallet.isConnected ? 'Connected' : 'Disconnected'}</p>
              <p>Vault Balance: ${vault.balance.toFixed(2)}</p>
          </div>
      </div>

    </div>
  );
}