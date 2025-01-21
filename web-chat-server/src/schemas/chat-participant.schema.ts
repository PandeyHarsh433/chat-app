import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class ChatParticipant extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true,
  })
  chatId: string;

  @Prop({ default: Date.now })
  joinedAt: Date;

  @Prop({ enum: ['admin', 'member'], default: 'member' })
  role: 'admin' | 'member';
}

export const ChatParticipantSchema =
  SchemaFactory.createForClass(ChatParticipant);
