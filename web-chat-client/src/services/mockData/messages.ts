import { generateId } from '../../lib/utils';
import type { Message } from '../../types';

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: generateId(),
      content: 'Hey, how are you?',
      senderId: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      chatId: '1',
      status: 'sent'
    },
    {
      id: generateId(),
      content: "I'm good, thanks! How about you?",
      senderId: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      chatId: '1',
      status: 'sent'
    },
  ],
  '2': [
    {
      id: generateId(),
      content: 'Team meeting tomorrow at 10 AM',
      senderId: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      chatId: '2',
      status: 'sent'
    },
    {
      id: generateId(),
      content: 'Meeting at 3 PM',
      senderId: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      chatId: '2',
      status: 'sent'
    },
  ],
};