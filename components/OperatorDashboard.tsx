import React, { useEffect, useState } from 'react';
import { generateAnalytics } from '../services/geminiService';
import { AnalyticsData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Wallet, Activity, ScanLine, Loader2, Globe, Server, CheckCircle2 } from 'lucide-react';

export const OperatorDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'scanner' | 'network'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      const result = await generateAnalytics();
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="animate-spin mb-2" />
            <p>Loading analytics...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-slate-500">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-slate-900">${data.totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <Wallet size={20} />
                    </div>
                </div>
                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp size={12} /> +12% from last week
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-slate-500">Active Riders</p>
                        <h3 className="text-2xl font-bold text-slate-900">{data.activeRiders}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Users size={20} />
                    </div>
                </div>
                 <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                    <Activity size={12} /> Currently on transit
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 md:col-span-1 cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => setActiveTab('scanner')}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-slate-500">Validator</p>
                        <h3 className="text-lg font-bold text-slate-900">Scan Ticket</h3>
                    </div>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <ScanLine size={20} />
                    </div>
                </div>
                <p className="mt-2 text-xs text-slate-400">Open scanner tool</p>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200 overflow-x-auto">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`pb-2 text-sm font-medium whitespace-nowrap ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('scanner')}
                className={`pb-2 text-sm font-medium whitespace-nowrap ${activeTab === 'scanner' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
            >
                Ticket Validator
            </button>
            <button 
                onClick={() => setActiveTab('network')}
                className={`pb-2 text-sm font-medium whitespace-nowrap ${activeTab === 'network' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
            >
                Network Status
            </button>
        </div>

        {activeTab === 'overview' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-4">Revenue Trend (7 Days)</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.dailyRevenue}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} prefix="$" />
                                <Tooltip />
                                <Area type="monotone" dataKey="amount" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                     <h4 className="font-semibold text-slate-800 mb-4">Top Routes</h4>
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={data.popularRoutes}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="ticketsSold" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                     </div>
                </div>
            </div>
        )}
        
        {activeTab === 'scanner' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-64 h-64 bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                     <div className="absolute inset-0 border-2 border-green-400 opacity-50 m-8 rounded-lg animate-pulse"></div>
                     <div className="w-full h-1 bg-red-500 absolute top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                     <ScanLine className="text-white opacity-20" size={64} />
                     <p className="absolute bottom-4 text-white text-xs font-mono">CAMERA FEED SIMULATION</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Scan Ticket QR</h3>
                    <p className="text-slate-500 text-sm">Point the camera at a passenger's ticket to validate.</p>
                </div>
                <div className="flex gap-2 w-full max-w-md mt-4">
                     <input type="text" placeholder="Or enter Ticket Hash manually" className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                     <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Validate</button>
                </div>
            </div>
        )}

        {activeTab === 'network' && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Arc Network Deployment</h3>
                        <p className="text-sm text-slate-500">Smart Contract status and configuration</p>
                    </div>
                    <div className="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        LIVE
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-2">Core Contract</p>
                            <div className="flex justify-between items-center">
                                <span className="font-mono text-sm text-slate-700">0x71C...9A23</span>
                                <CheckCircle2 size={16} className="text-green-500" />
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-2">Vault Contract</p>
                             <div className="flex justify-between items-center">
                                <span className="font-mono text-sm text-slate-700">0xB4F...22E1</span>
                                <CheckCircle2 size={16} className="text-green-500" />
                            </div>
                        </div>
                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-2">USDC Bridge (Arc)</p>
                             <div className="flex justify-between items-center">
                                <span className="font-mono text-sm text-slate-700">0x88A...11B2</span>
                                <CheckCircle2 size={16} className="text-green-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-slate-400 p-4 rounded-lg font-mono text-xs overflow-hidden relative">
                         <div className="absolute top-2 right-2 text-slate-600">
                            <Server size={16} />
                         </div>
                         <p className="text-green-400 mb-2">$ status check --network arc-mainnet</p>
                         <div className="space-y-1">
                            <p>> Connecting to RPC https://rpc.arc.network...</p>
                            <p>> Chain ID: 1111</p>
                            <p>> Block Height: 12,450,231</p>
                            <p>> Gas Price: 0.000002 ARC</p>
                            <p>> Sync Status: 100%</p>
                            <p className="text-indigo-400">All systems operational.</p>
                         </div>
                    </div>
                </div>
             </div>
        )}
    </div>
  );
};