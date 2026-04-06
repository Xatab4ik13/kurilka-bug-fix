import { useState } from 'react';
import { cn } from '@/lib/utils';
import GameIcon from '@/components/GameIcon';

interface AddFriendModalProps {
  open: boolean;
  onClose: () => void;
}

const suggestedUsers = [
  { id: 'su1', name: 'DragonSlayer', status: 'online' as const, game: 'Elden Ring' },
  { id: 'su2', name: 'NightWolf', status: 'in-game' as const, game: 'CS2' },
  { id: 'su3', name: 'PixelQueen', status: 'online' as const },
  { id: 'su4', name: 'ShadowBlade', status: 'offline' as const },
  { id: 'su5', name: 'CyberPunk77', status: 'online' as const, game: 'Cyberpunk 2077' },
];

const AddFriendModal = ({ open, onClose }: AddFriendModalProps) => {
  const [search, setSearch] = useState('');
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  const filtered = suggestedUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = (id: string) => {
    setSentRequests(prev => [...prev, id]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-background/90" />
      <div onClick={e => e.stopPropagation()} className="relative z-10 w-[440px] rounded-2xl bg-card border border-border/50 neon-border animate-scale-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
          <div>
            <h2 className="text-lg font-bold text-foreground">Добавить друга</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Найди по нику и отправь запрос</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-4 py-3 border border-border/30 focus-within:border-primary/40 transition-colors">
            <GameIcon name="search" size={15} className="text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Введи никнейм..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
              autoFocus
            />
          </div>
        </div>

        <div className="px-6 py-4 max-h-[300px] overflow-y-auto space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            {search ? 'Результаты' : 'Рекомендации'}
          </p>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Никого не найдено 😕</p>
          ) : (
            filtered.map(user => {
              const sent = sentRequests.includes(user.id);
              return (
                <div key={user.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/40 transition-colors group">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/25 to-accent/25 flex items-center justify-center text-foreground text-[11px] font-bold">
                      {user.name.slice(0, 2)}
                    </div>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                      user.status === 'online' ? 'bg-primary' : user.status === 'in-game' ? 'bg-accent' : 'bg-muted-foreground/40'
                    )} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {user.game ? <span className="text-accent">{user.game}</span> : user.status === 'online' ? 'В сети' : 'Не в сети'}
                    </p>
                  </div>
                  <button
                    onClick={() => !sent && handleSend(user.id)}
                    disabled={sent}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors",
                      sent
                        ? "bg-secondary text-muted-foreground cursor-default"
                        : "bg-primary/15 text-primary hover:bg-primary/25"
                    )}
                  >
                    {sent ? '✓ Отправлено' : 'Добавить'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFriendModal;
