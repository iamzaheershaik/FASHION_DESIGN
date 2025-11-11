import React, { useState } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/GeneratedContent';
import { Studio } from './components/PromptBuilder';
import type { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'studio'>('landing');

  const handleSignIn = () => {
    // This is a mock sign-in for UI purposes
    if (user) {
      setUser(null);
    } else {
      // Log in as a special "Admin Creator" user
      const newUser: User = { 
        name: 'Admin Creator', 
        avatarUrl: `https://i.pravatar.cc/150?u=admincreator`,
        role: 'admin' 
      };
      setUser(newUser);
      // Automatically navigate to studio on sign in if on landing page
      if (view === 'landing') {
         setView('studio');
      }
    }
  };
  
  const navigateToStudio = () => {
    setView('studio');
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200">
      <Header user={user} onSignIn={handleSignIn} />
      <main>
        {view === 'landing' ? (
          <LandingPage onTryForFree={navigateToStudio} />
        ) : (
          <Studio user={user} />
        )}
      </main>
      <footer className="text-center py-6 mt-8 border-t border-slate-800">
        <p className="text-slate-500 text-sm">Powered by Gemini AI. The Future of Textile Design.</p>
      </footer>
    </div>
  );
};

export default App;