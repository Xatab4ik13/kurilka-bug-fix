import { useRef, useEffect, useCallback } from 'react';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import GameIcon from '@/components/GameIcon';

interface MessageContextMenuProps {
  message: Message;
  position: { x: number; y: number };
  isOwn: boolean;
  onClose: () => void;
  onReply: (msg: Message) => void;
  onDelete?: (msgId: string) => void;
}

const MessageContextMenu = ({ message, position, isOwn, onClose, onReply, onDelete }: MessageContextMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    onClose();
  };

  const handleReply = () => {
    onReply(message);
    onClose();
  };

  const handleDelete = () => {
    onDelete?.(message.id);
    onClose();
  };

  const left = Math.min(position.x, window.innerWidth - 200);
  const top = Math.min(position.y, window.innerHeight - 180);

  return (
    <div
      ref={ref}
      className="fixed z-[100] w-[180px] rounded-xl bg-card border border-border/50 shadow-2xl py-1 animate-scale-in"
      style={{ left, top }}
    >
      <button onClick={handleReply} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="9,14 4,9 9,4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
        </svg>
        Ответить
      </button>
      <button onClick={handleCopy} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        Копировать
      </button>
      <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
        <GameIcon name="pin" size={13} />
        Закрепить
      </button>
      {isOwn && (
        <>
          <div className="h-px bg-border/40 mx-2 my-1" />
          <button onClick={handleDelete} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Удалить
          </button>
        </>
      )}
    </div>
  );
};

export default MessageContextMenu;
