import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy } from 'lucide-react';

const COLORS = ['#8b5cf6', '#0ea5e9', '#fbbf24', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#84cc16', '#14b8a6'];

export const Results: React.FC = () => {
  const { groups, votes, users, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

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

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-900 flex items-center gap-2">
          <Trophy className="text-ignobel-yellow" size={32} />
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
               <div key={r.id} className={`bg-white p-6 rounded-xl shadow-lg border-t-4 ${idx === 0 ? 'border-ignobel-yellow transform scale-105' : 'border-brand-500'}`}>
                 <div className="text-gray-500 text-sm font-bold uppercase tracking-wide">第 {idx + 1} 名</div>
                 <div className="text-2xl font-bold mt-1 mb-2 leading-tight">{r.name}</div>
                 <div className="text-4xl font-extrabold text-brand-900">{r.votes} <span className="text-lg font-normal text-gray-400">票</span></div>
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