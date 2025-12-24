import React from 'react';
import { useNavigate } from 'react-router-dom';

const ExpiredPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[100px] animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[100px]"></div>
      </div>

      {/* Top Navigation */}
      <header className="relative z-10 w-full border-b border-white/5 bg-background-dark/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="text-primary">
                <span className="material-symbols-outlined text-3xl">graphic_eq</span>
              </div>
              <h2 className="text-white text-lg font-bold tracking-tight">Pulse Chat</h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="hidden sm:flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-white transition-colors border border-white/10 hover:bg-white/10 backdrop-blur-sm">
                About
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[480px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fadeIn bg-[#101622]/60 backdrop-blur-xl border border-white/10">
          {/* Status Indicator / Icon Area */}
          <div className="flex flex-col items-center justify-center pt-12 pb-6 px-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
            <div className="relative bg-background-dark border border-white/10 p-6 rounded-full flex items-center justify-center shadow-lg mb-6 group">
              <span className="material-symbols-outlined text-[48px] text-primary/80 group-hover:text-primary transition-colors duration-300">timer_off</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-white tracking-tight mb-3">
              This room has expired
            </h1>
            <p className="text-gray-400 text-center text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
              Pulse Chat rooms are temporary. Time to find a new beat. The conversation has been cleared to protect your privacy.
            </p>
          </div>

          {/* Visual Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>

          {/* Actions Area */}
          <div className="p-6 flex flex-col gap-4">
            <button 
                onClick={() => navigate('/rooms')}
                className="w-full h-12 flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">explore</span>
              <span>Back to Nearby Rooms</span>
            </button>
            <button className="w-full h-12 flex items-center justify-center gap-2 text-gray-300 font-medium rounded-xl transition-all duration-200 hover:text-white border border-white/10 hover:bg-white/10 backdrop-blur-sm">
              <span className="material-symbols-outlined text-[20px]">history</span>
              <span>View Chat History</span>
            </button>
          </div>

          {/* Subtle Status Bar */}
          <div className="bg-black/20 py-3 px-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Disconnected</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center border-t border-white/5 bg-background-dark/30 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-500 text-sm font-normal">Pulse Chat © 2024</p>
          <div className="flex gap-6">
            <a className="text-gray-600 hover:text-gray-400 text-xs transition-colors" href="#">Privacy Policy</a>
            <a className="text-gray-600 hover:text-gray-400 text-xs transition-colors" href="#">Terms of Service</a>
            <a className="text-gray-600 hover:text-gray-400 text-xs transition-colors" href="#">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExpiredPage;
