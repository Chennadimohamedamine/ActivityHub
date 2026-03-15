import { useState } from 'react';
import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { useNotificationContext } from '../context/NotificationContext';
import NotificationItem from '../components/NotificationItem';
import { NOTIFICATION_CONFIG } from '../utils/notificationConfig';

const FILTERS = ['All', 'Unread', ...Object.keys(NOTIFICATION_CONFIG)];

export default function NotificationPage() {
  const { notifications, unreadCount, loading, totalPages, page,
    markAsRead, markAllAsRead, loadMore, refetch } = useNotificationContext();
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = notifications.filter((n : any) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return !n.isRead;
    return n.type === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#141414] pt-20 pb-10 px-4 md:px-8 max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'You\'re all caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="p-2.5 rounded-xl text-gray-400 hover:text-white
              hover:bg-white/10 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                bg-[#FFC107]/10 text-[#FFC107] text-sm font-medium
                hover:bg-[#FFC107]/20 transition"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1
        scrollbar-thin scrollbar-thumb-white/10">
        {FILTERS.map(f => {
          const cfg = NOTIFICATION_CONFIG[f];
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`
                shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl
                text-xs font-medium transition-all
                ${isActive
                  ? 'bg-[#FFC107] text-black'
                  : 'bg-white/[0.06] text-gray-400 hover:bg-white/10 hover:text-white'}
              `}
            >
              {cfg && (
                <cfg.icon className="w-3 h-3" />
              )}
              {f === 'All' ? 'All' : f === 'Unread' ? `Unread (${unreadCount})` : cfg?.label ?? f}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div className="bg-[#1a1a1a] border border-white/[0.07] rounded-2xl overflow-hidden">
        {loading && notifications.length === 0 ? (
          /* Skeleton loader */
          <div className="divide-y divide-white/[0.05]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 bg-white/[0.05] rounded-full animate-pulse" />
                  <div className="h-2.5 w-2/3 bg-white/[0.04] rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center">
              <Bell className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-white font-medium">No notifications here</p>
            <p className="text-sm text-gray-500 max-w-xs">
              {activeFilter === 'Unread'
                ? "You've read everything. Nice work!"
                : `No ${activeFilter.toLowerCase()} notifications yet.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {filtered.map((n : any) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={markAsRead}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {page < totalPages && !loading && (
          <div className="border-t border-white/[0.07] p-4 text-center">
            <button
              onClick={loadMore}
              className="px-6 py-2 rounded-xl bg-white/[0.06] text-gray-400
                text-sm hover:bg-white/10 hover:text-white transition"
            >
              Load more
            </button>
          </div>
        )}

        {/* Loading more spinner */}
        {loading && notifications.length > 0 && (
          <div className="border-t border-white/[0.07] p-4 flex justify-center">
            <div className="w-5 h-5 border-2 border-[#FFC107]/30
              border-t-[#FFC107] rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}