import { useState } from 'react';
import { cn } from '@/lib/utils';
import GameIcon from '@/components/GameIcon';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const { signIn, signUp } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!email.trim() || !username.trim() || !password.trim()) return;
        if (password.length < 6) {
          setError('Пароль минимум 6 символов');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email.trim(), password, username.trim());
        if (error) setError(error.message === 'User already registered' ? 'Этот email уже занят' : error.message);
      } else {
        if (!email.trim() || !password.trim()) return;
        const { error } = await signIn(email.trim(), password);
        if (error) setError(error.message === 'Invalid login credentials' ? 'Неверный email или пароль' : error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = isRegister
    ? email.trim() && username.trim() && password.trim()
    : email.trim() && password.trim();

  return (
    <div className="h-screen w-screen overflow-hidden bg-background cyber-grid flex items-center justify-center relative">
      <div className="fixed top-[-30%] left-[20%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsla(160, 100%, 50%, 0.06), transparent 60%)' }} />
      <div className="fixed bottom-[-20%] right-[10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsla(280, 100%, 65%, 0.04), transparent 60%)' }} />

      <div className="relative z-10 w-full max-w-[420px] mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-wider neon-text-green mb-2">KURILKA</h1>
          <p className="text-sm text-muted-foreground">
            {isRegister ? 'Создай аккаунт и присоединяйся' : 'Рад тебя видеть!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 border border-border/50 neon-border space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Email</label>
            <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-4 py-3 border border-border/30 focus-within:border-primary/40 transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted-foreground shrink-0">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="mail@example.com"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
                autoFocus
              />
            </div>
          </div>

          {isRegister && (
            <div className="animate-fade-in">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Никнейм</label>
              <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-4 py-3 border border-border/30 focus-within:border-primary/40 transition-colors">
                <GameIcon name="users" size={15} className="text-muted-foreground shrink-0" />
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="xatab"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Пароль</label>
            <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-4 py-3 border border-border/30 focus-within:border-primary/40 transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted-foreground shrink-0">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors">
                <GameIcon name={showPassword ? 'eye-off' : 'eye'} size={15} />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5 animate-fade-in">
              <p className="text-xs text-destructive font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={cn(
              "w-full py-3 rounded-xl text-sm font-bold transition-all duration-150",
              canSubmit && !loading
                ? "bg-primary text-primary-foreground neon-green hover:neon-green-strong active:scale-[0.98] transform"
                : "bg-secondary text-muted-foreground/40 cursor-not-allowed"
            )}
          >
            {loading ? '...' : isRegister ? 'Создать аккаунт' : 'Войти'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 gradient-separator" />
            <span className="text-[10px] text-muted-foreground/50">или</span>
            <div className="flex-1 gradient-separator" />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-primary hover:underline ml-1.5 font-semibold"
            >
              {isRegister ? 'Войти' : 'Создать'}
            </button>
          </p>
        </form>

        <a
          href="https://kurilka.online/download/KURILKA-Setup.exe"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-secondary/80 border border-border/50 text-sm font-semibold text-foreground hover:bg-secondary hover:border-primary/30 transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] transform group"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary group-hover:translate-y-0.5 transition-transform">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Скачать для Windows
        </a>

        <p className="text-center text-[10px] text-muted-foreground/30 mt-4">KURILKA © 2026 — Место для своих</p>
      </div>
    </div>
  );
};

export default Login;
