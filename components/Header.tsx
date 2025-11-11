import React from 'react';
import type { User } from '../types';
import { GoogleIcon } from './icons/GoogleIcon';

interface HeaderProps {
  user: User | null;
  onSignIn: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSignIn }) => {
  return (
    <header className="bg-slate-900/70 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-800">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <span className="text-xl font-bold text-white">FashionAI Designer</span>
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-300">{user.name}</span>
              {user.role === 'admin' && (
                 <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">ADMIN</span>
              )}
              <img src={user.avatarUrl} alt="User Avatar" className="w-9 h-9 rounded-full border-2 border-slate-600" />
              <button
                onClick={onSignIn}
                className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-800 rounded-md hover:bg-slate-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 bg-white text-slate-800 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-slate-200 transition-colors duration-200"
            >
              <GoogleIcon className="w-5 h-5" />
              Sign in with Google
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};