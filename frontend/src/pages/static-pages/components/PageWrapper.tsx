import React from 'react';

export const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-white transition-colors duration-500 relative overflow-hidden selection:bg-zinc-950 selection:text-white dark:selection:bg-white dark:selection:text-black">
    {/* Background Infrastructure */}
    <div className="fixed inset-0 pointer-events-none">
        {/* Architectural Grid */}
        <div 
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" 
            style={{ 
                backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                backgroundSize: '80px 80px'
            }}
        />
        
        {/* Ambient Velocity Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-zinc-200/50 dark:bg-zinc-900/10 blur-[120px] transition-colors duration-1000" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-zinc-100/50 dark:bg-zinc-900/10 blur-[100px] transition-colors duration-1000" />
    </div>

    <main className="relative z-10 py-32">
      {children}
    </main>
  </div>
);
