import React, { useState } from 'react';
import { Wallet, Loader2, LogOut, Network } from 'lucide-react';
import { WalletState } from '../types';

interface Props {
  walletState: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletButton: React.FC<Props> = ({ walletState, onConnect, onDisconnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate delay and network switch
    setTimeout(() => {
      onConnect();
      setIsConnecting(false);
    }, 1500);
  };

  if (walletState.isConnected) {
    return (
      <div className="flex items-center gap-2">
        {/* Network Badge */}
        <div className="hidden md:flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-100 mr-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            Arc Network
        </div>

        <div className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm border border-slate-700">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse md:hidden" />
            <span>{walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}</span>
            <span className="text-slate-400 mx-1">|</span>
            <span className="text-blue-300">{walletState.balance} USDC</span>
            <button 
            onClick={onDisconnect}
            className="ml-2 hover:bg-slate-700 p-1 rounded-full transition-colors"
            >
            <LogOut size={14} />
            </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
      {isConnecting ? 'Connect to Arc' : 'Connect Wallet'}
    </button>
  );
};