import React, { useState, useEffect } from 'react';
import { Bell, Check, X, ExternalLink, Clock, AlertTriangle, Info, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { getApiEndpoint } from '@/config/services';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from './LoadingSpinner';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  type: 'email' | 'in_app' | 'push';
  category: 'approval' | 'reminder' | 'update' | 'alert' | 'system';
  title: string;
  message: string;
  metadata: any;
  read_at: string | null;
  sent_at: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at: string | null;
  action_url: string | null;
  created_at: string;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const { user } = useAuth();

  const { execute: fetchNotifications, loading: loadingNotifications } = useAsyncOperation({
    onError: (error) => {
      // Don't show error if table doesn't exist - it's expected during initial setup
      if (!error.message?.includes('does not exist') && !error.message?.includes('42P01')) {
        toast({ variant: 'destructive', title: 'Failed to load notifications', description: error.message });
      }
    }
  });

  const { execute: markAsRead, loading: markingRead } = useAsyncOperation({
    onSuccess: () => {
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast({ title: 'Notification marked as read' });
    }
  });

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
  });

  const loadNotifications = React.useCallback(async () => {
    if (!user) return;

    return fetchNotifications(async () => {
      const endpoint = getApiEndpoint('/notifications');
      const response = await fetch(endpoint, { headers: getAuthHeaders() });
      if (!response.ok) {
        if (response.status === 403) return [];
        throw new Error(`Failed to load notifications: ${response.status}`);
      }
      const json = await response.json();
      const data: Notification[] = json?.data?.notifications ?? json?.data ?? [];
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadCount(json?.data?.pagination?.unreadCount ?? data.filter((n: Notification) => !n.read_at).length);
      return data;
    });
  }, [user, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    return markAsRead(async () => {
      const endpoint = getApiEndpoint(`/notifications/${notificationId}/read`);
      await fetch(endpoint, { method: 'PUT', headers: getAuthHeaders() });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
      );
    });
  };

  const handleMarkAllAsRead = async () => {
    const endpoint = getApiEndpoint('/notifications/read-all');
    await fetch(endpoint, { method: 'PUT', headers: getAuthHeaders() });
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setUnreadCount(0);
    toast({ title: 'All notifications marked as read' });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.open(notification.action_url, '_blank');
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // Set up polling for notifications (realtime not available in browser-only mode)
      const pollInterval = setInterval(() => {
        loadNotifications();
      }, 30000); // Poll every 30 seconds

      return () => {
        clearInterval(pollInterval);
      };
    }
  }, [user, loadNotifications]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'normal': return <Info className="w-4 h-4 text-blue-500" />;
      case 'low': return <Info className="w-4 h-4 text-gray-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'approval': return 'bg-yellow-100 text-yellow-800';
      case 'reminder': return 'bg-blue-100 text-blue-800';
      case 'update': return 'bg-green-100 text-green-800';
      case 'alert': return 'bg-red-100 text-red-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read_at;
    return notification.category === activeTab;
  });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative bg-white rounded-full w-12 h-12 flex-shrink-0 flex items-center justify-center shadow-sm border border-gray-100/80 hover:bg-gray-50 transition-colors">
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-3 right-3.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[90vw] sm:w-[340px] max-w-sm p-0 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-[#1a1d24]/95 backdrop-blur-xl" align="end">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-2 pt-3.5 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-bold text-gray-900 dark:text-gray-100 tracking-tight">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full h-7 px-2 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={handleMarkAllAsRead}
                  disabled={markingRead}
                >
                  <CheckCircle className="w-3 h-3 mr-1.5" />
                  Mark all read
                </Button>
              )}
            </div>
            <CardDescription className="text-gray-500 font-medium text-[11px] mt-0.5">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="px-3 pb-2">
                <TabsList className="grid grid-cols-4 w-full h-auto p-0.5 bg-gray-100/60 rounded-[1rem] gap-0.5">
                  <TabsTrigger 
                    value="all" 
                    className="text-[10px] px-1.5 py-1.5 whitespace-nowrap truncate rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger 
                    value="unread" 
                    className="text-[10px] px-1.5 py-1.5 whitespace-nowrap truncate rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    Unread
                  </TabsTrigger>
                  <TabsTrigger 
                    value="approval" 
                    className="text-[10px] px-1.5 py-1.5 whitespace-nowrap truncate rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    Approval
                  </TabsTrigger>
                  <TabsTrigger 
                    value="alert" 
                    className="text-[10px] px-1.5 py-1.5 whitespace-nowrap truncate rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    Alerts
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <ScrollArea className="h-80 px-1">
                <TabsContent value={activeTab} className="mt-0">
                  {loadingNotifications ? (
                    <div className="flex justify-center py-10">
                      <LoadingSpinner size="sm" text="Loading notifications..." />
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2 border border-gray-100">
                        <Bell className="w-5 h-5 text-gray-300" />
                      </div>
                      <p className="font-semibold text-[13px]">You're all caught up!</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">No new notifications here.</p>
                    </div>
                  ) : (
                    <div className="space-y-1 pb-2">
                      {filteredNotifications.map((notification, index) => (
                        <div key={notification.id} className="px-1.5">
                          <div 
                            className={`p-2.5 rounded-xl cursor-pointer transition-all border border-transparent ${
                              !notification.read_at ? 'bg-blue-50/60 hover:bg-blue-50/80 border-blue-100/50' : 'hover:bg-gray-50/80 hover:border-gray-100'
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start space-x-2.5">
                              <div className="flex-shrink-0 mt-0.5 bg-white p-1.5 rounded-lg shadow-sm border border-gray-100/50">
                                {getPriorityIcon(notification.priority)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <h4 className="text-[13px] font-bold text-gray-900 truncate pr-2">
                                    {notification.title}
                                  </h4>
                                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-[9px] px-1.5 py-0 uppercase tracking-wider font-bold border-none ${getCategoryColor(notification.category)}`}
                                    >
                                      {notification.category}
                                    </Badge>
                                    {!notification.read_at && (
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 shadow-sm" />
                                    )}
                                  </div>
                                </div>
                                
                                <p className="text-[12px] font-medium text-gray-600 mb-2 line-clamp-2 leading-snug">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400">
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(notification.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  {notification.action_url && (
                                    <ExternalLink className="w-3 h-3 text-gray-400 hover:text-black transition-colors" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
            
            <div className="border-t border-gray-100/80 p-2 bg-gray-50/50 rounded-b-2xl">
              <Button variant="ghost" className="w-full rounded-xl font-bold text-[12px] hover:bg-white hover:shadow-sm transition-all py-4" asChild>
                <Link to="/notifications">
                  View All Notifications
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};