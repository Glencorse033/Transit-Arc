import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket } from '../types';
import { CheckCircle2, Clock, MapPin } from 'lucide-react';

interface Props {
  ticket: Ticket;
}

export const TicketCard: React.FC<Props> = ({ ticket }) => {
  const isExpired = new Date(ticket.expiryDate).getTime() < Date.now();
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden max-w-sm mx-auto w-full relative group">
      {/* Header Image */}
      <div className="h-24 w-full relative bg-slate-800 overflow-hidden">
        {ticket.imageUrl && (
            <img src={ticket.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Destination" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className={`absolute top-0 left-0 w-full h-1 ${isExpired ? 'bg-gray-400' : 'bg-green-500'}`} />
        
        <div className="absolute bottom-3 left-6 right-6">
            <h3 className="text-lg font-bold text-white leading-tight shadow-sm truncate">{ticket.routeName}</h3>
        </div>
      </div>
      
      <div className="p-6 flex flex-col items-center text-center pt-4">
        <p className="text-slate-500 text-xs uppercase tracking-wide font-semibold mb-4">Passenger: {ticket.passengerName}</p>

        <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-inner mb-6 relative">
          <QRCodeSVG 
            value={ticket.qrData} 
            size={160} 
            level="H"
            fgColor={isExpired ? "#94a3b8" : "#0f172a"}
          />
          {/* Logo overlay on QR */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
             </div>
          </div>
        </div>

        <div className="w-full space-y-3">
          <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
            <span className="text-slate-400 flex items-center gap-1"><Clock size={14} /> Status</span>
            <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
              isExpired 
                ? 'bg-gray-100 text-gray-500' 
                : 'bg-green-100 text-green-700'
            }`}>
              {isExpired ? 'EXPIRED' : 'VALID'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
             <span className="text-slate-400">Expires</span>
             <span className="text-slate-700 font-medium">
               {new Date(ticket.expiryDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span>
          </div>
           <div className="flex justify-between items-center text-sm">
             <span className="text-slate-400">Tx Hash</span>
             <a href="#" className="text-indigo-500 text-xs hover:underline truncate w-32 text-right">
               {ticket.txHash}
             </a>
          </div>
        </div>
      </div>
      
      {/* Decorative Circles */}
      <div className="absolute top-[90px] -left-3 w-6 h-6 bg-slate-50 rounded-full z-10" />
      <div className="absolute top-[90px] -right-3 w-6 h-6 bg-slate-50 rounded-full z-10" />
    </div>
  );
};