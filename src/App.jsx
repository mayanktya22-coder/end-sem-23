import React, { useState, useEffect } from 'react';
import { useISSTracker } from './hooks/useISSTracker';
import { useNews } from './hooks/useNews';
import { Sun, Moon } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Components
import ISSDashboard from './components/ISS/ISSDashboard';
import NewsDashboard from './components/News/NewsDashboard';
import DataVisuals from './components/Visuals/DataVisuals';
import ChatbotWidget from './components/Chat/ChatbotWidget';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  const issData = useISSTracker();
  const newsData = useNews();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="min-h-screen p-6 md:p-10 transition-colors duration-300 max-w-[1600px] mx-auto">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <p className="text-[#0077b6] dark:text-[#4cc9f0] text-xs font-bold uppercase tracking-widest mb-1">
            MISSION CONTROL DASHBOARD
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a] dark:text-white">
            Real-Time ISS and News Intelligence
          </h1>
        </div>
        <button 
          onClick={toggleTheme}
          className="btn-ui flex items-center gap-2"
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
        </button>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* ISS Live Tracking - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ISSDashboard data={issData} />
        </div>

        {/* ISS Speed Trend - Takes 1 column */}
        <div className="lg:col-span-1">
          <DataVisuals issData={issData} newsData={newsData} />
        </div>
      </div>

      {/* Bottom News Section */}
      <div className="w-full">
        <NewsDashboard data={newsData} />
      </div>

      {/* Floating Chatbot */}
      <ChatbotWidget issData={issData} newsData={newsData} />
    </div>
  );
}

export default App;
