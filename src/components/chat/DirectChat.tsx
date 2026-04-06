import { useState, useRef, useEffect, useCallback } from 'react';
import { User, Message } from '@/types/chat';
import { format, isToday, isYesterday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import GameIcon from '@/components/GameIcon';
import TypingIndicator from './TypingIndicator';
import EmojiPicker from './EmojiPicker';
import CallOverlay from '@/components/CallOverlay';
import { playSendSound } from '@/lib/sounds';
import { useDirectMessages } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';

interface DirectChatProps {
  user: User;
  messages: Message[];
  onClose: () => void;
  onNewMessage?: () => void;
}

const statusLabels: Record<string, string> = {
  online: 'В сети',
  offline: 'Не в сети',
  'in-game': 'В игре',
  afk: 'Отошёл',
};

const avatarGradients = [
  'from-primary/40 to-accent/40',
  'from-cyan-500/40 to-teal-400/40',
  'from-rose-500/40 to-pink-400/40',
  'from-amber-500/40 to-orange-400/40',
  'from-emerald-500/40 to-green-400/40',
];

function formatDateSeparator(date: Date): string {
  if (isToday(date)) return 'Сегодня';
  if (isYesterday(date)) return 'Вчера';
  return format(date, 'd MMMM', { locale: ru });
}

function shouldShowDate(messages: Message[], index: number): boolean {
  if (index === 0) return true;
  const prev = messages[index - 1].timestamp;
  const curr = messages[index].timestamp;
  return prev.toDateString() !== curr.toDateString();
}

const DirectChat = ({ user, messages: _initialMessages, onClose, onNewMessage }: DirectChatProps) => {
  const { user: authUser } = useAuth();
  const { messages: dbMessages, sendDm } = useDirectMessages(user.id);
  const [input, setInput] = useState('');
  const [isTyping] = useState(false);
  const [activeCall, setActiveCall] = useState<'voice' | 'video' | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorIdx = user.id.charCodeAt(1) % avatarGradients.length;

  const messages: Message[] = dbMessages.map(m => ({
    id: m.id,
    content: m.content,
    author: {
      id: m.author_id,
      name: m.author?.display_name || m.author?.username || 'Unknown',
      avatar: m.author?.avatar_url || undefined,
      status: (m.author?.status as any) || 'offline',
    },
    timestamp: new Date(m.created_at),
  }));

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isTyping, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendDm(input.trim(), replyTo?.id);
    setInput('');
    setReplyTo(null);
    playSendSound();
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="h-14 flex items-center justify-between px-5 glass-strong border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
            ) : (
              <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-foreground text-[11px] font-bold", avatarGradients[colorIdx])}>
                {user.name.slice(0, 2)}
              </div>
            )}
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
              user.status === 'online' ? 'bg-primary' : user.status === 'in-game' ? 'bg-accent' : user.status === 'afk' ? 'bg-yellow-500' : 'bg-muted-foreground/40'
            )} />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">{user.name}</h3>
            <p className="text-[11px] text-muted-foreground">
              {user.game ? <span className="text-accent">{user.game}</span> : statusLabels[user.status]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setActiveCall('voice')} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
            <GameIcon name="phone" size={16} />
          </button>
          <button onClick={() => setActiveCall('video')} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
            <GameIcon name="video" size={16} />
          </button>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all ml-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto smooth-scroll py-4 px-4">
        {messages.map((msg, i) => {
          const isOwn = msg.author.id === authUser?.id;
          const showAvatar = !isOwn && (i === 0 || messages[i - 1].author.id !== msg.author.id);
          const showDate = shouldShowDate(messages, i);

          return (
            <div key={msg.id} className="group">
              {showDate && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 gradient-separator" />
                  <span className="text-[10px] text-muted-foreground/60 font-medium px-2">{formatDateSeparator(msg.timestamp)}</span>
                  <div className="flex-1 gradient-separator" />
                </div>
              )}
              <div className={cn("flex gap-2.5 mb-1", isOwn ? "flex-row-reverse" : "flex-row")}>
                {showAvatar && !isOwn ? (
                  <div className="shrink-0 mt-1">
                    {msg.author.avatar ? (
                      <img src={msg.author.avatar} alt="" className="w-8 h-8 rounded-xl object-cover" />
                    ) : (
                      <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center text-foreground text-[10px] font-bold", avatarGradients[colorIdx])}>
                        {msg.author.name.slice(0, 2)}
                      </div>
                    )}
                  </div>
                ) : <div className="w-8 shrink-0" />}
                <div className="max-w-[65%]">
                  {msg.replyTo && (
                    <div className={cn("flex items-center gap-1.5 text-[10px] text-muted-foreground/70 mb-1 px-1", isOwn ? "justify-end" : "")}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0">
                        <polyline points="9,14 4,9 9,4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                      </svg>
                      <span className="truncate max-w-[200px]">
                        <span className="text-foreground/50 font-medium">{msg.replyTo.author.name}</span>
                        {': '}{msg.replyTo.content}
                      </span>
                    </div>
                  )}
                  <div className={cn("rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isOwn ? "bg-primary text-primary-foreground rounded-tr-md" : "bg-card neon-border text-foreground rounded-tl-md"
                  )}>
                    <p className="break-words">{msg.content}</p>
                    <div className={cn("flex items-center justify-end gap-1 mt-1", isOwn ? "text-primary-foreground/40" : "text-muted-foreground/60")}>
                      <span className="text-[10px]">{format(msg.timestamp, 'HH:mm')}</span>
                      {isOwn && (
                        <svg width="14" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1,5 4,8 9,2" />
                          <polyline points="6,5 9,8 14,2" opacity="0.5" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className={cn("opacity-0 group-hover:opacity-100 transition-opacity duration-100 mt-0.5", isOwn ? "text-right" : "")}>
                    <button onClick={() => setReplyTo(msg)} className="p-1 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-secondary/60 transition-colors" title="Ответить">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="9,14 4,9 9,4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && <TypingIndicator name={user.name} />}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 pb-4 shrink-0 space-y-2">
        {replyTo && (
          <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-3 py-2 border border-border/30 animate-fade-in">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary shrink-0">
              <polyline points="9,14 4,9 9,4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
            </svg>
            <p className="text-xs text-muted-foreground flex-1 truncate">
              Ответ для <span className="text-foreground font-medium">{replyTo.author.name}</span>: {replyTo.content}
            </p>
            <button onClick={() => setReplyTo(null)} className="text-muted-foreground/50 hover:text-foreground transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex items-center gap-2.5 bg-card rounded-2xl px-4 py-3 neon-border focus-within:neon-green transition-shadow duration-200">
          <input ref={fileInputRef} type="file" className="hidden" onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              const sizeKb = Math.round(file.size / 1024);
              setAttachedFile({ name: file.name, size: sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} МБ` : `${sizeKb} КБ` });
            }
            e.target.value = '';
          }} />
          <button onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110 active:scale-90 transform">
            <GameIcon name="paperclip" size={18} />
          </button>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={`Написать ${user.name}...`}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none" />
          <div className="relative">
            <button onClick={() => setShowEmoji(!showEmoji)} className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110 active:scale-90 transform">
              <GameIcon name="smile" size={18} />
            </button>
            <EmojiPicker open={showEmoji} onSelect={emoji => setInput(prev => prev + emoji)} onClose={() => setShowEmoji(false)} />
          </div>
          <button onClick={handleSend} disabled={!input.trim() && !attachedFile}
            className={cn("p-2.5 rounded-xl transition-all duration-150",
              (input.trim() || attachedFile) ? "bg-primary text-primary-foreground neon-green hover:neon-green-strong active:scale-95 transform" : "text-muted-foreground/20 cursor-default"
            )}>
            <GameIcon name="send" size={16} />
          </button>
        </div>
      </div>

      {activeCall && (
        <CallOverlay user={user} type={activeCall} onEnd={() => setActiveCall(null)} roomName={`dm-${[user.id, authUser?.id].sort().join('-')}`} />
      )}
    </div>
  );
};

export default DirectChat;
