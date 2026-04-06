import { Server, User, DirectConversation } from '@/types/chat';

export const currentUser: User = {
  id: 'u1',
  name: 'Ты',
  status: 'online',
};

export const users: User[] = [
  currentUser,
  { id: 'u2', name: 'Алексей', status: 'online', game: 'World of Warcraft' },
  { id: 'u3', name: 'Мария', status: 'in-game', game: 'Valorant' },
  { id: 'u4', name: 'Дмитрий', status: 'offline' },
  { id: 'u5', name: 'Елена', status: 'online', game: 'Dota 2' },
  { id: 'u6', name: 'Иван', status: 'in-game', game: 'CS2' },
  { id: 'u7', name: 'Ольга', status: 'afk' },
];

export const servers: Server[] = [
  {
    id: 's1',
    name: 'Основной',
    icon: '🎮',
    gradient: 'from-violet-600 via-purple-500 to-fuchsia-500',
    memberCount: 7,
    onlineCount: 5,
    channels: [
      { id: 'c1', name: 'общий', type: 'text' },
      { id: 'c2', name: 'мемы', type: 'text' },
      { id: 'c3', name: 'Лобби', type: 'voice' },
    ],
    members: users,
    messages: [
      { id: 'm1', content: 'Кто сегодня играет?', author: users[1], timestamp: new Date(2026, 3, 6, 10, 0) },
      { id: 'm2', content: 'Я в деле, зову Марию', author: users[4], timestamp: new Date(2026, 3, 6, 10, 5) },
      { id: 'm3', content: 'Го ранкед в 9?', author: users[0], timestamp: new Date(2026, 3, 6, 10, 10) },
      { id: 'm4', content: 'Давайте! Только после ужина 🍕', author: users[1], timestamp: new Date(2026, 3, 6, 10, 15) },
      { id: 'm5', content: 'Я залью на серв через 30 мин', author: users[5], timestamp: new Date(2026, 3, 6, 10, 20) },
      { id: 'm6', content: 'Жду вас всех в лобби', author: users[2], timestamp: new Date(2026, 3, 6, 10, 30) },
    ],
  },
  {
    id: 's2',
    name: 'WoW Гильдия',
    icon: '⚔️',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    memberCount: 5,
    onlineCount: 3,
    channels: [
      { id: 'c4', name: 'рейды', type: 'text' },
      { id: 'c5', name: 'торговля', type: 'text' },
      { id: 'c6', name: 'Рейд-войс', type: 'voice' },
    ],
    members: [users[0], users[1], users[2], users[4], users[5]],
    messages: [
      { id: 'm7', content: 'Рейд в 21:00, все готовы?', author: users[1], timestamp: new Date(2026, 3, 6, 9, 0) },
      { id: 'm8', content: 'Нужен хил, кто может?', author: users[4], timestamp: new Date(2026, 3, 6, 9, 15) },
      { id: 'm9', content: 'Я зайду на присте', author: users[2], timestamp: new Date(2026, 3, 6, 9, 20) },
    ],
  },
  {
    id: 's3',
    name: 'Valorant 5 stack',
    icon: '🎯',
    gradient: 'from-red-500 via-rose-500 to-pink-500',
    memberCount: 5,
    onlineCount: 2,
    channels: [
      { id: 'c7', name: 'тактика', type: 'text' },
      { id: 'c8', name: 'Голосовой', type: 'voice' },
    ],
    members: [users[0], users[2], users[3], users[5], users[6]],
    messages: [
      { id: 'm10', content: 'Новый агент имба, надо пикать', author: users[2], timestamp: new Date(2026, 3, 5, 20, 0) },
      { id: 'm11', content: 'Завтра скримы?', author: users[5], timestamp: new Date(2026, 3, 5, 21, 0) },
    ],
  },
  {
    id: 's4',
    name: 'Кинотусовка',
    icon: '🎬',
    gradient: 'from-cyan-500 via-teal-500 to-emerald-500',
    memberCount: 4,
    onlineCount: 1,
    channels: [
      { id: 'c9', name: 'обсуждения', type: 'text' },
      { id: 'c10', name: 'Кино-вечер', type: 'voice' },
    ],
    members: [users[0], users[3], users[4], users[6]],
    messages: [
      { id: 'm12', content: 'Что смотрим в пятницу?', author: users[4], timestamp: new Date(2026, 3, 4, 19, 0) },
      { id: 'm13', content: 'Дюна 3 вышла!', author: users[3], timestamp: new Date(2026, 3, 4, 19, 30) },
    ],
  },
];

export const directConversations: DirectConversation[] = [
  {
    userId: 'u2',
    messages: [
      { id: 'dm1', content: 'Привет! Го в WoW сегодня?', author: users[1], timestamp: new Date(2026, 3, 6, 8, 0) },
      { id: 'dm2', content: 'Давай, в 9 буду онлайн', author: users[0], timestamp: new Date(2026, 3, 6, 8, 5) },
      { id: 'dm3', content: 'Класс! Я танком пойду', author: users[1], timestamp: new Date(2026, 3, 6, 8, 7) },
      { id: 'dm4', content: 'Ок, тогда я хилом зайду', author: users[0], timestamp: new Date(2026, 3, 6, 8, 10) },
    ],
  },
  {
    userId: 'u3',
    messages: [
      { id: 'dm5', content: 'Мария, завтра скримы?', author: users[0], timestamp: new Date(2026, 3, 5, 18, 0) },
      { id: 'dm6', content: 'Да, собираю стак. Ты в деле?', author: users[2], timestamp: new Date(2026, 3, 5, 18, 15) },
      { id: 'dm7', content: 'Конечно! На каком агенте играешь?', author: users[0], timestamp: new Date(2026, 3, 5, 18, 20) },
    ],
  },
  {
    userId: 'u5',
    messages: [
      { id: 'dm8', content: 'Елена, кинь ссылку на билд', author: users[0], timestamp: new Date(2026, 3, 6, 7, 0) },
      { id: 'dm9', content: 'Вот, смотри — maxroll.gg/d4/build/...', author: users[4], timestamp: new Date(2026, 3, 6, 7, 10) },
    ],
  },
  {
    userId: 'u6',
    messages: [
      { id: 'dm10', content: 'Иван, ты на фейсите играешь?', author: users[0], timestamp: new Date(2026, 3, 5, 15, 0) },
      { id: 'dm11', content: 'Да, 10 лвл. Го вместе вечером', author: users[5], timestamp: new Date(2026, 3, 5, 15, 30) },
      { id: 'dm12', content: 'Лееееетс гоо 🔥', author: users[0], timestamp: new Date(2026, 3, 5, 15, 35) },
    ],
  },
];
