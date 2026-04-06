import { useState, useEffect, useRef } from 'react';
import { User } from '@/types/chat';
import { cn } from '@/lib/utils';
import GameIcon from '@/components/GameIcon';
import { useLiveKit, Participant } from '@/hooks/useLiveKit';
import { ConnectionState } from 'livekit-client';

interface CallOverlayProps {
  user: User;
  type: 'voice' | 'video';
  onEnd: () => void;
  roomName?: string;
}

const avatarGradients = [
  'from-primary/40 to-accent/40',
  'from-cyan-500/40 to-teal-400/40',
  'from-rose-500/40 to-pink-400/40',
  'from-amber-500/40 to-orange-400/40',
  'from-emerald-500/40 to-green-400/40',
];

const VideoTile = ({ participant, large }: { participant: Participant; large?: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.videoTrack) {
      videoRef.current.srcObject = new MediaStream([participant.videoTrack]);
    }
  }, [participant.videoTrack]);

  useEffect(() => {
    if (screenRef.current && participant.screenTrack) {
      screenRef.current.srcObject = new MediaStream([participant.screenTrack]);
    }
  }, [participant.screenTrack]);

  if (participant.isScreenSharing && participant.screenTrack) {
    return (
      <div className={cn("relative rounded-2xl overflow-hidden bg-card border border-border/50", large ? "w-full h-full" : "w-full aspect-video")}>
        <video ref={screenRef} autoPlay playsInline className="w-full h-full object-contain bg-black" />
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5">
          <span className="text-[11px] text-foreground font-medium">{participant.name}</span>
        </div>
      </div>
    );
  }

  if (participant.isCameraOn && participant.videoTrack) {
    return (
      <div className={cn("relative rounded-2xl overflow-hidden bg-card border border-border/50", large ? "w-full h-full" : "w-full aspect-video")}>
        <video ref={videoRef} autoPlay playsInline muted={participant.identity === 'local'} className="w-full h-full object-cover" />
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5">
          {participant.isSpeaking && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
          <span className="text-[11px] text-foreground font-medium">{participant.name}</span>
        </div>
      </div>
    );
  }

  const colorIdx = participant.identity.charCodeAt(0) % avatarGradients.length;
  return (
    <div className={cn(
      "relative rounded-2xl overflow-hidden bg-card border border-border/50 flex items-center justify-center",
      large ? "w-full h-full" : "w-full aspect-video",
      participant.isSpeaking && "ring-2 ring-primary ring-offset-2 ring-offset-background"
    )}>
      <div className={cn("w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-foreground text-2xl font-bold", avatarGradients[colorIdx])}>
        {participant.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5">
        {participant.isSpeaking && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
        <span className="text-[11px] text-foreground font-medium">{participant.name}</span>
      </div>
    </div>
  );
};

const CallOverlay = ({ user, type, onEnd, roomName }: CallOverlayProps) => {
  const {
    connectionState, participants, localParticipant, connect, disconnect,
    toggleMute, toggleCamera, toggleScreenShare, isMuted, isCameraOn, isScreenSharing, error,
  } = useLiveKit();

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!connectedRef.current) {
      connectedRef.current = true;
      const room = roomName || `dm-${[user.id].sort().join('-')}`;
      connect(room);
    }
  }, []);

  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [connectionState]);

  const handleEnd = () => {
    disconnect();
    clearInterval(timerRef.current);
    onEnd();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const allParticipants = [...(localParticipant ? [localParticipant] : []), ...participants];
  const hasVideo = allParticipants.some(p => p.isCameraOn || p.isScreenSharing);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background/98 animate-fade-in">
      <div className="h-12 flex items-center justify-between px-5 glass-strong border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full",
            connectionState === ConnectionState.Connected ? "bg-primary" :
            connectionState === ConnectionState.Connecting ? "bg-yellow-500 animate-pulse" : "bg-destructive"
          )} />
          <span className="text-sm font-medium text-foreground">
            {connectionState === ConnectionState.Connected
              ? `${type === 'video' ? 'Видеозвонок' : 'Голосовой звонок'} — ${formatTime(elapsed)}`
              : connectionState === ConnectionState.Connecting ? 'Подключение...' : 'Отключено'}
          </span>
          {error && <span className="text-xs text-destructive ml-2">{error}</span>}
        </div>
        <span className="text-xs text-muted-foreground">{allParticipants.length} {allParticipants.length === 1 ? 'участник' : 'участника'}</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        {hasVideo ? (
          <div className={cn("w-full h-full grid gap-3",
            allParticipants.length <= 1 ? "grid-cols-1" : allParticipants.length <= 4 ? "grid-cols-2" : "grid-cols-3"
          )}>
            {allParticipants.map(p => <VideoTile key={p.identity} participant={p} large={allParticipants.length === 1} />)}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-6">
            {allParticipants.map(p => {
              const colorIdx = p.identity.charCodeAt(0) % avatarGradients.length;
              return (
                <div key={p.identity} className="flex flex-col items-center gap-3">
                  <div className={cn("w-24 h-24 rounded-3xl bg-gradient-to-br flex items-center justify-center text-foreground text-2xl font-bold transition-all",
                    avatarGradients[colorIdx], p.isSpeaking && "ring-4 ring-primary/40 ring-offset-4 ring-offset-background scale-105"
                  )}>
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                      {p.isSpeaking && <span className="text-[10px] text-primary font-medium">Говорит</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="h-20 flex items-center justify-center gap-3 glass-strong border-t border-border/50">
        <button onClick={toggleMute}
          className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95",
            isMuted ? "bg-destructive/20 text-destructive" : "bg-secondary hover:bg-secondary/80 text-foreground"
          )}>
          <GameIcon name={isMuted ? 'volume' : 'volume'} size={20} />
        </button>
        <button onClick={toggleCamera}
          className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95",
            !isCameraOn ? "bg-secondary hover:bg-secondary/80 text-muted-foreground" : "bg-primary/20 text-primary"
          )}>
          <GameIcon name="video" size={20} />
        </button>
        <button onClick={toggleScreenShare}
          className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95",
            isScreenSharing ? "bg-primary/20 text-primary neon-green" : "bg-secondary hover:bg-secondary/80 text-foreground"
          )}>
          <GameIcon name="screen-share" size={20} />
        </button>
        <div className="w-px h-8 bg-border/50 mx-1" />
        <button onClick={handleEnd}
          className="w-14 h-14 rounded-2xl flex items-center justify-center bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all hover:scale-105 active:scale-95">
          <GameIcon name="phone" size={20} />
        </button>
      </div>
    </div>
  );
};

export default CallOverlay;
