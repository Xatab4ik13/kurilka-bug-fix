import { useState, useCallback, useRef, useEffect } from 'react';
import { Server, Message } from '@/types/chat';
import MessageBubble from './MessageBubble';
import GameIcon from '@/components/GameIcon';
import VoiceChannelPanel from './VoiceChannelPanel';
import EmojiPicker from './EmojiPicker';
import { cn } from '@/lib/utils';
import { playSendSound, playConnectSound, playDisconnectSound } from '@/lib/sounds';
import { useChannels, useMessages, useServerMembers } from '@/hooks/useDatabase';
import { useAuth } from '@/hooks/useAuth';

interface ChatViewProps {
  server: Server;
  onBack: () => void;
  onOpenSettings?: () => void;
}

const ChatView = ({ server, onBack, onOpenSettings }: ChatViewProps) => {
  const { user } = useAuth();
  const { channels } = useChannels(server.id);
  const { members } = useServerMembers(server.id);

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [voiceConnected, setVoiceConnected] = useState<string | null>(null);
  const [replyToMsg, setReplyToMsg] = useState<Message | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (channels.length > 0 && !activeChannelId) {
      const textCh = channels.find(c => c.type === 'text');
      if (textCh) setActiveChannelId(textCh.id);
    }
  }, [channels, activeChannelId]);

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];
  const { messages: dbMessages, sendMessage, deleteMessage } = useMessages(activeChannel?.type === 'text' ? activeChannelId : null);

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
    pinned: m.pinned || false,
    replyTo: m.reply_to_id ? (() => {
      const rm = dbMessages.find(r => r.id === m.reply_to_id);
      if (!rm) return undefined;
      return {
        id: rm.id,
        content: rm.content,
        author: { id: rm.author_id, name: rm.author?.username || 'Unknown', status: 'online' as const },
        timestamp: new Date(rm.created_at),
      };
    })() : undefined,
  }));

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages.length, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input.trim(), replyToMsg?.id);
    setInput('');
    setReplyToMsg(null);
    playSendSound();
  };

  const textChannels = channels.filter(c => c.type === 'text');
  const voiceChannels = channels.filter(c => c.type === 'voice');

  if (!activeChannel) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background cyber-grid animate-fade-in">
        <div className="text-center">
          <p className="text-muted-foreground">Загрузка каналов...</p>
          <button onClick={onBack} className="mt-4 text-sm text-primary hover:underline">Назад</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-background cyber-grid animate-fade-in">
      <div className="w-[230px] flex flex-col glass-strong border-r border-border/50">
        <div className="h-14 flex items-center gap-2.5 px-3 border-b border-border/50">
          <button onClick={onBack} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors hover:scale-105 active:scale-95 transform">
            <GameIcon name="arrow-left" size={16} />
          </button>
          <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center text-sm", server.gradient)}>
            {server.icon}
          </div>
          <span className="text-sm font-bold text-foreground truncate">{server.name}</span>
          {onOpenSettings && (
            <button onClick={onOpenSettings} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <GameIcon name="settings" size={13} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {textChannels.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-1.5">Текстовые</p>
              {textChannels.map(ch => (
                <button key={ch.id} onClick={() => setActiveChannelId(ch.id)}
                  className={cn("w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors",
                    activeChannelId === ch.id ? "bg-primary/10 text-primary neon-border" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}>
                  <GameIcon name="hash" size={14} glow={activeChannelId === ch.id} />
                  <span className="font-medium">{ch.name}</span>
                </button>
              ))}
            </div>
          )}
          {voiceChannels.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-1.5">Голосовые</p>
              {voiceChannels.map(ch => (
                <div key={ch.id} className="mb-1">
                  <button onClick={() => setActiveChannelId(ch.id)}
                    className={cn("w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors",
                      voiceConnected === ch.id ? "bg-primary/10 text-primary neon-border" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}>
                    <GameIcon name="volume" size={14} glow={voiceConnected === ch.id} />
                    <span className="font-medium flex-1 text-left">{ch.name}</span>
                    {voiceConnected === ch.id && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </button>
                  {voiceConnected !== ch.id ? (
                    <button onClick={() => { setVoiceConnected(ch.id); setActiveChannelId(ch.id); playConnectSound(); }}
                      className="w-full mt-0.5 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-semibold transition-colors">
                      <GameIcon name="headphones" size={11} />
                      Подключиться
                    </button>
                  ) : (
                    <button onClick={() => { setVoiceConnected(null); playDisconnectSound(); }}
                      className="w-full mt-0.5 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-[10px] font-semibold transition-colors">
                      Отключиться
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-3 py-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {members.filter(m => m.profile?.status === 'online').length} из {members.length} в сети
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 flex items-center justify-between px-5 glass-strong border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <GameIcon name={activeChannel.type === 'text' ? 'hash' : 'volume'} size={17} glow />
            <h3 className="font-bold text-foreground text-sm">{activeChannel.name}</h3>
            <span className="text-xs text-muted-foreground/40 mx-1">•</span>
            <span className="text-xs text-muted-foreground">{server.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowMembers(!showMembers)}
              className={cn("p-2 rounded-lg transition-colors hover:scale-105 active:scale-95 transform",
                showMembers ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}>
              <GameIcon name="users" size={16} glow={showMembers} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto smooth-scroll py-4">
              {activeChannel.type === 'text' && messages.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground/50 text-sm">Пока нет сообщений</p>
                  <p className="text-muted-foreground/30 text-xs mt-1">Будь первым! 🚀</p>
                </div>
              )}
              {activeChannel.type === 'text' && messages.map((msg, i) => {
                const isOwn = msg.author.id === user?.id;
                const showAuthor = !isOwn && (i === 0 || messages[i - 1].author.id !== msg.author.id);
                const showDate = i === 0 || messages[i - 1].timestamp.toDateString() !== msg.timestamp.toDateString();
                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex items-center gap-3 my-3 px-5">
                        <div className="flex-1 gradient-separator" />
                        <span className="text-[10px] text-muted-foreground/60 font-medium">
                          {msg.timestamp.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                        </span>
                        <div className="flex-1 gradient-separator" />
                      </div>
                    )}
                    <MessageBubble message={msg} isOwn={isOwn} showAuthor={showAuthor} index={i} onReply={setReplyToMsg} onDelete={(id) => deleteMessage(id)} />
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {activeChannel.type === 'text' && (
              <div className="px-4 pb-4 space-y-2">
                {replyToMsg && (
                  <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-3 py-2 border border-border/30 animate-fade-in">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary shrink-0">
                      <polyline points="9,14 4,9 9,4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                    </svg>
                    <p className="text-xs text-muted-foreground flex-1 truncate">
                      Ответ для <span className="text-foreground font-medium">{replyToMsg.author.name}</span>: {replyToMsg.content}
                    </p>
                    <button onClick={() => setReplyToMsg(null)} className="text-muted-foreground/50 hover:text-foreground transition-colors">
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
                    placeholder={`Написать в #${activeChannel.name}...`}
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
            )}
          </div>

          {showMembers && (
            <div className="w-[210px] border-l border-border/50 overflow-y-auto py-4 px-3 shrink-0 animate-fade-in">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Участники — {members.length}</p>
              {members.map(m => (
                <div key={m.user_id} className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl hover:bg-secondary/60 cursor-pointer transition-colors group">
                  <div className="relative">
                    {m.profile?.avatar_url ? (
                      <img src={m.profile.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-[10px] font-bold text-foreground group-hover:from-primary/35 group-hover:to-accent/35 transition-colors">
                        {(m.profile?.username || '??').slice(0, 2)}
                      </div>
                    )}
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
                      m.profile?.status === 'online' ? 'bg-primary' : m.profile?.status === 'afk' ? 'bg-yellow-500' : m.profile?.status === 'dnd' ? 'bg-destructive' : 'bg-muted-foreground/40'
                    )} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{m.profile?.display_name || m.profile?.username || 'Unknown'}</p>
                    <p className="text-[9px] text-muted-foreground/50 capitalize">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {voiceConnected && (() => {
        const voiceCh = channels.find(c => c.id === voiceConnected);
        if (!voiceCh) return null;
        return (
          <VoiceChannelPanel
            channelName={voiceCh.name}
            serverName={server.name}
            roomName={`server-${server.id}-${voiceCh.id}`}
            onDisconnect={() => { setVoiceConnected(null); playDisconnectSound(); }}
          />
        );
      })()}
    </div>
  );
};

export default ChatView;
