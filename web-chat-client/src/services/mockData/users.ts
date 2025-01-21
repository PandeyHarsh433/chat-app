import type { User } from '../../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://source.unsplash.com/100x100/?portrait&1',
    isOnline: true,
    lastSeen: new Date(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://source.unsplash.com/100x100/?portrait&2',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: '3',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://source.unsplash.com/100x100/?portrait&3',
    isOnline: true,
    lastSeen: new Date(),
  },
];