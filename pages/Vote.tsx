import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { CheckCircle, Minus, Plus, AlertCircle } from 'lucide-react';

export const Vote: React.FC = () => {
  const { currentUser, groups, users, submitVote } = useApp();
  const [allocations, setAllocations] = useState<{ [groupId: string]: number }>({});
  
  // Initialize allocations to 0
  useEffect(() => {
    const initial: { [key: string]: number } = {};
    groups.forEach(g => initial[g.id] = 0);
    setAllocations(initial);
  }, [groups]);

  // Sort groups by ID naturally (1, 2, 3... 10)
  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => {
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });
  }, [groups]);

  if (!currentUser) return <div>請先登入</div>;
  if (currentUser.hasVoted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle size={80} className="text-green-500 mb-4" />
        <h2 className="text-3xl font-bold text-gray-800">投票已完成！</h2>
        <p className="text-gray-600 mt-2">感謝您參與搞笑諾貝爾的評審。</p>
        <p className="text-sm text-gray-500 mt-8">請等待開票結果。</p>
      </div>
    );
  }

  const maxVotes = currentUser.role === UserRole.STUDENT ? 3 : 6;
  const currentTotal = Object.values(allocations).reduce((a: number, b: number) => a + b, 0);
  const remainingVotes = maxVotes - currentTotal;
  const roleName = currentUser.role === UserRole.STUDENT ? '學生' : (currentUser.role === UserRole.TEACHER ? '教師/助教' : '管理員');

  const handleAdjust = (groupId: string, delta: number) => {
    const current = allocations[groupId] || 0;
    if (delta > 0 && remainingVotes <= 0) return; // Cannot add if no votes left
    if (delta < 0 && current <= 0) return; // Cannot subtract below 0
    
    setAllocations(prev => ({
      ...prev,
      [groupId]: current + delta
    }));
  };

  const handleSubmit = () => {
    if (remainingVotes !== 0) return;
    const submission = Object.entries(allocations)
      .filter(([_, count]: [string, number]) => count > 0)
      .map(([groupId, count]) => ({ groupId, count }));
    submitVote(submission);
  };

  // Helper to get members from User list, falling back to manual group members if none found
  const getGroupMembers = (groupId: string, fallbackMembers: string[]) => {
    const linkedUsers = users.filter(u => u.groupId === groupId).map(u => u.name);
    return linkedUsers.length > 0 ? linkedUsers : fallbackMembers;
  };

  return (
    <div className="pb-32 px-4 pt-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-900">進行評分投票</h1>
        <p className="text-gray-600">
          您的投票身分是 <span className="font-bold text-brand-600">{roleName}</span>。 
          您總共有 <span className="font-bold text-lg text-ignobel-red">{maxVotes}</span> 票。
          <br/>
          <span className="text-sm text-gray-500">* 請將手上的票全部投完，您可以自由分配票數（不限一組一票）。</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedGroups.map(group => {
          const isOwnGroup = currentUser.role === UserRole.STUDENT && currentUser.groupId === group.id;
          const votes = allocations[group.id] || 0;
          const members = getGroupMembers(group.id, group.members);

          return (
            <div key={group.id} className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all ${votes > 0 ? 'border-ignobel-yellow ring-2 ring-ignobel-yellow/20' : 'border-transparent'}`}>
              <div className="h-48 overflow-hidden relative">
                 <img src={group.imageUrl} alt={group.title} className="w-full h-full object-cover" />
                 {isOwnGroup && (
                   <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
                     <span className="text-white font-bold bg-red-500 px-3 py-1 rounded-full text-sm">您的組別</span>
                   </div>
                 )}
                 {votes > 0 && (
                   <div className="absolute top-2 right-2 bg-ignobel-yellow text-black font-bold w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg animate-bounce">
                     {votes}
                   </div>
                 )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">{group.title}</h3>
                  <span className="text-xs font-mono text-gray-400">#{group.id}</span>
                </div>
                
                <div className="text-sm text-gray-500 mb-6">
                  組員：{members.join('、')}
                </div>

                {isOwnGroup ? (
                  <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-500 text-sm italic">
                    學生不能投給自己參與的組別。加油！
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <button 
                      onClick={() => handleAdjust(group.id, -1)}
                      disabled={votes === 0}
                      className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                    
                    <span className="text-2xl font-bold text-brand-900 w-12 text-center">
                      {votes}
                    </span>

                    <button 
                      onClick={() => handleAdjust(group.id, 1)}
                      disabled={remainingVotes === 0}
                      className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-md hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">剩餘票數：</span>
            <div className="flex space-x-1">
              {Array.from({ length: maxVotes }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full ${i < currentTotal ? 'bg-gray-300' : 'bg-ignobel-yellow animate-pulse'}`}
                />
              ))}
            </div>
            <span className="font-mono font-bold text-xl ml-2">{remainingVotes}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={remainingVotes !== 0}
            className={`w-full sm:w-auto px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all flex items-center justify-center space-x-2
              ${remainingVotes === 0 
                ? 'bg-gradient-to-r from-ignobel-purple to-brand-600 text-white hover:scale-105' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {remainingVotes === 0 ? (
               <><span>送出投票結果</span><CheckCircle size={20}/></>
            ) : (
               <><span>請分配完剩餘 {remainingVotes} 票</span><AlertCircle size={20}/></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};