import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-200 selection:bg-primary/30 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/10 rounded-full blur-3xl opacity-80"></div>
        <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-3xl opacity-60"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;
