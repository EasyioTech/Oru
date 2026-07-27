import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useNotifications } from './hooks/useNotifications';
import { NotificationFilters } from './components/NotificationFilters';
import { BulkActionsBar } from './components/BulkActionsBar';
import { NotificationList } from './components/NotificationList';
import { SendNotificationDialog } from './components/SendNotificationDialog';
import { PageHeader } from '@/components/layout/PageHeader';

export default function Notifications() {
  const {
    notifications, filteredNotifications, unreadCount, loadingNotifications,
    activeTab, setActiveTab, searchQuery, setSearchQuery,
    categoryFilter, setCategoryFilter, priorityFilter, setPriorityFilter,
    selectedNotifications, deleteDialogOpen, setDeleteDialogOpen,
    notificationToDelete, setNotificationToDelete,
    sendDialogOpen, setSendDialogOpen, users, sendForm, setSendForm,
    isAdmin, markingRead, sending,
    handleMarkAsRead, handleMarkAllAsRead, handleDeleteNotification,
    handleBulkDelete, handleBulkMarkAsRead, handleSendNotification,
    handleNotificationClick, toggleSelection, toggleSelectAll,
  } = useNotifications();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        description="Manage and view all your notifications"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {isAdmin && (
              <SendNotificationDialog
                open={sendDialogOpen}
                onOpenChange={setSendDialogOpen}
                users={users}
                sendForm={sendForm}
                setSendForm={setSendForm}
                sending={sending}
                onSend={handleSendNotification}
              />
            )}
            {unreadCount > 0 && (
              <Button size="sm" variant="outline" className="h-8 sm:h-9 gap-1.5 text-xs sm:text-sm" onClick={handleMarkAllAsRead} disabled={markingRead}>
                <CheckCircle className="w-3.5 h-3.5" />Mark All Read
              </Button>
            )}
          </div>
        }
      />

      <NotificationFilters
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        priorityFilter={priorityFilter}
        onSearch={setSearchQuery}
        onCategory={setCategoryFilter}
        onPriority={setPriorityFilter}
      />

      <BulkActionsBar
        count={selectedNotifications.size}
        onMarkAsRead={handleBulkMarkAsRead}
        onDelete={handleBulkDelete}
      />

      <NotificationList
        notifications={notifications}
        filteredNotifications={filteredNotifications}
        unreadCount={unreadCount}
        loading={loadingNotifications}
        activeTab={activeTab}
        selectedNotifications={selectedNotifications}
        onTabChange={setActiveTab}
        onToggleSelection={toggleSelection}
        onToggleSelectAll={toggleSelectAll}
        onMarkAsRead={handleMarkAsRead}
        onDeleteRequest={(id) => { setNotificationToDelete(id); setDeleteDialogOpen(true); }}
        onNotificationClick={handleNotificationClick}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNotificationToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (notificationToDelete) {
                  handleDeleteNotification(notificationToDelete);
                  setNotificationToDelete(null);
                  setDeleteDialogOpen(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
