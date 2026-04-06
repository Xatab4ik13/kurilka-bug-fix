import { useState } from 'react';
import { cn } from '@/lib/utils';
import GameIcon from '@/components/GameIcon';

interface CreateServerModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (server: { name: string; icon: string; gradient: string; channels: string[] }) => void;
}

const iconOptions = ['🎮', '⚔️', '🎯', '🎬', '🚀', '💎', '🔥', '🌟', '🎵', '🏆', '🐉', '👾'];

const gradientOptions = [
  { name: 'Неон', value: 'from-emerald-500 via-teal-500 to-cyan-500' },
  { name: 'Фиолет', value: 'from-violet-600 via-purple-500 to-fuchsia-500' },
  { name: 'Огонь', value: 'from-amber-500 via-orange-500 to-red-500' },
  { name: 'Роза', value: 'from-red-500 via-rose-500 to-pink-500' },
  { name: 'Океан', value: 'from-blue-500 via-indigo-500 to-violet-500' },
  { name: 'Кибер', value: 'from-cyan-500 via-teal-500 to-emerald-500' },
];

const CreateServerModal = ({ open, onClose, onCreate }: CreateServerModalProps) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎮');
  const [selectedGradient, setSelectedGradient] = useState(gradientOptions[0].value);
  const [channels, setChannels] = useState<string[]>(['общий']);
  const [newChannel, setNewChannel] = useState('');

  const reset = () => {
    setStep(1);
    setName('');
    setSelectedIcon('🎮');
    setSelectedGradient(gradientOptions[0].value);
    setChannels(['общий']);
    setNewChannel('');
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 200);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), icon: selectedIcon, gradient: selectedGradient, channels });
    handleClose();
  };

  const addChannel = () => {
    const ch = newChannel.trim().toLowerCase();
    if (ch && !channels.includes(ch)) {
      setChannels(prev => [...prev, ch]);
      setNewChannel('');
    }
  };

  const removeChannel = (ch: string) => {
    if (channels.length > 1) {
      setChannels(prev => prev.filter(c => c !== ch));
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-background/90" />

      <div
        onClick={e => e.stopPropagation()}
        className="relative z-10 w-[520px] max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-border/50 neon-border animate-scale-in"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
          <div>
            <h2 className="text-lg font-bold text-foreground">Создать сервер</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {step === 1 ? 'Название и внешний вид' : step === 2 ? 'Каналы для общения' : 'Всё готово!'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 pt-4">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors duration-200",
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              )}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={cn(
                  "flex-1 h-0.5 rounded-full transition-colors duration-200",
                  step > s ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="px-6 py-5">
          {step === 1 && (
            <div className="space-y-5">
              <div className="rounded-xl overflow-hidden border border-border/30">
                <div className={cn("h-20 bg-gradient-to-br relative", selectedGradient)}>
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  <span className="absolute top-3 left-4 text-3xl">{selectedIcon}</span>
                </div>
                <div className="bg-card px-4 py-3">
                  <p className="font-bold text-foreground text-sm">{name || 'Мой сервер'}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">0 участников</p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Название сервера
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Например: Наш рейд"
                  maxLength={32}
                  className="w-full bg-secondary/60 rounded-xl px-4 py-3 text-sm text-foreground border border-border/30 focus:border-primary/40 outline-none transition-colors placeholder:text-muted-foreground/40"
                  autoFocus
                />
                <p className="text-[10px] text-muted-foreground/50 mt-1 text-right">{name.length}/32</p>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Иконка</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors duration-100",
                        selectedIcon === icon
                          ? "bg-primary/15 border border-primary/30"
                          : "bg-secondary/60 hover:bg-secondary border border-border/30"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Цвет баннера</label>
                <div className="flex gap-2">
                  {gradientOptions.map(g => (
                    <button
                      key={g.name}
                      onClick={() => setSelectedGradient(g.value)}
                      className={cn(
                        "flex-1 h-10 rounded-xl bg-gradient-to-r transition-opacity duration-100",
                        g.value,
                        selectedGradient === g.value
                          ? "ring-2 ring-foreground ring-offset-2 ring-offset-card"
                          : "opacity-60 hover:opacity-90"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Текстовые каналы</label>
                <div className="space-y-1.5 mb-3">
                  {channels.map(ch => (
                    <div key={ch} className="flex items-center gap-2 bg-secondary/40 rounded-xl px-3 py-2.5 border border-border/30 group">
                      <GameIcon name="hash" size={14} className="text-primary" />
                      <span className="text-sm text-foreground flex-1">{ch}</span>
                      {channels.length > 1 && (
                        <button
                          onClick={() => removeChannel(ch)}
                          className="text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={newChannel}
                    onChange={e => setNewChannel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addChannel()}
                    placeholder="Новый канал..."
                    className="flex-1 bg-secondary/60 rounded-xl px-4 py-2.5 text-sm text-foreground border border-border/30 focus:border-primary/40 outline-none transition-colors placeholder:text-muted-foreground/40"
                  />
                  <button
                    onClick={addChannel}
                    disabled={!newChannel.trim()}
                    className={cn(
                      "p-2.5 rounded-xl transition-colors",
                      newChannel.trim()
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground/30"
                    )}
                  >
                    <GameIcon name="plus" size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <GameIcon name="volume" size={14} className="text-accent" />
                  Голосовой канал «Лобби» будет создан автоматически
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-4 space-y-5">
              <div className="rounded-2xl overflow-hidden border border-primary/20 mx-auto max-w-[280px]">
                <div className={cn("h-24 bg-gradient-to-br relative", selectedGradient)}>
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 text-4xl">{selectedIcon}</span>
                </div>
                <div className="bg-card px-4 py-3 text-left">
                  <p className="font-bold text-foreground">{name || 'Мой сервер'}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {channels.length} канал{channels.length > 1 ? (channels.length < 5 ? 'а' : 'ов') : ''} • 1 участник
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {channels.map(ch => (
                      <span key={ch} className="text-[10px] text-muted-foreground bg-secondary/60 rounded-lg px-2 py-0.5 flex items-center gap-1">
                        <GameIcon name="hash" size={9} />
                        {ch}
                      </span>
                    ))}
                    <span className="text-[10px] text-muted-foreground bg-secondary/60 rounded-lg px-2 py-0.5 flex items-center gap-1">
                      <GameIcon name="volume" size={9} />
                      Лобби
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Всё готово! Нажми «Создать» чтобы запустить сервер 🚀
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border/40">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Назад
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !name.trim()}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                step === 1 && !name.trim()
                  ? "bg-secondary text-muted-foreground/40 cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:brightness-110"
              )}
            >
              Далее
            </button>
          ) : (
            <button
              onClick={handleCreate}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:brightness-110 transition-all"
            >
              🚀 Создать
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateServerModal;
