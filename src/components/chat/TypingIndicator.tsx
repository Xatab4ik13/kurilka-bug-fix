interface TypingIndicatorProps {
  name: string;
}

const TypingIndicator = ({ name }: TypingIndicatorProps) => (
  <div className="flex items-center gap-2 px-5 py-1.5 animate-fade-in">
    <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-card neon-border rounded-tl-md">
      <div className="flex gap-0.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary typing-dot"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
    <span className="text-[11px] text-muted-foreground">
      <span className="text-foreground/70 font-medium">{name}</span> печатает...
    </span>
  </div>
);

export default TypingIndicator;
