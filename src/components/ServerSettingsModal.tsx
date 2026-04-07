import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import GameIcon from '@/components/GameIcon';
import { useAuth, ThemeId } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase-vps';
import { toast } from '@/hooks/use-toast';
import { Server, MemberRole } from '@/types/chat';
import { useChannels, useServerMembers } from '@/hooks/useDatabase';

interface ServerSettingsModalProps {
  open: boolean;
  onClose: () => void;
  server: Server;
  onUpdate: (server: Server) => void;
}

const roleLabels: Record<MemberRole, string> = {
  owner: 'Владелец',
  admin: 'Админ',
  member: 'Участник',
};

const roleColors: Record<MemberRole, string> = {
  owner: 'text-accent',
  admin: 'text-primary',
  member: 'text-muted-foreground',
};

const ServerSettingsModal = ({ open, onClose, server, onUpdate }: ServerSettingsModalProps) => {
  const { user } = useAuth();
  const { channels, addChannel, deleteChannel } = useChannels(server.id);
  const { members } = useServerMembers(server.id);

  const [tab, setTab] = useState<'general' | 'channels' | 'members' | 'roles'>('general');
  const [serverName, setServerName] = useState(server.name);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'text' | 'voice'>('text');

  if (!open) return null;

  const tabs = [
    { id: 'general' as const, label: 'Основное', icon: 'settings' },
    { id: 'channels' as const, label: 'Каналы', icon: 'hash' },
    { id: 'members' as const, label: 'Участники', icon: 'users' },
    { id: 'roles' as const, label: 'Роли', icon: 'shield' },
  ];

  const handleAddChannel = async () => {
    if (!newChannelName.trim()) return;
    const name = newChannelName.trim().toLowerCase().replace(/\s+/g, '-');
    await addChannel(name, newChannelType);
    setNewChannelName('');
    toast({ title: `Канал #${name} создан ✅` });
  };

  const handleDeleteChannel = async (chId: string) => {
    await deleteChannel(chId);
    toast({ title: 'Канал удалён' });
  };

  const handleSave = () => {
    if (serverName !== server.name) {
      onUpdate({ ...server, name: serverName });
      toast({ title: 'Настройки сохранены ✅' });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-background cyber-grid animate-fade-in">
      <div className="w-[200px] flex flex-col glass-strong border-r border-border/50">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border/50">
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <GameIcon name="arrow-left" size={16} />
          </button>
          <span className="text-sm font-bold text-foreground truncate">Настройки</span>
        </div>
        <div className="flex-1 p-2 space-y-0.5">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                tab === t.id ? "bg-primary/10 text-primary neon-border" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}>
              <GameIcon name={t.icon} size={15} glow={tab === t.id} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-8">
          {tab === 'general' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">Основные настройки</h2>
              <div className="flex items-center gap-5">
                <div className={cn("w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl neon-green", server.gradient)}>
                  {server.icon}
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Название сервера</label>
                  <input value={serverName} onChange={e => setServerName(e.target.value)}
                    className="w-full bg-card rounded-xl px-4 py-2.5 text-sm text-foreground neon-border focus:neon-green outline-none transition-shadow" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-6">
                {[
                  { label: 'Участников', value: members.length },
                  { label: 'В сети', value: members.filter(m => m.profile?.status === 'online').length },
                  { label: 'Каналов', value: channels.length },
                ].map(s => (
                  <div key={s.label} className="bg-card rounded-xl p-4 neon-border text-center">
                    <p className="text-xl font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-border/30">
                <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold neon-green hover:neon-green-strong transition-shadow">
                  Сохранить
                </button>
              </div>
            </div>
          )}

          {tab === 'channels' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">Каналы</h2>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Новый канал</label>
                  <input value={newChannelName} onChange={e => setNewChannelName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddChannel()}
                    placeholder="название-канала" className="w-full bg-card rounded-xl px-4 py-2.5 text-sm text-foreground neon-border focus:neon-green outline-none transition-shadow" />
                </div>
                <div className="flex gap-1.5">
                  {(['text', 'voice'] as const).map(t => (
                    <button key={t} onClick={() => setNewChannelType(t)}
                      className={cn("px-3 py-2.5 rounded-xl text-xs font-medium transition-colors",
                        newChannelType === t ? "bg-primary/10 text-primary neon-border" : "bg-secondary text-muted-foreground hover:text-foreground"
                      )}>
                      <GameIcon name={t === 'text' ? 'hash' : 'volume'} size={13} />
                    </button>
                  ))}
                </div>
                <button onClick={handleAddChannel} disabled={!newChannelName.trim()} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold neon-green hover:neon-green-strong transition-shadow disabled:opacity-30">
                  <GameIcon name="plus" size={14} />
                </button>
              </div>
              <div className="space-y-1.5">
                {channels.map(ch => (
                  <div key={ch.id} className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 neon-border group">
                    <GameIcon name={ch.type === 'text' ? 'hash' : 'volume'} size={15} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground flex-1">{ch.name}</span>
                    <span className="text-[10px] text-muted-foreground/50 uppercase">{ch.type === 'text' ? 'текст' : 'голос'}</span>
                    <button onClick={() => handleDeleteChannel(ch.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-all">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'members' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">Участники — {members.length}</h2>
              <div className="space-y-1.5">
                {members.map(m => {
                  const role = m.role as MemberRole;
                  return (
                    <div key={m.user_id} className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 neon-border">
                      <div className="relative">
                        {m.profile?.avatar_url ? (
                          <img src={m.profile.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/25 to-accent/25 flex items-center justify-center text-foreground text-[11px] font-bold">
                            {(m.profile?.display_name || m.profile?.username || '??').slice(0, 2)}
                          </div>
                        )}
                        <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                          m.profile?.status === 'online' ? 'bg-primary' : m.profile?.status === 'afk' ? 'bg-yellow-500' : m.profile?.status === 'dnd' ? 'bg-destructive' : 'bg-muted-foreground/40'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{m.profile?.display_name || m.profile?.username || 'Unknown'}</p>
                        {m.profile?.bio && <p className="text-[11px] text-muted-foreground truncate">{m.profile.bio}</p>}
                      </div>
                      <span className={cn("text-[11px] font-bold uppercase tracking-wider", roleColors[role] || 'text-muted-foreground')}>
                        {roleLabels[role] || role}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'roles' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">Роли</h2>
              {[
                { role: 'owner' as const, perms: ['Все права', 'Удаление сервера', 'Управление ролями'] },
                { role: 'admin' as const, perms: ['Управление каналами', 'Кик/Бан', 'Закрепление сообщений'] },
                { role: 'member' as const, perms: ['Чтение и отправка сообщений', 'Голосовые каналы'] },
              ].map(r => (
                <div key={r.role} className="bg-card rounded-xl p-5 neon-border">
                  <div className="flex items-center gap-2 mb-3">
                    <GameIcon name="shield" size={15} className={roleColors[r.role]} />
                    <h3 className={cn("text-sm font-bold", roleColors[r.role])}>{roleLabels[r.role]}</h3>
                  </div>
                  <div className="space-y-1.5">
                    {r.perms.map(p => (
                      <div key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary">
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerSettingsModal;
