import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StatusPickerProps {
  open: boolean;
  currentStatus: string;
  customStatus: string;
  onStatusChange: (status: string) => void;
  onCustomStatusChange: (text: string) => void;
  onClose: () => void;
}

const statusOptions = [
  { value: 'online', label: 'В сети', color: 'bg-primary', icon: '🟢' },
  { value: 'afk', label: 'Отошёл', color: 'bg-yellow-500', icon: '🌙' },
  { value: 'dnd', label: 'Не беспокоить', color: 'bg-destructive', icon: '⛔' },
  { value: 'offline', label: 'Невидимка', color: 'bg-muted-foreground/40', icon: '👻' },
] as const;

const StatusPicker = ({ open, currentStatus, customStatus, onStatusChange, onCustomStatusChange, onClose }: StatusPickerProps) => {
  const [editingCustom, setEditingCustom] = useState(false);
  const [customInput, setCustomInput] = useState(customStatus);

  if (!open) return null;

  const handleSaveCustom = () => {
    onCustomStatusChange(customInput);
    setEditingCustom(false);
  };

  return (
    <div className="mt-3 rounded-xl bg-card border border-border/50 overflow-hidden animate-fade-in">
      <div className="px-3 py-2.5 border-b border-border/30">
        {editingCustom ? (
          <div className="flex items-center gap-2">
            <input
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveCustom()}
              placeholder="😎 Что делаешь?"
              className="flex-1 bg-secondary/60 rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none border border-border/30"
              autoFocus
            />
            <button
              onClick={handleSaveCustom}
              className="text-[10px] text-primary font-bold hover:underline"
            >
              ОК
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingCustom(true)}
            className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {customStatus || '✏️ Установить статус...'}
          </button>
        )}
      </div>

      {statusOptions.map(opt => (
        <button
          key={opt.value}
          onClick={() => { onStatusChange(opt.value); onClose(); }}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors",
            currentStatus === opt.value ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          )}
        >
          <span className={cn("w-2.5 h-2.5 rounded-full", opt.color)} />
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default StatusPicker;
