import { UserPlus, Zap, Users, MessageCircle } from 'lucide-react';

export const NOTIFICATION_CONFIG = {
  FOLLOW: {
    icon: UserPlus,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    ring: 'ring-blue-500/20',
    label: 'New Follower',
  },
  NEW_ACTIVITY: {
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/20',
    label: 'New Activity',
  },
  JOIN_ACTIVITY: {
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/20',
    label: 'Activity Join',
  },
  MESSAGE: {
    icon: MessageCircle,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    ring: 'ring-violet-500/20',
    label: 'Message',
  },
};

export function getConfig(type) {
  return NOTIFICATION_CONFIG[type] ?? NOTIFICATION_CONFIG.NEW_ACTIVITY;
}

export function timeAgo(dateStr) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}