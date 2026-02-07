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
    case 'admin':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'hr':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'finance_manager':
    case 'cfo':
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
  /** Avatar size class (e.g. h-9 w-9 or h-10 w-10) */
  avatarSize?: string;
}

export function UserMenu({ avatarSize = 'h-9 w-9' }: UserMenuProps) {
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
        <Button variant="ghost" className={cn('relative rounded-full p-0 flex-shrink-0', avatarSize)}>
          <Avatar className={avatarSize}>
            <AvatarImageWithAuth src={avatarSrc} alt={userDisplayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImageWithAuth src={avatarSrc} alt={userDisplayName} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-sm font-medium leading-none truncate">{userDisplayName}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">{user?.email}</p>
                {userRole && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'mt-1.5 w-fit text-[10px] px-1.5 py-0',
                      getRoleBadgeColor(userRole)
                    )}
                  >
                    {getRoleLabel(userRole)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/my-profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          {userRole && (userRole === 'admin' || userRole === 'super_admin') && (
            <DropdownMenuItem asChild>
              <Link to="/system-dashboard" className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>System Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => window.open('https://docs.oru.app', '_blank')}
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
