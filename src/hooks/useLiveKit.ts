import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  LocalTrackPublication,
  RemoteTrackPublication,
  RemoteParticipant,
  LocalParticipant,
  ConnectionState,
} from 'livekit-client';
import { supabase } from '@/integrations/supabase/client';

export interface Participant {
  identity: string;
  name: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  videoTrack?: MediaStreamTrack;
  screenTrack?: MediaStreamTrack;
  audioTrack?: MediaStreamTrack;
}

export interface UseLiveKitReturn {
  room: Room | null;
  connectionState: ConnectionState;
  participants: Participant[];
  localParticipant: Participant | null;
  connect: (roomName: string) => Promise<void>;
  disconnect: () => void;
  toggleMute: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  error: string | null;
}

const LIVEKIT_URL = localStorage.getItem('livekit_url') || 'wss://lk.kurilka.online';

export function useLiveKit(): UseLiveKitReturn {
  const roomRef = useRef<Room | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<Participant | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateParticipants = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;

    const mapParticipant = (p: LocalParticipant | RemoteParticipant): Participant => {
      let videoTrack: MediaStreamTrack | undefined;
      let screenTrack: MediaStreamTrack | undefined;
      let audioTrack: MediaStreamTrack | undefined;
      let isCam = false;
      let isScreen = false;
      let muted = true;

      p.trackPublications.forEach((pub: LocalTrackPublication | RemoteTrackPublication) => {
        if (pub.track) {
          if (pub.source === Track.Source.Camera) {
            videoTrack = pub.track.mediaStreamTrack;
            isCam = !pub.isMuted;
          } else if (pub.source === Track.Source.ScreenShare) {
            screenTrack = pub.track.mediaStreamTrack;
            isScreen = !pub.isMuted;
          } else if (pub.source === Track.Source.Microphone) {
            audioTrack = pub.track.mediaStreamTrack;
            muted = pub.isMuted;
          }
        }
      });

      return {
        identity: p.identity,
        name: p.name || p.identity,
        isSpeaking: p.isSpeaking,
        isMuted: muted,
        isCameraOn: isCam,
        isScreenSharing: isScreen,
        videoTrack,
        screenTrack,
        audioTrack,
      };
    };

    const local = mapParticipant(room.localParticipant);
    setLocalParticipant(local);
    setIsMuted(local.isMuted);
    setIsCameraOn(local.isCameraOn);
    setIsScreenSharing(local.isScreenSharing);

    const remotes: Participant[] = [];
    room.remoteParticipants.forEach((p) => {
      remotes.push(mapParticipant(p));
    });
    setParticipants(remotes);
  }, []);

  const connect = useCallback(async (roomName: string) => {
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await supabase.functions.invoke('livekit-token', {
        body: { roomName },
      });

      if (res.error) throw new Error(res.error.message);
      const { token } = res.data;

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      roomRef.current = room;

      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        setConnectionState(state);
      });

      room.on(RoomEvent.TrackSubscribed, updateParticipants);
      room.on(RoomEvent.TrackUnsubscribed, updateParticipants);
      room.on(RoomEvent.TrackMuted, updateParticipants);
      room.on(RoomEvent.TrackUnmuted, updateParticipants);
      room.on(RoomEvent.ParticipantConnected, updateParticipants);
      room.on(RoomEvent.ParticipantDisconnected, updateParticipants);
      room.on(RoomEvent.ActiveSpeakersChanged, updateParticipants);
      room.on(RoomEvent.LocalTrackPublished, updateParticipants);
      room.on(RoomEvent.LocalTrackUnpublished, updateParticipants);

      await room.connect(LIVEKIT_URL, token);
      await room.localParticipant.setMicrophoneEnabled(true);

      updateParticipants();
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
      console.error('LiveKit connect error:', err);
    }
  }, [updateParticipants]);

  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
      setConnectionState(ConnectionState.Disconnected);
      setParticipants([]);
      setLocalParticipant(null);
    }
  }, []);

  const toggleMute = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const enabled = room.localParticipant.isMicrophoneEnabled;
    await room.localParticipant.setMicrophoneEnabled(!enabled);
    updateParticipants();
  }, [updateParticipants]);

  const toggleCamera = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const enabled = room.localParticipant.isCameraEnabled;
    await room.localParticipant.setCameraEnabled(!enabled);
    updateParticipants();
  }, [updateParticipants]);

  const toggleScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const enabled = room.localParticipant.isScreenShareEnabled;
    await room.localParticipant.setScreenShareEnabled(!enabled);
    updateParticipants();
  }, [updateParticipants]);

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
    };
  }, []);

  return {
    room: roomRef.current,
    connectionState,
    participants,
    localParticipant,
    connect,
    disconnect,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    isMuted,
    isCameraOn,
    isScreenSharing,
    error,
  };
}
