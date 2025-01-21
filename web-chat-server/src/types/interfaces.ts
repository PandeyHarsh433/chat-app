import { UserRole, ChatType } from './enums';

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface PaginationParams {
  limit?: number;
  before?: Date;
  after?: Date;
}

export interface ChatParticipantInfo {
  userId: string;
  chatId: string;
  joinedAt: Date;
}

export interface MessageResponse {
  id: string;
  content: string;
  chatId: string;
  sender: UserResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface ChatResponse {
  id: string;
  type: ChatType;
  name?: string;
  creatorId?: string;
  participants: UserResponse[];
  lastMessage?: MessageResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatDocument extends Document {
  type: ChatType;
  id: string;
  name: string;
  creatorId: string;
  participants: string[];
  lastMessage: {
    messageId: string;
    timestamp: Date;
  };
}
