import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import GameIcon from '@/components/GameIcon';
import { supabase } from '@/lib/supabase-vps';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface AddFriendModalProps {
  open: boolean;
  onClose: () => void;
}

interface SearchResult {
  user_id: string;
  username: string;
  display_name: string | null;
  status: string;
  avatar_url: string | null;
}

const AddFriendModal = ({ open, onClose }: AddFriendModalProps) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !user) return;
    setSearch('');
    setResults([]);
    setSentRequests([]);
  }, [open, user]);

  useEffect(() => {
    if (!user || !open) return;

    const searchUsers = async () => {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select('user_id, username, display_name, status, avatar_url')
        .neq('user_id', user.id)
        .limit(20);

      if (search.trim()) {
        query = query.ilike('username', `%${search.trim()}%`);
      }

      const { data } = await query;
      setResults(data || []);
      setLoading(false);
    };

    const timeout = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeout);
  }, [search, user, open]);

  const handleSend = (userId: string, username: string) => {
    setSentRequests(prev => [...prev, userId]);
    toast({ title: `Запрос отправлен ${username}` });
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
            {loading && (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            )}
          </div>
        </div>

        <div className="px-6 py-4 max-h-[300px] overflow-y-auto space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            {search ? 'Результаты' : 'Пользователи'}
          </p>
          {results.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {search ? 'Никого не найдено 😕' : 'Нет пользователей'}
            </p>
          ) : (
            results.map(profile => {
              const sent = sentRequests.includes(profile.user_id);
              return (
                <div key={profile.user_id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/40 transition-colors group">
                  <div className="relative shrink-0">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/25 to-accent/25 flex items-center justify-center text-foreground text-[11px] font-bold">
                        {profile.username.slice(0, 2)}
                      </div>
                    )}
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                      profile.status === 'online' ? 'bg-primary' : profile.status === 'afk' ? 'bg-yellow-500' : profile.status === 'dnd' ? 'bg-destructive' : 'bg-muted-foreground/40'
                    )} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground">{profile.display_name || profile.username}</p>
                    <p className="text-[11px] text-muted-foreground">
                      @{profile.username} · {profile.status === 'online' ? 'В сети' : profile.status === 'afk' ? 'Отошёл' : profile.status === 'dnd' ? 'Не беспокоить' : 'Не в сети'}
                    </p>
                  </div>
                  <button
                    onClick={() => !sent && handleSend(profile.user_id, profile.username)}
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