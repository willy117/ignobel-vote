import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Sparkles, Timer, PartyPopper } from 'lucide-react';

const COLORS = ['#8b5cf6', '#0ea5e9', '#fbbf24', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#84cc16', '#14b8a6'];

export const Results: React.FC = () => {
  const { groups, votes, users, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  
  // View State: 'hidden' (waiting), 'counting' (3-2-1), 'revealed' (show data)
  const [viewState, setViewState] = useState<'hidden' | 'counting' | 'revealed'>('hidden');
  const [countdown, setCountdown] = useState(3);

  // Security check
  if (!currentUser || (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.TEACHER)) {
    return <div className="p-8 text-red-500">權限不足。僅限管理員與教師進入。</div>;
  }

  // 1. Calculate raw votes mapped by Group ID
  const voteMap = useMemo(() => {
    const map: {[key: string]: number} = {};
    groups.forEach(g => map[g.id] = 0);
    
    votes.forEach(v => {
      v.allocations.forEach(a => {
        if (map[a.groupId] !== undefined) {
          map[a.groupId] += a.count;
        }
      });
    });
    return map;
  }, [groups, votes]);

  // 2. Data for Chart: Sorted by Group ID (1, 2, 3...)
  const chartData = useMemo(() => {
    return groups
      .map(g => ({
        id: g.id,
        name: g.title,
        shortName: `第 ${g.id} 組`,
        votes: voteMap[g.id] || 0
      }))
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [groups, voteMap]);

  // 3. Data for Top Cards: Sorted by Votes (High to Low)
  const topPerformers = useMemo(() => {
    return [...chartData].sort((a, b) => b.votes - a.votes);
  }, [chartData]);

  // 4. Sorted Groups for Table Columns (1, 2, 3...)
  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [groups]);

  // Handle Reveal Animation
  const startReveal = () => {
    setViewState('counting');
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (viewState === 'counting') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        setViewState('revealed');
      }
    }
    return () => clearTimeout(timer);
  }, [viewState, countdown]);

  // --- RENDER: 1. Waiting Screen ---
  if (viewState === 'hidden') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-b from-brand-900 to-brand-700 text-white rounded-xl shadow-2xl p-8 m-4">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 animate-pulse"></div>
          <Trophy size={120} className="text-ignobel-yellow relative z-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-center tracking-tight">
          投票結果即將揭曉
        </h1>
        <p className="text-xl text-brand-100 mb-12 text-center max-w-2xl">
          所有評分數據已收集完畢。準備好揭曉票數囉！
        </p>
        <button 
          onClick={startReveal}
          className="group relative px-8 py-4 bg-ignobel-yellow text-brand-900 text-2xl font-bold rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] hover:scale-105 transition-all duration-300 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-3">
            <Sparkles className="animate-spin-slow" />
            揭曉結果
            <Sparkles className="animate-spin-slow" />
          </span>
          <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </div>
    );
  }

  // --- RENDER: 2. Countdown Screen ---
  if (viewState === 'counting') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-brand-900 text-white rounded-xl m-4">
        <div className="text-[12rem] md:text-[20rem] font-black text-ignobel-yellow animate-bounce drop-shadow-2xl">
          {countdown > 0 ? countdown : "GO!"}
        </div>
        <div className="mt-8 flex items-center gap-2 text-2xl text-brand-200">
          <Timer className="animate-spin" />
          <span>正在計算票數...</span>
        </div>
      </div>
    );
  }

  // --- RENDER: 3. Actual Results Dashboard (Restored original content with fade-in) ---
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-[fadeIn_1s_ease-out]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900 flex items-center gap-2">
          <PartyPopper className="text-ignobel-yellow animate-bounce" size={32} />
          投票結果儀表板
        </h1>
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-white shadow text-brand-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            總覽
          </button>
          <button 
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'details' ? 'bg-white shadow text-brand-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            投票細節
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top Cards (Ranked by Votes) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {topPerformers.slice(0, 3).map((r, idx) => (
               <div key={r.id} className={`bg-white p-6 rounded-xl shadow-lg border-t-4 transition-all duration-700 hover:scale-105 ${idx === 0 ? 'border-ignobel-yellow transform scale-105 ring-4 ring-ignobel-yellow/20' : 'border-brand-500'}`}>
                 <div className="flex justify-between items-start">
                    <div className="text-gray-500 text-sm font-bold uppercase tracking-wide">第 {idx + 1} 名</div>
                    {idx === 0 && <Trophy className="text-ignobel-yellow" size={24} />}
                 </div>
                 <div className="text-2xl font-bold mt-2 mb-2 leading-tight text-gray-800">{r.name}</div>
                 <div className="flex items-baseline gap-2">
                    <div className="text-5xl font-extrabold text-brand-900">{r.votes}</div>
                    <span className="text-lg font-normal text-gray-400">票</span>
                 </div>
               </div>
             ))}
          </div>

          {/* Chart (Sorted by Group ID) */}
          <div className="bg-white p-6 rounded-xl shadow-md h-96">
            <h3 className="text-lg font-bold text-gray-700 mb-4">得票分佈 (依組別順序)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="shortName" />
                <YAxis />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">投票人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">身分</th>
                  {/* Columns sorted by Group ID */}
                  {sortedGroups.map(g => (
                    <th key={g.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      {g.id} 組
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {votes.map((vote, idx) => {
                  const voter = users.find(u => u.id === vote.userId);
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{voter?.name || vote.userId}</div>
                        <div className="text-xs text-gray-500">{voter?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${voter?.role === UserRole.TEACHER ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {voter?.role === UserRole.TEACHER ? '教師' : (voter?.role === UserRole.ADMIN ? '管理員' : '學生')}
                        </span>
                      </td>
                      {sortedGroups.map(g => {
                         const alloc = vote.allocations.find(a => a.groupId === g.id);
                         const val = alloc ? alloc.count : 0;
                         return (
                           <td key={g.id} className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono font-bold text-gray-700">
                             {val > 0 ? val : '-'}
                           </td>
                         );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};