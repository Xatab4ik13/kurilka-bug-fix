import { useState, memo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface EmojiPickerProps {
  open: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const categories = [
  { name: 'Частые', emojis: ['😂', '❤️', '🔥', '👍', '😭', '🥺', '✨', '😎', '💀', '🤣', '😅', '🙏'] },
  { name: 'Смайлы', emojis: ['😀', '😃', '😄', '😁', '😆', '🤤', '😋', '😏', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😤', '😠', '🤯', '😱', '🥶', '🤢', '💩', '🤡', '👻', '😈'] },
  { name: 'Жесты', emojis: ['👋', '🤚', '✋', '🖖', '👌', '🤌', '✌️', '🤘', '🤙', '👊', '✊', '🫡', '💪', '🫶', '👏', '🙌'] },
  { name: 'Игры', emojis: ['🎮', '🕹️', '👾', '🎯', '🏆', '⚔️', '🛡️', '🗡️', '💎', '🎲', '♟️', '🎰', '🃏', '🧩', '🚀', '💣'] },
  { name: 'Символы', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💯', '💢', '💥', '🔥', '⭐', '✨', '⚡', '💫'] },
];

const EmojiPicker = ({ open, onSelect, onClose }: EmojiPickerProps) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={ref} className="absolute bottom-full right-0 mb-2 w-[300px] bg-card rounded-2xl border border-border/50 neon-border overflow-hidden animate-fade-in z-50">
      <div className="flex border-b border-border/30 px-1 pt-1">
        {categories.map((cat, i) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(i)}
            className={cn(
              "flex-1 py-2 text-[10px] font-semibold rounded-t-lg transition-colors",
              activeCategory === i
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="p-2 h-[180px] overflow-y-auto smooth-scroll">
        <div className="grid grid-cols-8 gap-0.5">
          {categories[activeCategory].emojis.map((emoji, i) => (
            <button
              key={`${emoji}-${i}`}
              onClick={() => { onSelect(emoji); onClose(); }}
              className="w-full aspect-square flex items-center justify-center text-lg rounded-lg hover:bg-secondary/80 transition-colors active:scale-90 transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(EmojiPicker);
