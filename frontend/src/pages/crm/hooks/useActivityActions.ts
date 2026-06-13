/**
 * Hook for activity actions (create, edit, delete)
 */

import { useState, useCallback } from 'react';

export const useActivityActions = (onActivitiesChange: () => void) => {
  const [selectedActivity, setSelectedActivity] = useState<unknown | null>(null);
  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<unknown | null>(null);

  const handleNewActivity = useCallback((leadId?: string) => {
    setSelectedActivity(leadId ? { lead_id: leadId } : null);
    setActivityFormOpen(true);
  }, []);

  const handleEditActivity = useCallback((activity: unknown) => {
    setSelectedActivity(activity);
    setActivityFormOpen(true);
  }, []);

  const handleDeleteActivity = useCallback((activity: unknown) => {
    setActivityToDelete(activity);
    setDeleteDialogOpen(true);
  }, []);

  const handleActivitySaved = useCallback(() => {
    onActivitiesChange();
    setActivityFormOpen(false);
    setSelectedActivity(null);
  }, [onActivitiesChange]);

  const handleActivityDeleted = useCallback(() => {
    onActivitiesChange();
    setDeleteDialogOpen(false);
    setActivityToDelete(null);
  }, [onActivitiesChange]);

  return {
    selectedActivity,
    setSelectedActivity,
    activityFormOpen,
    setActivityFormOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    activityToDelete,
    setActivityToDelete,
    handleNewActivity,
    handleEditActivity,
    handleDeleteActivity,
    handleActivitySaved,
    handleActivityDeleted,
  };
};

