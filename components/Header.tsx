import React from 'react';
import type { User } from '../types';
import { GoogleIcon } from './icons/GoogleIcon';

interface HeaderProps {
  user: User | null;
  onSignIn: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSignIn }) => {
  return (
    <header className="bg-white sticky top-0 z-50 border-b-3 border-neo-black">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="bg-neo-black text-neo-yellow p-1.5 border-2 border-neo-black shadow-neo-sm transform -rotate-3">
             <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
             </svg>
          </div>
          <span className="text-2xl font-display font-bold text-neo-black tracking-tight">FashionAI <span className="bg-neo-pink text-neo-black text-xs px-2 py-1 border-2 border-neo-black shadow-neo-sm font-bold uppercase ml-1 -rotate-2 inline-block">Atelier</span></span>
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-neo-black font-display">{user.name}</p>
                  {user.role === 'admin' && (
                    <span className="text-[10px] font-black bg-neo-yellow px-1 border border-neo-black">LEAD DESIGNER</span>
                  )}
              </div>
              <img src={user.avatarUrl} alt="User Avatar" className="w-10 h-10 border-2 border-neo-black shadow-neo-sm" />
              <button
                onClick={onSignIn}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neo-black border-2 border-transparent hover:bg-neo-black hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 bg-white text-neo-black font-bold px-5 py-2 border-2 border-neo-black shadow-neo hover:translate-y-1 hover:shadow-neo-hover transition-all text-sm"
            >
              <GoogleIcon className="w-4 h-4" />
              Sign in
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};