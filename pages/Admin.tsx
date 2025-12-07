import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole, Group } from '../types';
import { Plus, Trash2, Users, Layers, AlertTriangle, Edit2, X, Save } from 'lucide-react';

export const Admin: React.FC = () => {
  const { users, groups, currentUser, addUser, updateUser, removeUser, addGroup, updateGroup, removeGroup, resetVotes } = useApp();
  const [activeSection, setActiveSection] = useState<'users' | 'groups'>('groups');
  
  // Form States
  const [newUser, setNewUser] = useState<Partial<User>>({ role: UserRole.STUDENT });
  const [isEditingUser, setIsEditingUser] = useState(false);

  const [newGroup, setNewGroup] = useState<Partial<Group>>({ members: [] });
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [tempMember, setTempMember] = useState('');

  if (!currentUser || (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.TEACHER)) {
    return <div>存取被拒 (Access Denied)</div>;
  }

  // Sort groups by ID naturally (1, 2, 3...)
  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [groups]);

  // --- User Handlers ---

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.id && newUser.email && newUser.name) {
      const userData = { 
        id: newUser.id, 
        email: newUser.email, 
        name: newUser.name, 
        role: newUser.role as UserRole, 
        groupId: newUser.groupId,
        hasVoted: isEditingUser ? (users.find(u => u.id === newUser.id)?.hasVoted || false) : false 
      };

      if (isEditingUser) {
        updateUser(userData);
        setIsEditingUser(false);
      } else {
        addUser(userData);
      }
      
      setNewUser({ role: UserRole.STUDENT, id: '', email: '', name: '', groupId: '' });
    }
  };

  const handleEditUserClick = (user: User) => {
    setNewUser({ ...user });
    setIsEditingUser(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditUser = () => {
    setIsEditingUser(false);
    setNewUser({ role: UserRole.STUDENT, id: '', email: '', name: '', groupId: '' });
  };

  // --- Group Handlers ---

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroup.id && newGroup.title) {
      const groupData: Group = {
        id: newGroup.id,
        title: newGroup.title,
        members: newGroup.members || [],
        imageUrl: newGroup.imageUrl || 'https://picsum.photos/600/400'
      };

      if (isEditingGroup) {
        updateGroup(groupData);
        setIsEditingGroup(false);
      } else {
        addGroup(groupData);
      }

      setNewGroup({ id: '', title: '', members: [], imageUrl: '' });
    }
  };

  const handleEditGroupClick = (group: Group) => {
    setNewGroup({ ...group });
    setIsEditingGroup(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditGroup = () => {
    setIsEditingGroup(false);
    setNewGroup({ id: '', title: '', members: [], imageUrl: '' });
  };

  const addMemberToGroupDraft = () => {
    if (tempMember) {
      setNewGroup(prev => ({ ...prev, members: [...(prev.members || []), tempMember] }));
      setTempMember('');
    }
  };

  const removeMemberFromDraft = (index: number) => {
    setNewGroup(prev => ({
      ...prev,
      members: prev.members?.filter((_, i) => i !== index)
    }));
  };

  // Helper to get members from User list
  const getGroupMembers = (groupId: string, fallbackMembers: string[]) => {
    const linkedUsers = users.filter(u => u.groupId === groupId).map(u => u.name);
    return linkedUsers.length > 0 ? linkedUsers : fallbackMembers;
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">系統管理</h1>
        <button 
          onClick={() => { if(window.confirm('確定要重置所有人的投票紀錄嗎？此動作無法復原。')) resetVotes(); }}
          className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-bold"
        >
          <AlertTriangle size={16} />
          <span>重置所有投票</span>
        </button>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveSection('groups')}
          className={`pb-4 px-2 flex items-center space-x-2 border-b-2 transition-colors ${activeSection === 'groups' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Layers size={20} />
          <span>投票內容 (組別)</span>
        </button>
        <button
          onClick={() => setActiveSection('users')}
          className={`pb-4 px-2 flex items-center space-x-2 border-b-2 transition-colors ${activeSection === 'users' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={20} />
          <span>投票人員管理</span>
        </button>
      </div>

      {activeSection === 'groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add/Edit Group Form */}
          <div className={`bg-white p-6 rounded-lg shadow-md h-fit transition-all ${isEditingGroup ? 'ring-2 ring-ignobel-yellow' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{isEditingGroup ? '編輯組別' : '新增組別'}</h3>
              {isEditingGroup && (
                <button onClick={handleCancelEditGroup} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              )}
            </div>

            <form onSubmit={handleGroupSubmit} className="space-y-4">
              <input 
                type="text" placeholder="組別代號 (例如：g5)" 
                className={`w-full border p-2 rounded ${isEditingGroup ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={newGroup.id || ''} onChange={e => setNewGroup({...newGroup, id: e.target.value})}
                required
                readOnly={isEditingGroup}
                title={isEditingGroup ? "編輯模式下無法修改組別代號" : ""}
              />
              <input 
                type="text" placeholder="報告題目" 
                className="w-full border p-2 rounded"
                value={newGroup.title || ''} onChange={e => setNewGroup({...newGroup, title: e.target.value})}
                required
              />
              <input 
                type="text" placeholder="投影片首頁圖片連結 (URL)" 
                className="w-full border p-2 rounded"
                value={newGroup.imageUrl || ''} onChange={e => setNewGroup({...newGroup, imageUrl: e.target.value})}
              />
              
              <div>
                <div className="flex gap-2">
                  <input 
                    type="text" placeholder="新增組員姓名 (僅顯示用，建議由人員管理設定)" 
                    className="w-full border p-2 rounded text-sm"
                    value={tempMember} onChange={e => setTempMember(e.target.value)}
                  />
                  <button type="button" onClick={addMemberToGroupDraft} className="bg-gray-200 p-2 rounded hover:bg-gray-300"><Plus size={16}/></button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {newGroup.members?.map((m, i) => (
                    <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                      {m}
                      <button type="button" onClick={() => removeMemberFromDraft(i)} className="hover:text-red-500"><X size={10}/></button>
                    </span>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className={`w-full py-2 rounded font-bold text-white flex justify-center items-center gap-2 ${isEditingGroup ? 'bg-ignobel-yellow text-black hover:bg-yellow-500' : 'bg-brand-600 hover:bg-brand-700'}`}
              >
                 {isEditingGroup ? <><Save size={18}/> 儲存組別</> : <><Plus size={18}/> 建立組別</>}
              </button>
            </form>
          </div>

          {/* Group List */}
          <div className="lg:col-span-2 space-y-4">
            {sortedGroups.map(g => {
              const members = getGroupMembers(g.id, g.members);
              const isEditingThis = isEditingGroup && newGroup.id === g.id;
              
              return (
                <div key={g.id} className={`bg-white p-4 rounded-lg shadow border-l-4 ${isEditingThis ? 'border-ignobel-yellow bg-yellow-50' : 'border-brand-500'} flex justify-between items-center`}>
                  <div className="flex gap-4 items-center">
                    <img src={g.imageUrl} alt="" className="w-16 h-16 object-cover rounded bg-gray-200" />
                    <div>
                      <h4 className="font-bold text-lg">{g.title} <span className="text-sm font-mono text-gray-400">({g.id})</span></h4>
                      <p className="text-sm text-gray-600">組員：{members.join('、')}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                     <button 
                       onClick={() => handleEditGroupClick(g)} 
                       className="text-brand-600 hover:text-brand-900 p-2"
                       disabled={isEditingGroup && newGroup.id !== g.id}
                     >
                       <Edit2 size={20} />
                     </button>
                     <button 
                       onClick={() => removeGroup(g.id)} 
                       className="text-red-400 hover:text-red-600 p-2"
                       disabled={isEditingGroup}
                     >
                       <Trash2 size={20} />
                     </button>
                  </div>
                </div>
              );
            })}
            {groups.length === 0 && <div className="text-center text-gray-500 py-8">尚未新增任何組別。</div>}
          </div>
        </div>
      )}

      {activeSection === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Add/Edit User Form */}
           <div className={`bg-white p-6 rounded-lg shadow-md h-fit transition-all ${isEditingUser ? 'ring-2 ring-ignobel-yellow' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{isEditingUser ? '編輯人員' : '新增投票人員'}</h3>
              {isEditingUser && (
                <button onClick={handleCancelEditUser} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              )}
            </div>
            
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <select 
                className="w-full border p-2 rounded"
                value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
              >
                <option value={UserRole.STUDENT}>學生</option>
                <option value={UserRole.TEACHER}>教師/助教</option>
                <option value={UserRole.ADMIN}>管理員</option>
              </select>
              
              <input 
                type="text" placeholder="學號 / 員工編號" 
                className={`w-full border p-2 rounded ${isEditingUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={newUser.id || ''} onChange={e => setNewUser({...newUser, id: e.target.value})}
                required
                readOnly={isEditingUser}
                title={isEditingUser ? "編輯模式下無法修改編號" : ""}
              />
              <input 
                type="email" placeholder="E-MAIL" 
                className="w-full border p-2 rounded"
                value={newUser.email || ''} onChange={e => setNewUser({...newUser, email: e.target.value})}
                required
              />
              <input 
                type="text" placeholder="姓名" 
                className="w-full border p-2 rounded"
                value={newUser.name || ''} onChange={e => setNewUser({...newUser, name: e.target.value})}
                required
              />

              {newUser.role === UserRole.STUDENT && (
                <select 
                  className="w-full border p-2 rounded"
                  value={newUser.groupId || ''} onChange={e => setNewUser({...newUser, groupId: e.target.value})}
                >
                  <option value="">-- 指定組別 (選填) --</option>
                  {/* Sorted Group Options */}
                  {sortedGroups.map(g => <option key={g.id} value={g.id}>{g.id} - {g.title}</option>)}
                </select>
              )}

              <button 
                type="submit" 
                className={`w-full py-2 rounded font-bold text-white flex justify-center items-center gap-2 ${isEditingUser ? 'bg-ignobel-yellow text-black hover:bg-yellow-500' : 'bg-brand-600 hover:bg-brand-700'}`}
              >
                {isEditingUser ? <><Save size={18}/> 儲存變更</> : <><Plus size={18}/> 新增人員</>}
              </button>
            </form>
          </div>

          {/* User List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">人員</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">組別</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                    <th className="relative px-6 py-3 text-right"><span className="sr-only">操作</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(u => (
                    <tr key={u.id} className={isEditingUser && newUser.id === u.id ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.id} | {u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {u.role === UserRole.STUDENT ? '學生' : (u.role === UserRole.TEACHER ? '教師/助教' : '管理員')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {u.groupId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.hasVoted 
                          ? <span className="text-green-600 text-xs font-bold">已投票</span> 
                          : <span className="text-gray-400 text-xs">未投票</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleEditUserClick(u)} 
                          className="text-brand-600 hover:text-brand-900"
                          disabled={isEditingUser && newUser.id !== u.id}
                        >
                          <Edit2 size={16}/>
                        </button>
                        <button 
                          onClick={() => removeUser(u.id)} 
                          className="text-red-600 hover:text-red-900"
                          disabled={isEditingUser}
                        >
                          <Trash2 size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};