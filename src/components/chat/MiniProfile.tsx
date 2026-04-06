import { User } from '@/types/chat';
import { cn } from '@/lib/utils';

interface MiniProfileProps {
  user: User;
  visible: boolean;
  position: { x: number; y: number };
}

const statusLabels: Record<User['status'], string> = {
  online: 'В сети',
  offline: 'Не в сети',
  'in-game': '🎮 В игре',
  afk: '💤 Отошёл',
};

const statusColors: Record<User['status'], string> = {
  online: 'bg-emerald-500',
  offline: 'bg-muted-foreground/40',
  'in-game': 'bg-violet-500',
  afk: 'bg-yellow-500',
};

const avatarGradients = [
  'from-violet-600 to-purple-400',
  'from-cyan-500 to-teal-400',
  'from-rose-500 to-pink-400',
  'from-amber-500 to-orange-400',
  'from-emerald-500 to-green-400',
];

const MiniProfile = ({ user, visible, position }: MiniProfileProps) => {
  if (!visible) return null;

  const colorIdx = user.id.charCodeAt(1) % avatarGradients.length;

  return (
    <div
      className="fixed z-[100] w-[240px] rounded-2xl overflow-hidden bg-card border border-border/50 shadow-2xl animate-scale-in"
      style={{
        left: Math.min(position.x, window.innerWidth - 260),
        top: Math.min(position.y, window.innerHeight - 200),
      }}
    >
      <div className={cn("h-12 bg-gradient-to-r", avatarGradients[colorIdx])} />
      <div className="px-4 -mt-5">
        <div className="relative inline-block">
          <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-primary-foreground text-xs font-bold border-2 border-card", avatarGradients[colorIdx])}>
            {user.name.slice(0, 2)}
          </div>
          <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card", statusColors[user.status])} />
        </div>
      </div>
      <div className="p-3 pt-1.5 space-y-1.5">
        <h4 className="font-bold text-foreground text-sm">{user.name}</h4>
        <p className="text-[11px] text-muted-foreground">{statusLabels[user.status]}</p>
        {user.game && (
          <p className="text-[11px] text-violet-400">🎮 {user.game}</p>
        )}
      </div>
    </div>
  );
};

export default MiniProfile;
