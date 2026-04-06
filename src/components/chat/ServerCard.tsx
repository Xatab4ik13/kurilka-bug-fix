import { memo } from 'react';
import { Server } from '@/types/chat';
import GameIcon from '@/components/GameIcon';
import { cn } from '@/lib/utils';

interface ServerCardProps {
  server: Server;
  index: number;
  onOpen: (id: string) => void;
}

const ServerCard = ({ server, index, onOpen }: ServerCardProps) => {
  const lastMsg = server.messages[server.messages.length - 1];

  return (
    <button
      onClick={() => onOpen(server.id)}
      className="relative group text-left w-full rounded-2xl overflow-hidden neon-border neon-border-hover bg-card transition-all duration-200 hover:-translate-y-1 active:scale-[0.98]"
      style={{ animationDelay: `${Math.min(index * 40, 200)}ms` }}
    >
      <div className={cn("h-28 bg-gradient-to-br relative overflow-hidden", server.gradient)}>
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <span className="absolute top-4 left-4 text-4xl opacity-70 group-hover:opacity-100 transition-opacity duration-200">
          {server.icon}
        </span>
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-card/90 rounded-full px-2.5 py-1 border border-border/20">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[11px] font-semibold text-foreground">{server.onlineCount} онлайн</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-foreground text-[15px] group-hover:neon-text-green transition-all duration-200">{server.name}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <GameIcon name="users" size={12} />
            <span>{server.memberCount} участников</span>
          </div>
        </div>

        {lastMsg && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-secondary/40 border border-border/30 group-hover:bg-secondary/60 transition-colors duration-150">
            <GameIcon name="message" size={13} className="mt-0.5 shrink-0 text-muted-foreground/50" />
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground truncate">
                <span className="text-foreground/60 font-medium">{lastMsg.author.name}:</span>{' '}
                {lastMsg.content}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {server.channels.map(ch => (
            <span
              key={ch.id}
              className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/60 rounded-lg px-2 py-1 border border-border/20 group-hover:border-border/40 transition-colors duration-150"
            >
              <GameIcon name={ch.type === 'text' ? 'hash' : 'headphones'} size={10} />
              {ch.name}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
};

export default memo(ServerCard);
