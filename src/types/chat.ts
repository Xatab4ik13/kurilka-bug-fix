export interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'in-game' | 'afk';
  game?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface Message {
  id: string;
  content: string;
  author: User;
  timestamp: Date;
  replyTo?: Message;
  attachment?: {
    name: string;
    type: 'image' | 'file';
    url?: string;
  };
  pinned?: boolean;
}

export type MemberRole = 'owner' | 'admin' | 'member';

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
}

export interface Server {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  memberCount: number;
  onlineCount: number;
  channels: Channel[];
  members: User[];
  messages: Message[];
}

export interface DirectConversation {
  userId: string;
  messages: Message[];
}
