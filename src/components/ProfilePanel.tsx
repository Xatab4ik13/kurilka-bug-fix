import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import GameIcon from '@/components/GameIcon';
import { useAuth, ThemeId } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const THEMES: { id: ThemeId; name: string; bg: string; accent: string }[] = [
  { id: 'cyber-neon', name: 'Кибер-неон', bg: 'from-emerald-900/40 to-emerald-600/20', accent: 'bg-emerald-500' },
  { id: 'purple', name: 'Пурпур', bg: 'from-violet-900/40 to-violet-600/20', accent: 'bg-violet-500' },
  { id: 'ocean', name: 'Океан', bg: 'from-blue-900/40 to-blue-600/20', accent: 'bg-blue-500' },
  { id: 'sunset', name: 'Закат', bg: 'from-rose-900/40 to-rose-600/20', accent: 'bg-rose-500' },
  { id: 'amber', name: 'Янтарь', bg: 'from-amber-900/40 to-amber-600/20', accent: 'bg-amber-500' },
  { id: 'minimal', name: 'Минимал', bg: 'from-gray-800/40 to-gray-600/20', accent: 'bg-gray-500' },
];

interface ProfilePanelProps {
  onClose: () => void;
  onLogout: () => void;
}

const ProfilePanel = ({ onClose, onLogout }: ProfilePanelProps) => {
  const { profile, updateProfile, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSection, setActiveSection] = useState<'profile' | 'appearance' | 'notifications' | 'keybinds' | 'audio'>('profile');
  const [nickname, setNickname] = useState(profile?.display_name || profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const currentThemeId = profile?.theme || 'cyber-neon';
  const [fontSize, setFontSize] = useState(14);
  const [bgEffect, setBgEffect] = useState(0);
  const [notifSettings, setNotifSettings] = useState({ dm: true, mentions: true, chatSounds: false, voice: true });
  const [audioSettings, setAudioSettings] = useState({
    inputDevice: 'default', outputDevice: 'default', inputVolume: 80, outputVolume: 100,
    inputSensitivity: 45, noiseSuppression: true, echoCancellation: true, autoGainControl: true, voiceActivation: true,
  });

  const sections = [
    { id: 'profile' as const, label: 'Профиль', icon: 'users' },
    { id: 'audio' as const, label: 'Голос и звук', icon: 'headphones' },
    { id: 'appearance' as const, label: 'Оформление', icon: 'settings' },
    { id: 'notifications' as const, label: 'Уведомления', icon: 'bell' },
    { id: 'keybinds' as const, label: 'Горячие клавиши', icon: 'hash' },
  ];

  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hasChanges = nickname !== (profile?.display_name || profile?.username || '') || bio !== (profile?.bio || '');

  const handleSaveProfile = async () => {
    setSaving(true);
    await updateProfile({ display_name: nickname, bio });
    toast({ title: 'Профиль сохранён ✅' });
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { toast({ title: 'Можно загружать только изображения', variant: 'destructive' }); return; }
    if (file.size > 2 * 1024 * 1024) { toast({ title: 'Максимальный размер — 2 МБ', variant: 'destructive' }); return; }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) { toast({ title: 'Ошибка загрузки', description: error.message, variant: 'destructive' }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    await updateProfile({ avatar_url: `${publicUrl}?t=${Date.now()}` });
    toast({ title: 'Аватар обновлён ✅' });
    setUploading(false);
  };

  const avatarUrl = profile?.avatar_url;
  const initials = (profile?.display_name || profile?.username || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex bg-background cyber-grid animate-fade-in">
      <div className="w-[220px] flex flex-col glass-strong border-r border-border/50">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border/50">
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors hover:scale-105 active:scale-95 transform">
            <GameIcon name="arrow-left" size={16} />
          </button>
          <span className="text-sm font-bold text-foreground">Настройки</span>
        </div>
        <div className="flex-1 p-2 space-y-0.5">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeSection === s.id ? "bg-primary/10 text-primary neon-border" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}>
              <GameIcon name={s.icon} size={15} glow={activeSection === s.id} />
              {s.label}
            </button>
          ))}
        </div>
        <div className="p-2 border-t border-border/50">
          <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Выйти
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-8">
          {activeSection === 'profile' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-start gap-6">
                <div className="relative group">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-24 h-24 rounded-2xl object-cover neon-green" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-3xl font-bold neon-green">
                      {initials}
                    </div>
                  )}
                  <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-2xl bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    <span className="text-xs text-foreground font-medium">{uploading ? '...' : 'Изменить'}</span>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-card bg-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Никнейм</label>
                    <input value={nickname} onChange={e => setNickname(e.target.value)}
                      className="w-full bg-card rounded-xl px-4 py-2.5 text-sm text-foreground neon-border focus:neon-green outline-none transition-shadow" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">О себе</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                      className="w-full bg-card rounded-xl px-4 py-2.5 text-sm text-foreground neon-border focus:neon-green outline-none transition-shadow resize-none" />
                  </div>
                  {hasChanges && (
                    <button onClick={handleSaveProfile} disabled={saving}
                      className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold neon-green hover:neon-green-strong transition-shadow disabled:opacity-50">
                      {saving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">Информация</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card rounded-xl p-4 neon-border">
                    <p className="text-[10px] text-muted-foreground">Имя пользователя</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{profile?.username}</p>
                  </div>
                  <div className="bg-card rounded-xl p-4 neon-border">
                    <p className="text-[10px] text-muted-foreground">Статус</p>
                    <p className="text-sm font-semibold text-foreground mt-1 capitalize">{profile?.status || 'online'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">Оформление</h2>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Тема</label>
                <div className="grid grid-cols-3 gap-3">
                  {THEMES.map(theme => (
                    <button key={theme.id} onClick={async () => {
                      document.documentElement.setAttribute('data-theme', theme.id);
                      await updateProfile({ theme: theme.id } as any);
                      toast({ title: `Тема «${theme.name}» применена ✅` });
                    }}
                      className={cn("relative rounded-xl p-4 bg-gradient-to-br transition-all text-center", theme.bg,
                        currentThemeId === theme.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background neon-border" : "border border-border/30 hover:border-border/60"
                      )}>
                      <div className={cn("w-6 h-6 rounded-full mx-auto mb-2", theme.accent)} />
                      <p className="text-xs font-medium text-foreground">{theme.name}</p>
                      {currentThemeId === theme.id && (
                        <div className="absolute top-2 right-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Размер шрифта</label>
                  <span className="text-xs text-primary font-bold">{fontSize}px</span>
                </div>
                <div className="flex items-center gap-4 bg-card rounded-xl px-4 py-3 neon-border">
                  <span className="text-xs text-muted-foreground">A</span>
                  <input type="range" min="12" max="18" value={fontSize} onChange={e => setFontSize(+e.target.value)} className="flex-1 accent-primary" />
                  <span className="text-lg text-muted-foreground">A</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'audio' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">Голос и звук</h2>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Устройство ввода (микрофон)</label>
                <select value={audioSettings.inputDevice} onChange={e => setAudioSettings(prev => ({ ...prev, inputDevice: e.target.value }))}
                  className="w-full bg-card rounded-xl px-4 py-3 text-sm text-foreground neon-border outline-none appearance-none cursor-pointer">
                  <option value="default">По умолчанию — Встроенный микрофон</option>
                  <option value="headset">Гарнитура USB</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Громкость микрофона</label>
                  <span className="text-xs text-primary font-bold">{audioSettings.inputVolume}%</span>
                </div>
                <input type="range" min="0" max="100" value={audioSettings.inputVolume}
                  onChange={e => setAudioSettings(prev => ({ ...prev, inputVolume: +e.target.value }))} className="w-full accent-primary" />
              </div>
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Обработка звука</p>
                {([
                  { key: 'noiseSuppression' as const, label: 'Подавление шума', desc: 'Убирает фоновые шумы' },
                  { key: 'echoCancellation' as const, label: 'Подавление эха', desc: 'Убирает эхо от динамиков' },
                  { key: 'autoGainControl' as const, label: 'Авто-усиление', desc: 'Выравнивает громкость голоса' },
                  { key: 'voiceActivation' as const, label: 'Активация голосом', desc: 'Микрофон включается когда говоришь' },
                ]).map(item => (
                  <div key={item.key} className="flex items-center justify-between bg-card rounded-xl px-4 py-3.5 neon-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <button onClick={() => setAudioSettings(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={cn("w-11 h-6 rounded-full transition-colors relative shrink-0 ml-3",
                        audioSettings[item.key] ? "bg-primary" : "bg-secondary"
                      )}>
                      <div className="w-[18px] h-[18px] rounded-full bg-foreground absolute top-[3px] transition-all duration-200"
                        style={{ left: audioSettings[item.key] ? '22px' : '3px' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">Уведомления</h2>
              {[
                { key: 'dm' as const, label: 'Личные сообщения', desc: 'Звук и уведомление при новом ЛС' },
                { key: 'mentions' as const, label: 'Упоминания', desc: 'Когда тебя упоминают в чате' },
                { key: 'chatSounds' as const, label: 'Звуки чата', desc: 'Звук отправки и получения сообщений' },
                { key: 'voice' as const, label: 'Голосовые каналы', desc: 'Звук подключения/отключения' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between bg-card rounded-xl px-4 py-3.5 neon-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <button onClick={() => toggleNotif(item.key)}
                    className={cn("w-11 h-6 rounded-full transition-colors relative", notifSettings[item.key] ? "bg-primary" : "bg-secondary")}>
                    <div className="w-[18px] h-[18px] rounded-full bg-foreground absolute top-[3px] transition-all duration-200"
                      style={{ left: notifSettings[item.key] ? '22px' : '3px' }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'keybinds' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground">Горячие клавиши</h2>
              {[
                { action: 'Включить/выключить микрофон', key: 'Ctrl + M' },
                { action: 'Включить/выключить звук', key: 'Ctrl + D' },
                { action: 'Демонстрация экрана', key: 'Ctrl + Shift + S' },
                { action: 'Поиск', key: 'Ctrl + K' },
                { action: 'Настройки', key: 'Ctrl + ,' },
                { action: 'Закрыть окно', key: 'Escape' },
              ].map(item => (
                <div key={item.action} className="flex items-center justify-between bg-card rounded-xl px-4 py-3.5 neon-border">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <kbd className="bg-secondary px-3 py-1 rounded-lg text-xs font-mono text-muted-foreground border border-border/50">{item.key}</kbd>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
