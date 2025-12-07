import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';

export const Login: React.FC = () => {
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(id, email);
    if (success) {
      navigate('/vote');
    } else {
      setError('學號(員工編號) 或 E-MAIL 錯誤，請檢查您的驗證資訊。');
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-[1.01]">
        <div className="flex justify-center mb-6">
          <div className="bg-ignobel-yellow p-4 rounded-full shadow-lg">
            <FlaskConical size={48} className="text-brand-900" />
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-center text-brand-900 mb-2">
          搞笑諾貝爾
        </h2>
        <p className="text-center text-gray-500 mb-8">課堂期末報告互評系統</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">學號 / 員工編號</label>
            <input
              type="text"
              id="id"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="請輸入 ID"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-MAIL / 驗證碼</label>
            <input
              type="text"
              id="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="請輸入 Email"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
          >
            進入投票大廳
          </button>
        </form>
      </div>
    </div>
  );
};