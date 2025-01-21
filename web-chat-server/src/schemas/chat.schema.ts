import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop({ type: String, enum: ['DIRECT', 'GROUP'], required: true })
  type: string;

  @Prop()
  name?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  creatorId?: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'ChatParticipant' }],
  })
  participants: string[];

  @Prop({
    type: {
      messageId: {
        type: MongooseSchema.Types.ObjectId,
        ref: 'Message',
        default: null,
      },
      timestamp: {
        type: Date,
        default: null,
      },
    },
    _id: false,
  })
  lastMessage: {
    messageId: MongooseSchema.Types.ObjectId | null;
    timestamp: Date | null;
  };
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
