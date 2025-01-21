import { Document, Types } from 'mongoose';
import { UserRole } from './enums';

export interface PopulatedUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface PopulatedMessage extends Document {
  _id: Types.ObjectId;
  content: string;
  chatId: Types.ObjectId;
  senderId: PopulatedUser;
  createdAt: Date;
  updatedAt: Date;
}
