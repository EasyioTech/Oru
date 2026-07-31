/**
 * Avatar + dropdown (profile, settings, theme, sign out); role badge.
 */

import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  LogOut,
  HelpCircle,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AvatarImageWithAuth } from '@/components/ui/AvatarImageWithAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function getRoleBadgeColor(role: string | null): string {
  switch (role) {
    case 'super_admin':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'agency_admin':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'manager':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'auditor':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }
}

function getRoleLabel(role: string | null): string {
  if (!role) return 'User';
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface UserMenuProps {
  /** Avatar size class (e.g. h-8 w-8 or h-9 w-9) */
  avatarSize?: string;
}

export function UserMenu({ avatarSize = 'h-8 w-8' }: UserMenuProps) {
  const { user, profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const userDisplayName = profile?.full_name || user?.email || 'User';
  const userInitials = userDisplayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const avatarSrc =
    profile?.avatar_url &&
    typeof profile.avatar_url === 'string' &&
    profile.avatar_url.trim() !== ''
      ? profile.avatar_url
      : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'bg-white rounded-full flex items-center gap-3 p-1 sm:pr-5 shadow-sm border border-gray-100/80',
            'hover:bg-gray-50 transition-all flex-shrink-0 h-12'
          )}
        >
          <Avatar className="w-9 h-9 border border-gray-200 shadow-sm">
            <AvatarImageWithAuth src={avatarSrc} alt={userDisplayName} />
            <AvatarFallback className="bg-black text-white text-sm font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start min-w-0 text-left">
            <span className="text-[13px] font-bold text-gray-900 leading-none truncate max-w-[120px]">{userDisplayName.split(' ')[0]}</span>
            <span className="text-[11px] font-medium text-gray-500 mt-1 truncate max-w-[120px]">{getRoleLabel(userRole)}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 rounded-2xl p-1.5 shadow-xl border border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-[#1a1d24]/95 backdrop-blur-xl" align="end">
        <DropdownMenuLabel className="font-normal p-2.5">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-gray-100 shadow-sm">
              <AvatarImageWithAuth src={avatarSrc} alt={userDisplayName} />
              <AvatarFallback className="bg-black text-white text-sm font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-[14px] font-bold text-gray-900 dark:text-gray-100 leading-tight truncate">{userDisplayName}</p>
              {user?.email !== userDisplayName && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-medium mt-0.5">{user?.email}</p>
              )}
              {userRole && (
                <Badge
                  variant="outline"
                  className={cn(
                    'mt-1 w-fit text-[9px] uppercase tracking-wider font-bold px-1.5 py-0 border-none shadow-sm',
                    getRoleBadgeColor(userRole)
                  )}
                >
                  {getRoleLabel(userRole)}
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="mx-1 bg-gray-100/60 dark:bg-gray-800/60" />
        
        <DropdownMenuGroup className="p-0.5 space-y-0.5">
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:bg-gray-50 dark:focus:bg-gray-800/50 py-2 px-2.5 transition-colors">
            <Link to="/settings">
              <Settings className="mr-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="font-semibold text-[13px] text-gray-700 dark:text-gray-200">Settings</span>
              <DropdownMenuShortcut className="text-gray-400 dark:text-gray-500 text-[10px]">⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="mx-1 bg-gray-100/60 dark:bg-gray-800/60" />
        
        <div className="p-0.5">
          <DropdownMenuItem
            className="rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:bg-gray-50 dark:focus:bg-gray-800/50 py-2 px-2.5 transition-colors"
            onClick={() => window.open('https://docs.oru.app', '_blank')}
          >
            <HelpCircle className="mr-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="font-semibold text-[13px] text-gray-700 dark:text-gray-200">Help & Support</span>
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuSeparator className="mx-1 bg-gray-100/60 dark:bg-gray-800/60" />
        
        <div className="p-0.5">
          <DropdownMenuItem
            className="rounded-xl cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 px-2.5 transition-colors"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2.5 h-4 w-4" />
            <span className="font-bold text-[13px]">Sign Out</span>
            <DropdownMenuShortcut className="text-red-400 text-[10px]">⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
