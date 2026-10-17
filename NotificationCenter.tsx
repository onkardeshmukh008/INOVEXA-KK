import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  Sparkles,
  GitCommit,
  FileText,
  Target,
  Award,
  ChevronRight,
  Info,
} from 'lucide-react';
import type { PageId } from './Sidebar.tsx';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'insight' | 'commit' | 'milestone' | 'action_plan' | 'reminder';
  timestamp: string;
  read: boolean;
  targetPage?: PageId;
  actionLabel?: string;
}

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDismiss: (id: string) => void;
  onNavigate: (page: PageId) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDismiss,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'insights'>('all');
  const panelRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'insights') return n.type === 'insight' || n.type === 'action_plan';
    return true;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'insight':
        return <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'commit':
        return <GitCommit className="w-4 h-4 text-sky-500 shrink-0" />;
      case 'milestone':
        return <Award className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'action_plan':
        return <Target className="w-4 h-4 text-purple-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Activity & Engagement Notifications"
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-extrabold text-slate-950 ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Notifications & Engagement
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  title="Clear all notifications"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'unread'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'insights'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Insights
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1">
                <Bell className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="font-semibold">No notifications in this view</p>
                <p className="text-[11px]">You're all caught up on your engagement updates.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 transition-colors relative group flex items-start gap-3 text-xs ${
                    notif.read
                      ? 'bg-white dark:bg-slate-900 opacity-80'
                      : 'bg-amber-50/40 dark:bg-amber-950/20'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      {notif.targetPage ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!notif.read) onMarkAsRead(notif.id);
                            if (notif.targetPage) onNavigate(notif.targetPage);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 font-bold text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                        >
                          <span>{notif.actionLabel || 'Take Action'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ) : <span />}

                      <div className="flex items-center gap-1">
                        {!notif.read && (
                          <button
                            type="button"
                            onClick={() => onMarkAsRead(notif.id)}
                            title="Mark as read"
                            className="p-1 rounded text-slate-400 hover:text-emerald-600"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDismiss(notif.id)}
                          title="Dismiss notification"
                          className="p-1 rounded text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => {
                onNavigate('dashboard');
                setIsOpen(false);
              }}
              className="text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400"
            >
              View Full Engagement Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
