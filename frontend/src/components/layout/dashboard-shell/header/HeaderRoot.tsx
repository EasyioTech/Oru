import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Sun, Moon, Plus, Share2, Upload, Settings, Monitor, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { NotificationCenter } from '@/components/NotificationCenter';
import { UserMenu } from './UserMenu';
import { useThemeSync } from '@/hooks/useThemeSync';

const NavIconButton = ({ icon: Icon, active, onClick, title }: { icon: any, active?: boolean, onClick?: () => void, title?: string }) => (
  <button 
    onClick={onClick}
    title={title}
    className={cn(
      "w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200",
      active ? "bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm" : "bg-transparent text-gray-500 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70 hover:scale-105"
    )}
  >
    <Icon className="w-4 h-4 stroke-[2]" />
  </button>
);

export function HeaderRoot() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resolvedTheme, setTheme } = useThemeSync();
  
  const userName = (profile as any)?.first_name || user?.email?.split('@')[0] || 'User';

  const handleNotImplemented = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `${feature} will be available in the next release.`,
    });
  };

  return (
    <div className="w-full flex items-center justify-between pb-6 pt-2 sticky top-0 z-50">
      {/* Invisible spacer to push pills to center/right if needed, or we can just justify-between */}
      <div className="flex-1" />

      {/* Center Pill Menu */}
      <div className="flex items-center gap-1 bg-white/60 dark:bg-[#1a1d24]/80 backdrop-blur-md p-1.5 rounded-full border border-white/60 dark:border-gray-800/60 shadow-sm">
        <NavIconButton icon={Search} active title="Global Search" onClick={() => navigate('/search')} />
        <NavIconButton 
          icon={resolvedTheme === 'dark' ? Sun : Moon} 
          title="Toggle Theme" 
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} 
        />
        <NavIconButton icon={Plus} title="Quick Create" onClick={() => navigate('/create')} />
        <NavIconButton icon={Share2} title="Share Board" onClick={() => navigate('/users')} />
        <NavIconButton icon={Upload} title="Upload Document" onClick={() => navigate('/documents')} />
        <NavIconButton icon={Settings} title="Settings" onClick={() => navigate('/settings')} />
        <NavIconButton icon={Monitor} title="View As" onClick={() => navigate('/view-as-user')} />
      </div>

      <div className="flex-1 flex justify-end items-center gap-4">
        <NotificationCenter />
        <UserMenu />
      </div>
    </div>
  );
}
