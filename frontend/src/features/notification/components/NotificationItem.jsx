import { getConfig, timeAgo } from '../utils/notificationConfig';

export default function NotificationItem({ notification, onRead }) {
  const cfg = getConfig(notification.type);
  const Icon = cfg.icon;

  function handleClick() {
    if (!notification.isRead) onRead(notification.id);
  }

  return (
    <button
      onClick={handleClick}
      className={`
        w-full flex items-start gap-4 px-5 py-4 text-left
        transition-all duration-200 group relative
        ${notification.isRead
          ? 'hover:bg-white/[0.03]'
          : 'bg-white/[0.04] hover:bg-white/[0.07]'}
      `}
    >
      {/* Unread indicator bar */}
      {!notification.isRead && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#FFC107] rounded-r-full" />
      )}

      {/* Icon */}
      <div className={`
        shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
        ring-1 ${cfg.bg} ${cfg.ring}
      `}>
        <Icon className={`w-4.5 h-4.5 ${cfg.color}`} strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-snug truncate
            ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
            {notification.title}
          </p>
          <span className="shrink-0 text-[11px] text-gray-500 mt-0.5">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        <span className={`
          inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full
          ${cfg.bg} ${cfg.color}
        `}>
          {cfg.label}
        </span>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-[#FFC107]" />
      )}
    </button>
  );
}