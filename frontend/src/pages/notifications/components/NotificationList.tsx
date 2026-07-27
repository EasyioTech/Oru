import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Bell, Check, Clock, ExternalLink, MoreVertical, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Notification } from '../types';
import { getPriorityIcon, getCategoryColor, formatDate } from '../utils';

interface Props {
  notifications: Notification[];
  filteredNotifications: Notification[];
  unreadCount: number;
  loading: boolean;
  activeTab: string;
  selectedNotifications: Set<string>;
  onTabChange: (v: string) => void;
  onToggleSelection: (id: string) => void;
  onToggleSelectAll: () => void;
  onMarkAsRead: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onNotificationClick: (n: Notification) => void;
}

export function NotificationList({
  notifications, filteredNotifications, unreadCount, loading, activeTab,
  selectedNotifications, onTabChange, onToggleSelection, onToggleSelectAll,
  onMarkAsRead, onDeleteRequest, onNotificationClick,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Notifications</CardTitle>
            <CardDescription>{unreadCount} unread • {notifications.length} total</CardDescription>
          </div>
          {filteredNotifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onToggleSelectAll}>
              {selectedNotifications.size === filteredNotifications.length ? (
                <><EyeOff className="w-4 h-4 mr-2" />Deselect All</>
              ) : (
                <><Eye className="w-4 h-4 mr-2" />Select All</>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="approval">Approval</TabsTrigger>
            <TabsTrigger value="alert">Alerts</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="md" text="Loading notifications..." />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No notifications found</p>
                <p className="text-sm">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        !notification.read_at ? 'bg-blue-50/50 border-blue-200' : 'bg-card'
                      } ${selectedNotifications.has(notification.id) ? 'ring-2 ring-primary' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedNotifications.has(notification.id)}
                          onCheckedChange={() => onToggleSelection(notification.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 cursor-pointer" onClick={() => onNotificationClick(notification)}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              {getPriorityIcon(notification.priority)}
                              <h4 className="font-semibold text-base">{notification.title}</h4>
                              {!notification.read_at && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className={`text-xs ${getCategoryColor(notification.category)}`}>
                                {notification.category}
                              </Badge>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-2">
                                  <div className="space-y-1">
                                    {!notification.read_at && (
                                      <Button variant="ghost" size="sm" className="w-full justify-start"
                                        onClick={() => onMarkAsRead(notification.id)}>
                                        <Check className="w-4 h-4 mr-2" />Mark as Read
                                      </Button>
                                    )}
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-destructive"
                                      onClick={() => onDeleteRequest(notification.id)}>
                                      <Trash2 className="w-4 h-4 mr-2" />Delete
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDate(notification.created_at)}
                              </div>
                              {notification.action_url && (
                                <div className="flex items-center text-primary">
                                  <ExternalLink className="w-3 h-3 mr-1" />Has action
                                </div>
                              )}
                            </div>
                            {notification.expires_at && (
                              <div className="text-orange-600">
                                Expires: {new Date(notification.expires_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
