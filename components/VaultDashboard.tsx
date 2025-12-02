import React, { useState, useEffect } from 'react';
import { WalletState, VaultState, NFT } from '../types';
import { generateVaultInsights } from '../services/geminiService';
import { Coins, Lock, TrendingUp, Trophy, ArrowUpRight, ArrowDownLeft, Shield, Sparkles, Loader2, Star, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  walletState: WalletState;
  vaultState: VaultState;
  onUpdateVault: (newState: VaultState) => void;
  onUpdateWallet: (newBalance: number) => void;
}

export const VaultDashboard: React.FC<Props> = ({ walletState, vaultState, onUpdateVault, onUpdateWallet }) => {
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [amount, setAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [insight, setInsight] = useState<string>("Loading personal finance tips...");
  const [selectedLock, setSelectedLock] = useState<'NONE' | '30_DAYS' | '90_DAYS' | '1_YEAR'>('NONE');

  useEffect(() => {
    generateVaultInsights(vaultState.balance, vaultState.points).then(setInsight);
  }, [vaultState.balance]);

  // Mock Projection Data
  const projectionData = [
    { month: 'Jan', value: vaultState.balance },
    { month: 'Feb', value: vaultState.balance * (1 + (vaultState.apy / 1200)) },
    { month: 'Mar', value: vaultState.balance * (1 + (vaultState.apy / 1200) * 2) },
    { month: 'Apr', value: vaultState.balance * (1 + (vaultState.apy / 1200) * 3) },
    { month: 'May', value: vaultState.balance * (1 + (vaultState.apy / 1200) * 4) },
    { month: 'Jun', value: vaultState.balance * (1 + (vaultState.apy / 1200) * 5) },
  ];

  const handleTransaction = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    if (activeTab === 'DEPOSIT') {
      if (val > walletState.balance) {
        alert("Insufficient Wallet Balance");
        return;
      }
      setProcessing(true);
      setTimeout(() => {
        const newBalance = vaultState.balance + val;
        
        // Check for NFT Unlocks
        const newNfts = [...vaultState.nfts];
        if (newBalance >= 50 && !newNfts.find(n => n.tier === 'BRONZE')) {
            newNfts.push({ 
                id: 'nft-bronze', name: 'Bronze Pass', description: 'Entry level transit access', 
                tier: 'BRONZE', imageUrl: 'https://images.unsplash.com/photo-1610375461246-83c485099f10?w=400&q=80', dateEarned: new Date().toISOString() 
            });
        }
        if (newBalance >= 200 && !newNfts.find(n => n.tier === 'SILVER')) {
             newNfts.push({ 
                id: 'nft-silver', name: 'Silver Commuter', description: 'Pro traveler status', 
                tier: 'SILVER', imageUrl: 'https://images.unsplash.com/photo-1610375461369-d612b120f6ca?w=400&q=80', dateEarned: new Date().toISOString() 
            });
        }
         if (newBalance >= 500 && !newNfts.find(n => n.tier === 'GOLD')) {
             newNfts.push({ 
                id: 'nft-gold', name: 'Gold Class', description: 'Elite transit privileges', 
                tier: 'GOLD', imageUrl: 'https://images.unsplash.com/photo-1610375461257-d72dd254859a?w=400&q=80', dateEarned: new Date().toISOString() 
            });
        }

        // Calculate Points Multiplier based on lock
        let multiplier = 1;
        if (selectedLock === '30_DAYS') multiplier = 1.5;
        if (selectedLock === '90_DAYS') multiplier = 2;
        if (selectedLock === '1_YEAR') multiplier = 3;

        onUpdateWallet(walletState.balance - val);
        onUpdateVault({
          ...vaultState,
          balance: newBalance,
          points: vaultState.points + (val * multiplier),
          nfts: newNfts,
          lockPeriod: selectedLock !== 'NONE' ? selectedLock : vaultState.lockPeriod
        });
        setAmount('');
        setProcessing(false);
      }, 2000);
    } else {
       if (val > vaultState.balance) {
        alert("Insufficient Vault Funds");
        return;
      }
      setProcessing(true);
      setTimeout(() => {
        onUpdateWallet(walletState.balance + val);
        onUpdateVault({
          ...vaultState,
          balance: vaultState.balance - val,
        });
        setAmount('');
        setProcessing(false);
      }, 2000);
    }
  };

  const getLockAPY = (lock: string) => {
      switch(lock) {
          case 'NONE': return 4.5;
          case '30_DAYS': return 6.2;
          case '90_DAYS': return 8.5;
          case '1_YEAR': return 12.0;
          default: return 4.5;
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* AI Insight Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-xl p-4 text-white shadow-lg flex items-start gap-3 border border-indigo-700">
         <Sparkles className="shrink-0 mt-1 text-amber-400" size={20} />
         <div>
             <h3 className="font-bold text-sm uppercase tracking-wider opacity-90 text-amber-400">Arc AI Advisor</h3>
             <p className="font-medium text-indigo-50">{insight}</p>
         </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield size={100} />
            </div>
            <div className="flex justify-between items-start mb-1">
                <p className="text-slate-400 text-sm font-medium">Vault Balance</p>
                <div className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-300 flex items-center gap-1">
                    <Globe size={10} /> Arc Chain
                </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-2">${vaultState.balance.toFixed(2)}</h2>
            <div className="flex items-center gap-2 text-emerald-400 text-sm bg-white/10 w-fit px-2 py-1 rounded-full">
                <TrendingUp size={14} /> 
                <span>{vaultState.apy}% APY</span>
            </div>
            <p className="mt-4 text-xs text-slate-500">Held in USYC (Yield Bearing)</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 text-indigo-50 opacity-50">
                <Star size={120} strokeWidth={1} />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Loyalty Points</p>
            <h2 className="text-4xl font-bold text-indigo-600 mb-2">{vaultState.points.toLocaleString()}</h2>
            <p className="text-sm text-slate-600">
                {vaultState.lockPeriod === 'NONE' ? '1x' : vaultState.lockPeriod === '30_DAYS' ? '1.5x' : vaultState.lockPeriod === '90_DAYS' ? '2x' : '3x'} Multiplier Active
            </p>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[60%]" />
            </div>
            <p className="text-xs text-slate-400 mt-1">400 pts to next reward</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
             <p className="text-slate-500 text-sm font-medium mb-1">Yield Earned</p>
             <h2 className="text-4xl font-bold text-emerald-600 mb-2">${vaultState.yieldEarned.toFixed(2)}</h2>
             <div className="h-24 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData}>
                         <defs>
                            <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#colorYield)" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Action Panel */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
               <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                   <button 
                    onClick={() => setActiveTab('DEPOSIT')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'DEPOSIT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                    Deposit
                   </button>
                   <button 
                    onClick={() => setActiveTab('WITHDRAW')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'WITHDRAW' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                    Withdraw
                   </button>
               </div>

               <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (USDC)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="0.00"
                            />
                            <div className="absolute left-3 top-3.5 text-slate-400">
                                <Coins size={18} />
                            </div>
                            <button 
                                onClick={() => setAmount(activeTab === 'DEPOSIT' ? walletState.balance.toString() : vaultState.balance.toString())}
                                className="absolute right-3 top-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded"
                            >
                                MAX
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 text-right">
                            Available: {activeTab === 'DEPOSIT' ? walletState.balance.toFixed(2) : vaultState.balance.toFixed(2)} USDC
                        </p>
                    </div>

                    {activeTab === 'DEPOSIT' && (
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">Lock Period (Bonus Multiplier)</label>
                             <div className="grid grid-cols-2 gap-2">
                                {(['NONE', '30_DAYS', '90_DAYS', '1_YEAR'] as const).map((period) => (
                                    <button 
                                        key={period}
                                        onClick={() => setSelectedLock(period)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all ${selectedLock === period 
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                    >
                                        <div className="font-bold">
                                            {period === 'NONE' ? 'No Lock' : period.replace('_', ' ')}
                                        </div>
                                        <div className="text-[10px] opacity-80">
                                            {getLockAPY(period)}% APY
                                        </div>
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}

                    <button 
                        onClick={handleTransaction}
                        disabled={processing || !amount}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${activeTab === 'DEPOSIT' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-800 hover:bg-slate-900 shadow-slate-200'}`}
                    >
                         {processing ? <Loader2 className="animate-spin" /> : (activeTab === 'DEPOSIT' ? <ArrowDownLeft /> : <ArrowUpRight />)}
                         {processing ? 'Processing...' : `${activeTab} USDC`}
                    </button>
               </div>
          </div>

          {/* Trophy Case (NFTs) */}
          <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Trophy className="text-amber-500" /> Collection & Rewards
              </h3>
              
              {vaultState.nfts.length === 0 ? (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl h-64 flex flex-col items-center justify-center text-slate-400">
                      <Lock size={40} className="mb-2 opacity-50" />
                      <p className="font-medium">No rewards unlocked yet</p>
                      <p className="text-sm">Deposit $50 to unlock your first NFT!</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {vaultState.nfts.map(nft => (
                          <div key={nft.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex">
                               <div className="w-24 h-24 bg-slate-200 shrink-0">
                                   <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover" />
                               </div>
                               <div className="p-4 flex flex-col justify-center">
                                   <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mb-1 ${
                                       nft.tier === 'GOLD' ? 'bg-amber-100 text-amber-700' : 
                                       nft.tier === 'SILVER' ? 'bg-slate-100 text-slate-700' : 
                                       'bg-orange-100 text-orange-700'
                                   }`}>
                                       {nft.tier} TIER
                                   </div>
                                   <h4 className="font-bold text-slate-800">{nft.name}</h4>
                                   <p className="text-xs text-slate-500">{nft.description}</p>
                               </div>
                          </div>
                      ))}
                      
                      {/* Next Tier Teaser */}
                      <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center p-4 text-center opacity-70">
                          <div>
                              <p className="text-sm font-bold text-slate-500">Next Unlock</p>
                              <p className="text-xs text-slate-400">Keep depositing to reveal</p>
                          </div>
                      </div>
                  </div>
              )}

               <div className="bg-indigo-900 rounded-xl p-6 text-white flex justify-between items-center mt-4">
                  <div>
                      <h4 className="font-bold text-lg">Premium Commuter Status</h4>
                      <p className="text-indigo-200 text-sm">Unlock 10% off all fares with Gold Tier NFT</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Star className="text-yellow-400" fill="currentColor" />
                  </div>
               </div>
          </div>
      </div>
    </div>
  );
};