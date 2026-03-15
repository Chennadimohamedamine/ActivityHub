import { createContext, useContext } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationContext = createContext(null);

/**
 * Wrap your layout (e.g. DashboardLayout) with this provider.
 * Pass the authenticated userId so the WebSocket can register the room.
 */
export function NotificationProvider({ userId, children }) {
  const value = useNotifications(userId);
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used inside NotificationProvider');
  return ctx;
}