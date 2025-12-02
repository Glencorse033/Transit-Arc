import React, { useState, useEffect } from 'react';
import { generateRoutes } from '../services/geminiService';
import { TransitRoute, Ticket, PaymentLink, WalletState } from '../types';
import { TicketCard } from './TicketCard';
import { MapPin, Bus, Train, Ship, Share2, ArrowRight, Wallet, Check, Copy, Clock, Loader2, ArrowLeft } from 'lucide-react';

interface Props {
  walletState: WalletState;
  onUpdateWallet: (newBalance: number) => void;
  onCreateLink: (link: PaymentLink) => void;
}

export const PassengerDashboard: React.FC<Props> = ({ walletState, onUpdateWallet, onCreateLink }) => {
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [city, setCity] = useState("San Francisco");
  
  const [selectedRoute, setSelectedRoute] = useState<TransitRoute | null>(null);
  const [paymentMode, setPaymentMode] = useState<'SELF' | 'LINK'>('SELF');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [passengerName, setPassengerName] = useState("");
  const [generatedLink, setGeneratedLink] = useState<PaymentLink | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRoutes(city);
  }, []);

  const fetchRoutes = async (cityName: string) => {
    setLoadingRoutes(true);
    const result = await generateRoutes(cityName);
    setRoutes(result);
    setLoadingRoutes(false);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'BUS': return <Bus size={16} />;
      case 'TRAIN': return <Train size={16} />;
      case 'METRO': return <Train size={16} />;
      case 'FERRY': return <Ship size={16} />;
      default: return <Bus size={16} />;
    }
  };

  const handlePaySelf = () => {
    if (!walletState.isConnected) {
      alert("Please connect wallet first!");
      return;
    }
    if (walletState.balance < (selectedRoute?.price || 0)) {
      alert("Insufficient Balance");
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      // Deduct balance
      onUpdateWallet(walletState.balance - (selectedRoute!.price));
      
      // Generate Ticket
      const newTicket: Ticket = {
        id: Math.random().toString(36).substr(2, 9),
        routeId: selectedRoute!.id,
        routeName: selectedRoute!.name,
        passengerName: passengerName || "Self",
        status: 'ACTIVE',
        purchaseDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 3600 * 2000).toISOString(), // 2 hours
        qrData: `TRANSIT-ARC:${selectedRoute!.id}:${Date.now()}`,
        txHash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        imageUrl: selectedRoute!.imageUrl
      };
      
      setTickets([newTicket, ...tickets]);
      setSelectedRoute(null);
      setPassengerName("");
      setProcessing(false);
    }, 2000);
  };

  const handleGenerateLink = () => {
     if (!walletState.isConnected) {
      alert("Please connect wallet to sign the request (even if cost is 0 for generation)");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      const linkId = Math.random().toString(36).substr(2, 9);
      const link: PaymentLink = {
        id: linkId,
        routeId: selectedRoute!.id,
        passengerName: passengerName || "Guest",
        amount: selectedRoute!.price,
        createdAt: Date.now(),
        expiresAt: Date.now() + 86400000, // 24h
        isPaid: false,
        creatorAddress: walletState.address!
      };
      
      onCreateLink(link);
      setGeneratedLink(link);
      setProcessing(false);
    }, 1500);
  };

  const resetSelection = () => {
    setSelectedRoute(null);
    setGeneratedLink(null);
    setPassengerName("");
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Route Selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
             <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <MapPin size={18} className="text-indigo-500"/> Plan Your Trip
             </h2>
             <div className="flex gap-2">
                 <input 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="text-sm border border-slate-300 rounded-md px-3 py-1.5 w-40 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Enter City"
                 />
                 <button onClick={() => fetchRoutes(city)} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors font-medium">
                    Search
                 </button>
             </div>
        </div>

        {!selectedRoute ? (
            <div className="p-4">
                {loadingRoutes ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <Loader2 className="animate-spin text-indigo-500" size={32} />
                        <p className="text-sm text-slate-400">Finding routes for {city}...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {routes.map(route => (
                            <button 
                                key={route.id}
                                onClick={() => setSelectedRoute(route)}
                                className="group relative w-full flex items-center gap-4 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden text-left"
                            >
                                {/* Thumbnail */}
                                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-200 relative">
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"/>
                                    <img 
                                      src={route.imageUrl} 
                                      alt={route.destination} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg text-indigo-600 shadow-sm z-20">
                                        {getIcon(route.type)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight truncate pr-2 group-hover:text-indigo-700 transition-colors">{route.name}</h3>
                                        <span className="shrink-0 font-bold text-lg text-slate-900">{route.price.toFixed(2)} <span className="text-xs font-normal text-slate-500">USDC</span></span>
                                    </div>
                                    
                                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-2">
                                        <span className="truncate max-w-[100px]">{route.origin}</span>
                                        <ArrowRight size={12} className="text-slate-300"/> 
                                        <span className="font-medium text-slate-700 truncate">{route.destination}</span>
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
                                            <Clock size={10} /> {route.schedule}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        ) : (
            // Selected Route View
            <div className="p-0">
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img src={selectedRoute.imageUrl} className="w-full h-full object-cover opacity-60" alt={selectedRoute.destination} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex flex-col justify-end p-6">
                         <button onClick={resetSelection} className="absolute top-4 left-4 text-white/80 hover:text-white flex items-center gap-2 bg-black/20 hover:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-sm transition-all">
                            <ArrowLeft size={14} /> Back
                        </button>
                        <h3 className="text-3xl font-bold text-white mb-1">{selectedRoute.name}</h3>
                        <p className="text-indigo-200 flex items-center gap-2 text-sm font-medium">
                            {selectedRoute.origin} <ArrowRight size={14}/> {selectedRoute.destination}
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                         <div>
                            <p className="text-slate-500 text-sm mb-1">Total Fare</p>
                            <p className="text-3xl font-bold text-slate-900">{selectedRoute.price.toFixed(2)} <span className="text-base font-medium text-slate-500">USDC</span></p>
                         </div>
                         <div className="text-right">
                             <p className="text-slate-500 text-sm mb-1">Frequency</p>
                             <p className="font-medium text-slate-700">{selectedRoute.schedule}</p>
                         </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Passenger Name (Optional)</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                placeholder="e.g. John Doe"
                                value={passengerName}
                                onChange={(e) => setPassengerName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <button 
                                onClick={() => setPaymentMode('SELF')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${paymentMode === 'SELF' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                             >
                                <div className={`p-2 rounded-full ${paymentMode === 'SELF' ? 'bg-indigo-200' : 'bg-slate-100'}`}>
                                    <Wallet size={20} />
                                </div>
                                <span className="font-semibold text-sm">Pay Now</span>
                             </button>
                             <button 
                                onClick={() => setPaymentMode('LINK')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${paymentMode === 'LINK' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                             >
                                <div className={`p-2 rounded-full ${paymentMode === 'LINK' ? 'bg-indigo-200' : 'bg-slate-100'}`}>
                                    <Share2 size={20} />
                                </div>
                                <span className="font-semibold text-sm">Send Link</span>
                             </button>
                        </div>

                        {paymentMode === 'SELF' ? (
                            <button 
                                onClick={handlePaySelf}
                                disabled={processing}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {processing ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                                {processing ? 'Processing Transaction...' : 'Confirm Payment'}
                            </button>
                        ) : (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600">
                                <p className="mb-4">Generate a secure payment link to share via WhatsApp, SMS, or Email. Anyone can pay using their wallet.</p>
                                <button 
                                    onClick={handleGenerateLink}
                                    disabled={processing}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                     {processing ? <Loader2 className="animate-spin" /> : <Share2 size={20} />}
                                     {processing ? 'Generating Link...' : 'Create Payment Link'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Active Tickets */}
      {tickets.length > 0 && (
          <div className="space-y-4 pt-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 px-1">
                  <Clock size={20} className="text-indigo-500" /> My Active Tickets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tickets.map(ticket => (
                      <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};