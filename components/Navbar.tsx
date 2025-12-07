import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { LogOut, PieChart, Users, Vote, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useApp();
  const location = useLocation();

  if (!currentUser) return null;

  const isAdminOrTeacher = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.TEACHER;

  const isActive = (path: string) => location.pathname === path ? "bg-ignobel-yellow text-black" : "text-white hover:bg-white/10";

  return (
    <nav className="bg-brand-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-ignobel-yellow to-brand-500">
              搞笑諾貝爾
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/vote" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${isActive('/vote')}`}>
              <Vote size={18} />
              <span>評分投票</span>
            </Link>

            {isAdminOrTeacher && (
              <>
                <Link to="/results" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${isActive('/results')}`}>
                  <PieChart size={18} />
                  <span>投票結果</span>
                </Link>
                <Link to="/admin" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${isActive('/admin')}`}>
                  <Settings size={18} />
                  <span>投票管理</span>
                </Link>
              </>
            )}

            <div className="ml-4 flex items-center space-x-3 border-l border-white/20 pl-4">
              <div className="text-xs text-right hidden sm:block">
                <div className="font-bold">{currentUser.name}</div>
                <div className="text-white/70">
                  {currentUser.role === UserRole.ADMIN && '管理員'}
                  {currentUser.role === UserRole.TEACHER && '教師/助教'}
                  {currentUser.role === UserRole.STUDENT && '學生'}
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-2 rounded-full hover:bg-red-500/20 text-red-300 hover:text-red-100 transition-colors"
                title="登出"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};