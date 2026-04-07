import { useState, useRef, useEffect } from 'react';
import GameIcon from '@/components/GameIcon';
import { cn } from '@/lib/utils';

interface NotificationsDropdownProps {
  open: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  type: 'friend' | 'mention' | 'server';
  text: string;
  time: string;
  read: boolean;
}

const typeIcons: Record<string, string> = {
  friend: 'users',
  mention: 'message',
  server: 'gamepad',
};

const NotificationsDropdown = ({ open, onClose }: NotificationsDropdownProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div ref={ref} className="absolute top-full right-0 mt-2 w-[340px] rounded-2xl bg-card border border-border/50 neon-border shadow-2xl animate-scale-in z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <h3 className="text-sm font-bold text-foreground">Уведомления</h3>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-[10px] text-primary hover:text-primary/80 font-medium transition-colors">
            Прочитать все
          </button>
        )}
      </div>
      <div className="max-h-[320px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <GameIcon name="bell" size={24} className="text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground/50">Нет уведомлений</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={cn(
              "flex items-start gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors cursor-pointer",
              !n.read && "bg-primary/5"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                !n.read ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
              )}>
                <GameIcon name={typeIcons[n.type]} size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("text-xs leading-relaxed", !n.read ? "text-foreground" : "text-muted-foreground")}>
                  {n.text}
                </p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">{n.time}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsDropdown;