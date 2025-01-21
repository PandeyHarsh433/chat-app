import type { User, Chat } from '../types';
import { generateId } from '../lib/utils';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    isOnline: true,
    lastSeen: new Date(),
    password: '',
    role: UserRole.ADMIN,
    createdAt: undefined,
    updatedAt: undefined
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 15),
    password: '',
    role: UserRole.ADMIN,
    createdAt: undefined,
    updatedAt: undefined
  },
];

export const mockChats: Chat[] = [
  {
    id: generateId(),
    type: 'direct',
    name: 'Jane Smith',
    participants: ['1', '2'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: generateId(),
    type: 'group',
    name: 'Project Team',
    participants: ['1', '2', '3'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];