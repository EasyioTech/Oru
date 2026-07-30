import { useState, useEffect } from 'react';

export function useUIPreferences() {
  const [showSupportTicketButton, setShowSupportTicketButton] = useState(() => {
    // Default to hide
    return localStorage.getItem('ui_showSupportTicket') === 'true';
  });

  const setSupportTicketVisibility = (visible: boolean) => {
    setShowSupportTicketButton(visible);
    localStorage.setItem('ui_showSupportTicket', String(visible));
    window.dispatchEvent(new Event('ui_preferences_changed'));
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setShowSupportTicketButton(localStorage.getItem('ui_showSupportTicket') === 'true');
    };
    window.addEventListener('ui_preferences_changed', handleStorageChange);
    return () => window.removeEventListener('ui_preferences_changed', handleStorageChange);
  }, []);

  return { showSupportTicketButton, setSupportTicketVisibility };
}
