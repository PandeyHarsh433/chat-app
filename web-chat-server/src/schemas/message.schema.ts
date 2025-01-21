import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

interface ReadReceipt {
  userId: Types.ObjectId;
  readAt: Date;
}

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true, index: true })
  chatId: Types.ObjectId;

  @Prop([
    {
      userId: { type: Types.ObjectId, ref: 'User' },
      readAt: { type: Date },
    },
  ])
  readBy: ReadReceipt[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
