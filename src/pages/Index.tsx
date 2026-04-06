import { useState, useCallback } from 'react';
import ServerCard from '@/components/chat/ServerCard';
import ChatView from '@/components/chat/ChatView';
import DirectChat from '@/components/chat/DirectChat';
import ProfilePanel from '@/components/ProfilePanel';
import CreateServerModal from '@/components/CreateServerModal';
import AddFriendModal from '@/components/AddFriendModal';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import StatusPicker from '@/components/StatusPicker';
import ServerSettingsModal from '@/components/ServerSettingsModal';
import GameIcon from '@/components/GameIcon';
import { cn } from '@/lib/utils';
import { Server } from '@/types/chat';
import { useAuth } from '@/hooks/useAuth';
import { useServers, useAllProfiles } from '@/hooks/useDatabase';

const statusOptions = [
  { value: 'online', label: 'В сети', color: 'bg-primary' },
  { value: 'afk', label: 'Отошёл', color: 'bg-yellow-500' },
  { value: 'dnd', label: 'Не беспокоить', color: 'bg-destructive' },
  { value: 'offline', label: 'Невидимка', color: 'bg-muted-foreground/40' },
] as const;

interface IndexProps {
  username: string;
  onLogout: () => void;
}

const Index = ({ username, onLogout }: IndexProps) => {
  const { user, profile, updateProfile } = useAuth();
  const { servers: dbServers, createServer, updateServer } = useServers();
  const { profiles } = useAllProfiles();

  const [openServerId, setOpenServerId] = useState<string | null>(null);
  const [activeDmUserId, setActiveDmUserId] = useState<string | null>(null);
  const [friendSearch, setFriendSearch] = useState('');
  const [serverSearch, setServerSearch] = useState('');
  const [myStatus, setMyStatus] = useState<string>(profile?.status || 'online');
  const [customStatus, setCustomStatus] = useState(profile?.custom_status || '');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [settingsServerId, setSettingsServerId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const servers: Server[] = dbServers.map(s => ({
    id: s.id,
    name: s.name,
    icon: s.icon || '🎮',
    gradient: s.gradient || 'from-primary/40 to-accent/40',
    memberCount: 1,
    onlineCount: 1,
    channels: [],
    members: [],
    messages: [],
  }));

  const openServer = servers.find(s => s.id === openServerId);
  const dmProfile = activeDmUserId ? profiles.find(p => p.user_id === activeDmUserId) : null;

  const onlineFriends = profiles.filter(f => f.status !== 'offline');
  const offlineFriends = profiles.filter(f => f.status === 'offline');
  const filteredOnline = onlineFriends.filter(f => f.username.toLowerCase().includes(friendSearch.toLowerCase()));
  const filteredOffline = offlineFriends.filter(f => f.username.toLowerCase().includes(friendSearch.toLowerCase()));
  const filteredServers = servers.filter(s => s.name.toLowerCase().includes(serverSearch.toLowerCase()));

  const currentStatusOption = statusOptions.find(s => s.value === myStatus) || statusOptions[0];

  const handleFriendClick = (userId: string) => {
    setActiveDmUserId(userId);
    setUnreadCounts(prev => ({ ...prev, [userId]: 0 }));
  };

  const handleBackToServers = () => {
    setActiveDmUserId(null);
  };

  const handleStatusChange = (status: string) => {
    setMyStatus(status);
    updateProfile({ status });
  };

  const handleCustomStatusChange = (text: string) => {
    setCustomStatus(text);
    updateProfile({ custom_status: text });
  };

  const handleCreateServer = useCallback(async (data: { name: string; icon: string; gradient: string; channels: string[] }) => {
    await createServer(data.name, data.icon, data.gradient, data.channels);
  }, [createServer]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background relative cyber-grid">
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsla(160, 100%, 50%, 0.04), transparent 60%)' }} />
      <div className="fixed bottom-[-15%] right-[-5%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsla(280, 100%, 65%, 0.03), transparent 60%)' }} />

      <div className="relative z-10 h-full flex">
        <aside className="w-[280px] flex flex-col glass-strong border-r border-border/50 shrink-0">
          <div className="p-5 border-b border-border/50">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="w-14 h-14 rounded-2xl object-cover neon-green" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-lg font-bold neon-green">
                    {username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[2.5px] border-card",
                  currentStatusOption.color
                )} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-foreground">{username}</p>
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors mt-0.5"
                >
                  <span className={cn("w-2 h-2 rounded-full inline-block", currentStatusOption.color)} />
                  {customStatus || currentStatusOption.label}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-0.5">
                    <polyline points="6,9 12,15 18,9" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => setShowProfile(true)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors hover:scale-105 active:scale-95 transform"
              >
                <GameIcon name="settings" size={16} />
              </button>
            </div>

            <StatusPicker
              open={showStatusMenu}
              currentStatus={myStatus}
              customStatus={customStatus}
              onStatusChange={handleStatusChange}
              onCustomStatusChange={handleCustomStatusChange}
              onClose={() => setShowStatusMenu(false)}
            />
          </div>

          <div className="px-3 pt-3 pb-1 flex items-center gap-1.5">
            <button
              onClick={() => setShowAddFriend(true)}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground text-[11px] font-medium transition-colors border border-border/30"
            >
              <GameIcon name="plus" size={12} />
              Добавить
            </button>
            <button
              onClick={handleBackToServers}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-medium transition-colors border border-border/30",
                !activeDmUserId
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <GameIcon name="gamepad" size={12} />
              Серверы
            </button>
          </div>

          <div className="px-3 pt-2 pb-2">
            <div className="flex items-center gap-2 bg-secondary/60 rounded-lg px-3 py-2 border border-border/30">
              <GameIcon name="search" size={13} className="text-muted-foreground" />
              <input
                value={friendSearch}
                onChange={e => setFriendSearch(e.target.value)}
                placeholder="Найти друга..."
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto smooth-scroll px-2 pb-3">
            {filteredOnline.length > 0 && (
              <div className="mt-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  В сети — {filteredOnline.length}
                </p>
                {filteredOnline.map(profile => (
                  <button
                    key={profile.user_id}
                    onClick={() => handleFriendClick(profile.user_id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group mb-0.5 text-left",
                      activeDmUserId === profile.user_id
                        ? "bg-primary/10 neon-border"
                        : "hover:bg-secondary/60"
                    )}
                  >
                    <div className="relative shrink-0">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/25 to-accent/25 flex items-center justify-center text-foreground text-[11px] font-bold group-hover:from-primary/40 group-hover:to-accent/40 transition-all">
                          {profile.username.slice(0, 2)}
                        </div>
                      )}
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                        profile.status === 'online' ? 'bg-primary' : profile.status === 'afk' ? 'bg-yellow-500' : profile.status === 'dnd' ? 'bg-destructive' : 'bg-muted-foreground/40'
                      )} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-foreground truncate">{profile.display_name || profile.username}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {profile.status === 'online' ? 'В сети' : profile.status === 'afk' ? 'Отошёл' : 'В сети'}
                      </p>
                    </div>
                    {(unreadCounts[profile.user_id] || 0) > 0 && activeDmUserId !== profile.user_id && (
                      <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1 shrink-0">
                        {unreadCounts[profile.user_id]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {filteredOffline.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-2">
                  Не в сети — {filteredOffline.length}
                </p>
                {filteredOffline.map(profile => (
                  <button
                    key={profile.user_id}
                    onClick={() => handleFriendClick(profile.user_id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors opacity-45 hover:opacity-65 mb-0.5 text-left",
                      activeDmUserId === profile.user_id ? "bg-primary/10 neon-border opacity-70" : "hover:bg-secondary/40"
                    )}
                  >
                    <div className="relative shrink-0">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover opacity-60" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground text-[11px] font-bold">
                          {profile.username.slice(0, 2)}
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card bg-muted-foreground/40" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-muted-foreground truncate">{profile.display_name || profile.username}</p>
                      <p className="text-[11px] text-muted-foreground/50 truncate">Не в сети</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {profiles.length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-muted-foreground/50">Пока нет друзей</p>
                <p className="text-[10px] text-muted-foreground/30 mt-1">Зарегистрируй ещё аккаунт для теста</p>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          {dmProfile ? (
            <DirectChat
              key={dmProfile.user_id}
              user={{
                id: dmProfile.user_id,
                name: dmProfile.display_name || dmProfile.username,
                avatar: dmProfile.avatar_url || undefined,
                status: dmProfile.status as any,
              }}
              messages={[]}
              onClose={handleBackToServers}
              onNewMessage={() => {}}
            />
          ) : (
            <div className="flex flex-col h-full">
              <header className="h-14 flex items-center justify-between px-6 glass-strong border-b border-border/50 shrink-0">
                <h1 className="text-base font-bold text-foreground">Мои серверы</h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-1.5 w-[240px] border border-border/50">
                    <GameIcon name="search" size={14} />
                    <input
                      value={serverSearch}
                      onChange={e => setServerSearch(e.target.value)}
                      placeholder="Поиск серверов..."
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
                    />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative hover:scale-105 active:scale-95 transform"
                    >
                      <GameIcon name="bell" size={18} />
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                    </button>
                    <NotificationsDropdown
                      open={showNotifications}
                      onClose={() => setShowNotifications(false)}
                    />
                  </div>
                  <button
                    onClick={() => setShowCreateServer(true)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold neon-green hover:neon-green-strong transition-shadow hover:scale-[1.02] active:scale-[0.98] transform"
                  >
                    <GameIcon name="plus" size={15} />
                    Создать
                  </button>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto smooth-scroll">
                <div className="max-w-5xl mx-auto p-6">
                  {filteredServers.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="text-muted-foreground text-sm">
                        {dbServers.length === 0 ? 'У тебя пока нет серверов' : 'Серверов не найдено'}
                      </p>
                      <p className="text-muted-foreground/50 text-xs mt-1">
                        {dbServers.length === 0 ? 'Создай свой первый сервер!' : 'Попробуй другой запрос'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredServers.map((server, i) => (
                        <ServerCard key={server.id} server={server} index={i} onOpen={setOpenServerId} />
                      ))}
                    </div>
                  )}
                </div>
              </main>
            </div>
          )}
        </div>
      </div>

      {openServer && (
        <ChatView server={openServer} onBack={() => setOpenServerId(null)} onOpenSettings={() => setSettingsServerId(openServer.id)} />
      )}

      {(() => {
        const settingsServer = settingsServerId ? servers.find(s => s.id === settingsServerId) : null;
        if (!settingsServer) return null;
        return (
          <ServerSettingsModal
            open={true}
            onClose={() => setSettingsServerId(null)}
            server={settingsServer}
            onUpdate={(updated) => {
              updateServer(updated.id, { name: updated.name });
            }}
          />
        );
      })()}

      {showProfile && (
        <ProfilePanel onClose={() => setShowProfile(false)} onLogout={onLogout} />
      )}

      <CreateServerModal
        open={showCreateServer}
        onClose={() => setShowCreateServer(false)}
        onCreate={handleCreateServer}
      />

      <AddFriendModal
        open={showAddFriend}
        onClose={() => setShowAddFriend(false)}
      />
    </div>
  );
};

export default Index;
