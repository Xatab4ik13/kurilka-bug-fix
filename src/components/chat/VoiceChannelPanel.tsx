import { useState } from 'react';
import GameIcon from '@/components/GameIcon';
import { cn } from '@/lib/utils';

interface VoiceChannelPanelProps {
  channelName: string;
  serverName: string;
  participants: { id: string; name: string; speaking: boolean; muted: boolean }[];
  onDisconnect: () => void;
}

const VoiceChannelPanel = ({ channelName, serverName, participants, onDisconnect }: VoiceChannelPanelProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  return (
    <div
      className="fixed bottom-4 left-[290px] z-40 w-[300px] rounded-2xl glass-strong border border-border/50 overflow-hidden animate-fade-in"
      style={{ boxShadow: '0 20px 50px hsla(0, 0%, 0%, 0.5)' }}
    >
      <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <GameIcon name="volume" size={16} glow className="text-primary" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-primary truncate">{channelName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{serverName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-primary/60">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Подключено
        </div>
      </div>

      <div className="px-3 py-2 max-h-[160px] overflow-y-auto">
        {participants.map(p => (
          <div key={p.id} className="flex items-center gap-2.5 py-1.5 px-1 rounded-lg hover:bg-secondary/30 transition-colors">
            <div className="relative">
              <div className={cn(
                "w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-[10px] font-bold text-foreground",
                p.speaking && "ring-2 ring-primary ring-offset-1 ring-offset-background"
              )}>
                {p.name.slice(0, 2)}
              </div>
              {p.speaking && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
            <span className="text-[11px] text-foreground font-medium truncate flex-1">{p.name}</span>
            {p.muted && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-destructive shrink-0">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .28-.02.56-.06.83" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {isScreenSharing && (
        <div className="border-t border-border/30 px-4 py-2.5 animate-fade-in">
          <div className="w-full rounded-lg bg-secondary/60 border border-primary/20 p-3 flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span className="text-[11px] text-primary font-medium">Демонстрация экрана</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
        </div>
      )}

      <div className="px-3 py-3 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-medium transition-colors",
              isScreenSharing ? "bg-primary/15 text-primary neon-border" : "bg-secondary hover:bg-secondary/80 text-foreground"
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Экран
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-medium transition-colors",
              isMuted ? "bg-destructive/15 text-destructive" : "bg-secondary hover:bg-secondary/80 text-foreground"
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {isMuted ? (
                <>
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .28-.02.56-.06.83" />
                </>
              ) : (
                <>
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                </>
              )}
            </svg>
            Микро
          </button>
          <button
            onClick={() => setIsDeafened(!isDeafened)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-medium transition-colors",
              isDeafened ? "bg-destructive/15 text-destructive" : "bg-secondary hover:bg-secondary/80 text-foreground"
            )}
          >
            <GameIcon name="headphones" size={14} />
            Звук
          </button>
          <button
            onClick={onDisconnect}
            className="py-2.5 px-3.5 rounded-xl bg-destructive/15 hover:bg-destructive/30 text-destructive transition-colors"
          >
            <GameIcon name="phone" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceChannelPanel;
