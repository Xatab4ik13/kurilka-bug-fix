import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-vps';
import { useAuth } from './useAuth';

export interface DbServer {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  owner_id: string;
  created_at: string;
}

export interface DbChannel {
  id: string;
  server_id: string;
  name: string;
  type: 'text' | 'voice';
  position: number;
}

export interface DbMessage {
  id: string;
  channel_id: string;
  author_id: string;
  content: string;
  reply_to_id: string | null;
  pinned: boolean;
  created_at: string;
  author?: { username: string; display_name: string | null; status: string; avatar_url: string | null };
}

export interface DbMember {
  user_id: string;
  role: string;
  profile?: { username: string; display_name: string | null; status: string; avatar_url: string | null; bio: string | null };
}

export const useServers = () => {
  const { user } = useAuth();
  const [servers, setServers] = useState<DbServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServers = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('servers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setServers([]);
      setLoading(false);
      return;
    }

    setServers((data || []) as DbServer[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchServers(); }, [fetchServers]);

  const createServer = async (name: string, icon: string, gradient: string, channelNames: string[]) => {
    if (!user) throw new Error('Нет активной сессии');

    const { data: server, error: serverError } = await supabase
      .from('servers')
      .insert({ name, icon, gradient, owner_id: user.id })
      .select()
      .single();

    if (serverError || !server) {
      throw new Error(serverError?.message || 'Не удалось создать сервер');
    }

    const { error: memberError } = await supabase.from('server_members').insert({
      server_id: server.id,
      user_id: user.id,
      role: 'owner',
    });

    if (memberError) {
      throw new Error(memberError.message || 'Не удалось добавить владельца сервера');
    }

    const channels = [
      ...channelNames.map((ch, i) => ({
        server_id: server.id,
        name: ch,
        type: 'text' as const,
        position: i,
      })),
      { server_id: server.id, name: 'Лобби', type: 'voice' as const, position: channelNames.length },
    ];

    const { error: channelsError } = await supabase.from('channels').insert(channels);

    if (channelsError) {
      throw new Error(channelsError.message || 'Не удалось создать каналы');
    }

    await fetchServers();
    return server as DbServer;
  };

  const updateServer = async (id: string, updates: Partial<DbServer>) => {
    const { error } = await supabase.from('servers').update(updates).eq('id', id);
    if (error) throw new Error(error.message);
    await fetchServers();
  };

  return { servers, loading, error, createServer, updateServer, refetch: fetchServers };
};

export const useChannels = (serverId: string | null) => {
  const [channels, setChannels] = useState<DbChannel[]>([]);

  useEffect(() => {
    if (!serverId) { setChannels([]); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', serverId)
        .order('position');
      if (data) setChannels(data as DbChannel[]);
    };
    fetch();
  }, [serverId]);

  const addChannel = async (name: string, type: 'text' | 'voice') => {
    if (!serverId) return;
    await supabase.from('channels').insert({
      server_id: serverId,
      name,
      type,
      position: channels.length,
    });
    const { data } = await supabase
      .from('channels')
      .select('*')
      .eq('server_id', serverId)
      .order('position');
    if (data) setChannels(data as DbChannel[]);
  };

  const deleteChannel = async (channelId: string) => {
    await supabase.from('channels').delete().eq('id', channelId);
    setChannels(prev => prev.filter(c => c.id !== channelId));
  };

  return { channels, addChannel, deleteChannel };
};

export const useMessages = (channelId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!channelId) { setMessages([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (data) {
      const authorIds = [...new Set(data.map(m => m.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, status, avatar_url')
        .in('user_id', authorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const enriched = data.map(m => ({
        ...m,
        type: m.pinned ? 'pinned' : undefined,
        author: profileMap.get(m.author_id) || { username: 'Unknown', display_name: null, status: 'offline', avatar_url: null },
      }));
      setMessages(enriched as DbMessage[]);
    }
    setLoading(false);
  }, [channelId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => {
    if (!channelId) return;
    const sub = supabase
      .channel(`messages:${channelId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          const msg = payload.new as any;
          if (msg.author_id === user?.id) return;
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, username, display_name, status, avatar_url')
            .eq('user_id', msg.author_id)
            .single();
          setMessages(prev => [...prev, { ...msg, author: profile || { username: 'Unknown', display_name: null, status: 'offline', avatar_url: null } }]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [channelId, user?.id]);

  const sendMessage = async (content: string, replyToId?: string) => {
    if (!channelId || !user) return;
    const msg = {
      channel_id: channelId,
      author_id: user.id,
      content,
      reply_to_id: replyToId || null,
    };
    const tempId = `temp_${Date.now()}`;
    const optimistic: DbMessage = {
      id: tempId,
      ...msg,
      pinned: false,
      created_at: new Date().toISOString(),
      author: { username: 'Ты', display_name: null, status: 'online', avatar_url: null },
    };
    setMessages(prev => [...prev, optimistic]);

    const { data } = await supabase.from('messages').insert(msg).select().single();
    if (data) {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...optimistic, id: data.id } : m));
    }
  };

  const deleteMessage = async (msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    await supabase.from('messages').delete().eq('id', msgId);
  };

  return { messages, loading, sendMessage, deleteMessage, refetch: fetchMessages };
};

export const useServerMembers = (serverId: string | null) => {
  const [members, setMembers] = useState<DbMember[]>([]);

  useEffect(() => {
    if (!serverId) { setMembers([]); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from('server_members')
        .select('user_id, role')
        .eq('server_id', serverId);
      if (data && data.length > 0) {
        const userIds = data.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, status, avatar_url, bio')
          .in('user_id', userIds);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        setMembers(data.map(m => ({
          ...m,
          profile: profileMap.get(m.user_id) || undefined,
        })) as DbMember[]);
      }
    };
    fetch();
  }, [serverId]);

  return { members };
};

export const useDirectMessages = (otherUserId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DbMessage[]>([]);

  useEffect(() => {
    if (!otherUserId || !user) { setMessages([]); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
        .limit(100);

      if (data) {
        const authorIds = [...new Set(data.map(m => m.sender_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, status, avatar_url')
          .in('user_id', authorIds);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        setMessages(data.map(m => ({
          id: m.id,
          channel_id: '',
          author_id: m.sender_id,
          content: m.content,
          reply_to_id: m.reply_to_id,
          pinned: false,
          created_at: m.created_at,
          author: profileMap.get(m.sender_id) || { username: 'Unknown', display_name: null, status: 'offline', avatar_url: null },
        })) as DbMessage[]);
      }
    };
    fetch();
  }, [otherUserId, user]);

  useEffect(() => {
    if (!otherUserId || !user) return;
    const sub = supabase
      .channel(`dm:${user.id}:${otherUserId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        async (payload) => {
          const msg = payload.new as any;
          const isRelevant = (msg.sender_id === user.id && msg.receiver_id === otherUserId) ||
                            (msg.sender_id === otherUserId && msg.receiver_id === user.id);
          if (!isRelevant || msg.sender_id === user.id) return;
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, username, display_name, status, avatar_url')
            .eq('user_id', msg.sender_id)
            .single();
          setMessages(prev => [...prev, {
            id: msg.id, channel_id: '', author_id: msg.sender_id, content: msg.content,
            reply_to_id: msg.reply_to_id, pinned: false, created_at: msg.created_at,
            author: profile || { username: 'Unknown', display_name: null, status: 'offline', avatar_url: null },
          }]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [otherUserId, user]);

  const sendDm = async (content: string, replyToId?: string) => {
    if (!otherUserId || !user) return;
    const tempId = `temp_${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId, channel_id: '', author_id: user.id, content,
      reply_to_id: replyToId || null, pinned: false, created_at: new Date().toISOString(),
      author: { username: 'Ты', display_name: null, status: 'online', avatar_url: null },
    }]);
    const { data } = await supabase.from('direct_messages').insert({
      sender_id: user.id, receiver_id: otherUserId, content, reply_to_id: replyToId || null,
    }).select().single();
    if (data) setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: data.id } : m));
  };

  return { messages, sendDm };
};

export const useAllProfiles = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Array<{
    user_id: string; username: string; display_name: string | null;
    status: string; avatar_url: string | null; bio: string | null;
  }>>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, status, avatar_url, bio')
        .neq('user_id', user.id);
      if (data) setProfiles(data);
    };
    fetch();

    const sub = supabase
      .channel('profiles_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          const updated = payload.new as any;
          if (updated.user_id === user.id) return;
          setProfiles(prev => prev.map(p => p.user_id === updated.user_id ? { ...p, ...updated } : p));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [user]);

  return { profiles };
};
