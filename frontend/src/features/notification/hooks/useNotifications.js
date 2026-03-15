import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../../auth/hooks/axiosConfig.ts';

const WS_URL = import.meta.env.VITE_WS_NOTIFICATIONS_URL || 'https://localhost';

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const socketRef = useRef(null);

  // ── REST: fetch paginated notifications ────────────────────────────────
  const fetchNotifications = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      try {
        const res = await api.get(`/notifications?page=${pageNum}&limit=20`);
        const data = res.data;

        setNotifications(prev =>
          pageNum === 1 ? data.data : [...prev, ...data.data]
        );

        setUnreadCount(
          data.data.filter(n => !n.isRead).length + (pageNum > 1 ? unreadCount : 0)
        );

        setTotalPages(data.totalPages);
        setPage(data.page);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    },
    [unreadCount]
  );

  // ── REST: mark one as read ─────────────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  // ── REST: mark all as read ────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch(`/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  // ── Load next page ─────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (page < totalPages) fetchNotifications(page + 1);
  }, [page, totalPages, fetchNotifications]);

  // ── WebSocket connection ──────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    fetchNotifications(1);

    const socket = io('https://localhost/notifications', {
      path: '/notifications/socket.io',
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // optional registration event, can also auto-join room on backend
      socket.emit('register', { userId });
    });

    socket.on('notification', (notification) => { 
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    socket.on('error', (err) => {
      console.error('WebSocket error:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    page,
    totalPages,
    markAsRead,
    markAllAsRead,
    loadMore,
    refetch: () => fetchNotifications(1),
  };
}
