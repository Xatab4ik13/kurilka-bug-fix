import { memo, useState, useRef } from 'react';
import { Message } from '@/types/chat';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import MiniProfile from './MiniProfile';
import MessageContextMenu from './MessageContextMenu';
import GameIcon from '@/components/GameIcon';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAuthor: boolean;
  index: number;
  onReply?: (msg: Message) => void;
  onDelete?: (msgId: string) => void;
}

const avatarGradients = [
  'from-primary/40 to-accent/40',
  'from-cyan-500/40 to-teal-400/40',
  'from-rose-500/40 to-pink-400/40',
  'from-amber-500/40 to-orange-400/40',
  'from-emerald-500/40 to-green-400/40',
];

const MessageBubble = ({ message, isOwn, showAuthor, index, onReply, onDelete }: MessageBubbleProps) => {
  const [showProfile, setShowProfile] = useState(false);
  const [profilePos, setProfilePos] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const colorIdx = message.author.id.charCodeAt(1) % avatarGradients.length;

  const handleAvatarHover = () => {
    if (avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setProfilePos({ x: rect.right + 8, y: rect.top - 20 });
      setShowProfile(true);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <div
        className={cn("flex gap-2.5 px-5 py-0.5 group relative", isOwn ? "flex-row-reverse" : "flex-row")}
        onMouseLeave={() => setShowProfile(false)}
        onContextMenu={handleContextMenu}
      >
        {showAuthor && !isOwn ? (
          <div
            ref={avatarRef}
            onMouseEnter={handleAvatarHover}
            onMouseLeave={() => setShowProfile(false)}
            className="shrink-0 mt-1 cursor-pointer hover:scale-110 hover:shadow-lg transition-all duration-150"
          >
            {message.author.avatar ? (
              <img src={message.author.avatar} alt="" className={cn("w-9 h-9 rounded-xl object-cover")} />
            ) : (
              <div className={cn(
                "w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-foreground text-[10px] font-bold",
                avatarGradients[colorIdx]
              )}>
                {message.author.name.slice(0, 2)}
              </div>
            )}
          </div>
        ) : <div className="w-9 shrink-0" />}

        <div className="max-w-[60%]">
          {showAuthor && !isOwn && (
            <p className="text-[11px] font-semibold text-muted-foreground mb-1 px-1">
              {message.author.name}
            </p>
          )}

          {message.replyTo && (
            <div className={cn(
              "flex items-center gap-1.5 text-[10px] text-muted-foreground/70 mb-1 px-1",
              isOwn ? "justify-end" : ""
            )}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0">
                <polyline points="9,14 4,9 9,4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
              </svg>
              <span className="truncate max-w-[200px]">
                <span className="text-foreground/50 font-medium">{message.replyTo.author.name}</span>
                {': '}{message.replyTo.content}
              </span>
            </div>
          )}

          <div className={cn(
            "relative rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "bg-card neon-border text-foreground rounded-tl-md"
          )}>
            {message.pinned && (
              <div className="flex items-center gap-1 text-[9px] text-accent mb-1">
                <GameIcon name="pin" size={9} />
                Закреплено
              </div>
            )}
            <p className="break-words">{message.content}</p>
            <p className={cn(
              "text-[10px] mt-1.5 text-right",
              isOwn ? "text-primary-foreground/40" : "text-muted-foreground/60"
            )}>
              {format(message.timestamp, 'HH:mm')}
            </p>
          </div>

          {onReply && (
            <div className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity duration-100 mt-0.5",
              isOwn ? "text-right" : ""
            )}>
              <button
                onClick={() => onReply(message)}
                className="p-1 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-secondary/60 transition-colors"
                title="Ответить"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9,14 4,9 9,4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      <MiniProfile user={message.author} visible={showProfile} position={profilePos} />
      {contextMenu && onReply && (
        <MessageContextMenu
          message={message}
          position={contextMenu}
          isOwn={isOwn}
          onClose={() => setContextMenu(null)}
          onReply={onReply}
          onDelete={onDelete}
        />
      )}
    </>
  );
};

export default memo(MessageBubble);
