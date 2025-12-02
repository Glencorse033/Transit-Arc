import React, { useState } from 'react';
import { PaymentLink, WalletState } from '../types';
import { WalletButton } from './WalletButton';
import { Wallet, CheckCircle2, ArrowRight, Loader2, User } from 'lucide-react';

interface Props {
  linkId: string | null;
  walletState: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  availableLinks: PaymentLink[];
  onPay: (linkId: string) => void;
  onClose: () => void;
}

export const PaymentLinkView: React.FC<Props> = ({ 
  linkId: initialLinkId, 
  walletState, 
  onConnect, 
  onDisconnect, 
  availableLinks,
  onPay,
  onClose
}) => {
  const [inputId, setInputId] = useState(initialLinkId || "");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const targetLink = availableLinks.find(l => l.id === inputId);

  const handlePay = () => {
    if (!targetLink) return;
    if (walletState.balance < targetLink.amount) {
        alert("Insufficient Balance");
        return;
    }

    setProcessing(true);
    setTimeout(() => {
        onPay(targetLink.id);
        setProcessing(false);
        setSuccess(true);
    }, 2500);
  };

  if (success) {
      return (
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center animate-in zoom-in-95">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
              <p className="text-slate-600 mb-6">
                  The ticket has been sent to the passenger. You can close this window.
              </p>
              <button onClick={onClose} className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium">
                  Return Home
              </button>
          </div>
      );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-sm mb-4">
            ← Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
            <div className="bg-indigo-600 p-6 text-white text-center">
                <h2 className="text-2xl font-bold">Pay for a Trip</h2>
                <p className="opacity-80">Securely pay via Transit Arc</p>
            </div>

            <div className="p-8">
                {!targetLink ? (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">Enter Payment Link ID</label>
                        <div className="flex gap-2">
                            <input 
                                value={inputId}
                                onChange={(e) => setInputId(e.target.value)}
                                placeholder="e.g. x7z9q2"
                                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button className="bg-slate-100 px-4 rounded-lg font-medium text-slate-600">
                                Find
                            </button>
                        </div>
                        <p className="text-xs text-slate-400">Try generating a link in the passenger view first.</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-8">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200">
                                <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Passenger</p>
                                    <p className="font-semibold text-slate-900">{targetLink.passengerName}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600">Total Fare</span>
                                <span className="text-2xl font-bold text-slate-900">{targetLink.amount} USDC</span>
                            </div>
                        </div>

                        {!walletState.isConnected ? (
                             <div className="text-center space-y-3">
                                <p className="text-sm text-slate-500">Connect your wallet to pay this fare.</p>
                                <div className="flex justify-center">
                                    <WalletButton walletState={walletState} onConnect={onConnect} onDisconnect={onDisconnect} />
                                </div>
                             </div>
                        ) : (
                            <button 
                                onClick={handlePay}
                                disabled={processing}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                            >
                                {processing ? <Loader2 className="animate-spin" /> : <Wallet size={20} />}
                                {processing ? 'Processing Payment...' : `Pay ${targetLink.amount} USDC`}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};