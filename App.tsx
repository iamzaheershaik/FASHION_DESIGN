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
    <div className="min-h-screen bg-neo-bg font-sans text-neo-black pattern-grid-lg">
      <Header user={user} onSignIn={handleSignIn} />
      <main className="pb-20">
        {view === 'landing' ? (
          <LandingPage onTryForFree={navigateToStudio} />
        ) : (
          <Studio user={user} />
        )}
      </main>
      <footer className="text-center py-8 border-t-3 border-neo-black bg-white mt-12">
        <p className="text-neo-black font-bold font-display">Powered by Gemini AI. Crafted with style.</p>
      </footer>
    </div>
  );
};

export default App;