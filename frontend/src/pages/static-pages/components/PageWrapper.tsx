import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#000000] text-white">
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/[0.06]">
      <nav className="max-w-[1120px] mx-auto px-6 h-[64px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-sm">D</span>
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.01em]">Oru</span>
        </Link>
        <Link to="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </nav>
    </header>
    <main className="pt-24 pb-16">
      {children}
    </main>
  </div>
);
