import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useNotificationContext } from '../context/NotificationContext';
import NotificationItem from './NotificationItem';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } =
    useNotificationContext();

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const preview = notifications.slice(0, 5);

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2.5 rounded-xl hover:bg-white/10 transition"
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 ${open ? 'text-[#FFC107]' : 'text-gray-300'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px]
            bg-red-500 text-white text-[10px]
            flex items-center justify-center rounded-full font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px]
          bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl
          overflow-hidden z-50 animate-in">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5
            border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5
                  bg-[#FFC107]/15 text-[#FFC107] rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-xs text-gray-400
                  hover:text-[#FFC107] transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="divide-y divide-white/[0.05] max-h-[360px] overflow-y-auto
            scrollbar-thin scrollbar-thumb-white/10">
            {loading ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-[#FFC107]/30
                  border-t-[#FFC107] rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Loading…</p>
              </div>
            ) : preview.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 text-gray-600" />
                <p className="text-sm text-gray-500">All caught up!</p>
              </div>
            ) : (
              preview.map(n => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={(id) => { markAsRead(id); }}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <NavLink
              to="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2
                py-3 text-xs font-medium text-gray-400
                hover:text-[#FFC107] border-t border-white/[0.07]
                hover:bg-white/[0.03] transition"
            >
              View all notifications
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          )}
        </div>
      )}
    </div>
  );
}