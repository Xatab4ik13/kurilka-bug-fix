// Voice channel panel with device selection, screen share preview, speaking indicators
import { useState, useEffect, useRef } from 'react';
import GameIcon from '@/components/GameIcon';
import { cn } from '@/lib/utils';
import { useLiveKit, Participant } from '@/hooks/useLiveKit';
import { ConnectionState } from 'livekit-client';

interface VoiceChannelPanelProps {
  channelName: string;
  serverName: string;
  roomName: string;
  onDisconnect: () => void;
}

const VoiceChannelPanel = ({ channelName, serverName, roomName, onDisconnect }: VoiceChannelPanelProps) => {
  const {
    room, connectionState, participants, localParticipant, connect, disconnect,
    toggleMute, toggleCamera, toggleScreenShare, isMuted, isCameraOn, isScreenSharing, error,
  } = useLiveKit();

  const [connectedOnce, setConnectedOnce] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);
  const [selectedInput, setSelectedInput] = useState<string>('');
  const [selectedOutput, setSelectedOutput] = useState<string>('');
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!connectedOnce) {
      setConnectedOnce(true);
      connect(roomName);
    }
  }, [connectedOnce, connect, roomName]);

  // Load available audio devices
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioInputs(devices.filter(d => d.kind === 'audioinput'));
        setAudioOutputs(devices.filter(d => d.kind === 'audiooutput'));
      } catch (e) {
        console.error('Failed to enumerate devices:', e);
      }
    };
    loadDevices();
    navigator.mediaDevices?.addEventListener('devicechange', loadDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', loadDevices);
    };
  }, []);

  // Show screen share preview
  useEffect(() => {
    if (localParticipant?.screenTrack && screenVideoRef.current) {
      const stream = new MediaStream([localParticipant.screenTrack]);
      screenVideoRef.current.srcObject = stream;
    } else if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }
  }, [localParticipant?.screenTrack]);

  const handleDisconnect = () => {
    disconnect();
    onDisconnect();
  };

  const handleSwitchInput = async (deviceId: string) => {
    setSelectedInput(deviceId);
    if (room) {
      try {
        await room.switchActiveDevice('audioinput', deviceId);
      } catch (e) {
        console.error('Failed to switch input:', e);
      }
    }
  };

  const handleSwitchOutput = async (deviceId: string) => {
    setSelectedOutput(deviceId);
    if (room) {
      try {
        await room.switchActiveDevice('audiooutput', deviceId);
      } catch (e) {
        console.error('Failed to switch output:', e);
      }
    }
  };

  const allParticipants = [...(localParticipant ? [localParticipant] : []), ...participants];

  return (
    <div
      className="fixed bottom-4 left-[290px] z-40 w-[320px] rounded-2xl glass-strong border border-border/50 overflow-hidden animate-fade-in"
      style={{ boxShadow: '0 20px 50px hsla(0, 0%, 0%, 0.5)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <GameIcon name="volume" size={16} glow className="text-primary" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-primary truncate">{channelName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{serverName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px]">
          {connectionState === ConnectionState.Connected ? (
            <span className="flex items-center gap-1 text-primary/60">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Подключено
            </span>
          ) : connectionState === ConnectionState.Connecting ? (
            <span className="flex items-center gap-1 text-yellow-500">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
              Подключение...
            </span>
          ) : (
            <span className="flex items-center gap-1 text-destructive">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
              Отключено
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-b border-border/30">
          <p className="text-[10px] text-destructive">{error}</p>
        </div>
      )}

      {/* Participants */}
      <div className="px-3 py-2 max-h-[160px] overflow-y-auto">
        {allParticipants.map(p => (
          <div key={p.identity} className="flex items-center gap-2.5 py-1.5 px-1 rounded-lg hover:bg-secondary/30 transition-all">
            <div className="relative">
              <div className={cn(
                "w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-[10px] font-bold text-foreground transition-all duration-200",
                p.isSpeaking && "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
              )}>
                {p.name.slice(0, 2)}
              </div>
              {p.isSpeaking && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            <span className={cn(
              "text-[11px] font-medium truncate flex-1 transition-colors",
              p.isSpeaking ? "text-primary" : "text-foreground"
            )}>{p.name}</span>
            <div className="flex items-center gap-1">
              {p.isScreenSharing && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary shrink-0">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              )}
              {p.isMuted && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-destructive shrink-0">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .28-.02.56-.06.83" />
                </svg>
              )}
            </div>
          </div>
        ))}
        {allParticipants.length === 0 && connectionState === ConnectionState.Connecting && (
          <div className="py-3 text-center">
            <p className="text-[11px] text-muted-foreground">Подключение...</p>
          </div>
        )}
      </div>

      {/* Screen share preview */}
      {isScreenSharing && (
        <div className="border-t border-border/30 px-3 py-2.5 animate-fade-in">
          <video
            ref={screenVideoRef}
            autoPlay
            muted
            className="w-full rounded-lg border border-primary/20 bg-black"
            style={{ maxHeight: '120px', objectFit: 'contain' }}
          />
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span className="text-[10px] text-primary font-medium">Демонстрация экрана</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      )}

      {/* Device selection */}
      {showDeviceMenu && (
        <div className="border-t border-border/30 px-3 py-2.5 animate-fade-in space-y-2">
          <div>
            <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Микрофон</label>
            <select
              value={selectedInput}
              onChange={(e) => handleSwitchInput(e.target.value)}
              className="w-full mt-1 text-[11px] bg-secondary/60 border border-border/30 rounded-lg px-2 py-1.5 text-foreground outline-none focus:border-primary/50"
            >
              {audioInputs.map(d => (
                <option key={d.deviceId} value={d.deviceId}>{d.label || `Микрофон ${d.deviceId.slice(0, 8)}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Динамик</label>
            <select
              value={selectedOutput}
              onChange={(e) => handleSwitchOutput(e.target.value)}
              className="w-full mt-1 text-[11px] bg-secondary/60 border border-border/30 rounded-lg px-2 py-1.5 text-foreground outline-none focus:border-primary/50"
            >
              {audioOutputs.map(d => (
                <option key={d.deviceId} value={d.deviceId}>{d.label || `Динамик ${d.deviceId.slice(0, 8)}`}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="px-3 py-3 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleScreenShare}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-medium transition-colors",
              isScreenSharing ? "bg-primary/15 text-primary neon-border" : "bg-secondary hover:bg-secondary/80 text-foreground"
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Экран
          </button>
          <button
            onClick={toggleMute}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-medium transition-colors",
              isMuted ? "bg-destructive/15 text-destructive" : "bg-secondary hover:bg-secondary/80 text-foreground"
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {isMuted ? (
                <>
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .28-.02.56-.06.83" />
                </>
              ) : (
                <>
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                </>
              )}
            </svg>
            Микро
          </button>
          <button
            onClick={toggleCamera}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-medium transition-colors",
              isCameraOn ? "bg-primary/15 text-primary neon-border" : "bg-secondary hover:bg-secondary/80 text-foreground"
            )}
          >
            <GameIcon name="video" size={14} />
            Камера
          </button>
          <button
            onClick={() => setShowDeviceMenu(!showDeviceMenu)}
            className={cn(
              "py-2.5 px-2.5 rounded-xl transition-colors",
              showDeviceMenu ? "bg-primary/15 text-primary" : "bg-secondary hover:bg-secondary/80 text-foreground"
            )}
            title="Настройки устройств"
          >
            <GameIcon name="settings" size={14} />
          </button>
          <button
            onClick={handleDisconnect}
            className="py-2.5 px-3 rounded-xl bg-destructive/15 hover:bg-destructive/30 text-destructive transition-colors"
          >
            <GameIcon name="phone" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceChannelPanel;
