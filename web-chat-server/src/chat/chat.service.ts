import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateChatDto } from '../dto/chat.dto';
import { ChatParticipant } from '../schemas/chat-participant.schema';
import { Message } from '../schemas/message.schema';
import { Chat } from '../schemas/chat.schema';
import { User } from '../schemas/user.schema';
import { CreateMessageDto } from '../dto/message.dto';
import { ChatType } from '../types/enums';
import { ChatDocument, MessageResponse } from '../types/interfaces';
import {
  PopulatedMessage,
  PopulatedUser,
} from '../types/populate-message.interface';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(ChatParticipant.name)
    private participantModel: Model<ChatParticipant>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async markMessagesAsRead(
    messageIds: string[],
    userId: string,
  ): Promise<void> {
    const objectIds = messageIds.map((id) => new Types.ObjectId(id));
    const session = await this.messageModel.startSession();

    try {
      session.startTransaction();

      await this.messageModel.updateMany(
        {
          _id: { $in: objectIds },
          'readBy.userId': { $ne: new Types.ObjectId(userId) },
        },
        {
          $push: {
            readBy: {
              userId: new Types.ObjectId(userId),
              readAt: new Date(),
            },
          },
        },
        { session },
      );

      const messages = await this.messageModel
        .find({ _id: { $in: objectIds } })
        .distinct('chatId')
        .session(session);

      await Promise.all(
        messages.map((chatId) =>
          this.participantModel.findOneAndUpdate(
            { chatId, userId },
            { lastRead: new Date() },
            { session },
          ),
        ),
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async markMessageAsReadByUsers(
    messageId: string,
    userIds: string[],
  ): Promise<any> {
    const session = await this.messageModel.startSession();

    try {
      session.startTransaction();

      const messageObjectId = new Types.ObjectId(messageId);

      const readByEntries = userIds.map((userId) => ({
        userId: new Types.ObjectId(userId),
        readAt: new Date(),
      }));

      const updatedMessage = await this.messageModel.findOneAndUpdate(
        { _id: messageObjectId },
        {
          $push: {
            readBy: {
              $each: readByEntries,
              $filter: {
                input: '$readBy',
                cond: {
                  $not: {
                    $in: [
                      '$$this.userId',
                      userIds.map((id) => new Types.ObjectId(id)),
                    ],
                  },
                },
              },
            },
          },
        },
        {
          session,
          new: true,
        },
      );

      const chatId = updatedMessage.chatId;
      await Promise.all(
        userIds.map((userId) =>
          this.participantModel.findOneAndUpdate(
            { chatId, userId: new Types.ObjectId(userId) },
            { lastRead: new Date() },
            { session },
          ),
        ),
      );

      await session.commitTransaction();
      return updatedMessage;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async addParticipants(chatId: string, userIds: string[], addedBy: string) {
    const session = await this.participantModel.startSession();
    session.startTransaction();

    try {
      const existingParticipants = await this.participantModel
        .find({
          chatId,
          userId: { $in: userIds },
        })
        .session(session);

      const existingUserIds = new Set(
        existingParticipants.map((p) => p.userId.toString()),
      );
      const newUserIds = userIds.filter((id) => !existingUserIds.has(id));

      if (newUserIds.length > 0) {
        await this.participantModel.create(
          newUserIds.map((userId) => ({
            userId: new Types.ObjectId(userId),
            chatId: new Types.ObjectId(chatId),
            role: 'member',
            addedBy: new Types.ObjectId(addedBy),
            joinedAt: new Date(),
          })),
          { session },
        );
      }

      await session.commitTransaction();
      return this.getChatParticipants(chatId);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async getChatMessages(chatId: string): Promise<MessageResponse[]> {
    if (!Types.ObjectId.isValid(chatId)) {
      throw new BadRequestException('Invalid chatId format');
    }

    const messages = await this.messageModel
      .find({ chatId })
      .sort({ createdAt: 1 })
      .populate<{
        senderId: PopulatedUser;
        strictPopulate: false;
      }>({ path: 'senderId', select: '-password', strictPopulate: false })
      .lean<PopulatedMessage[]>();

    return messages.map((message: PopulatedMessage) => ({
      id: message?._id.toString(),
      content: message.content,
      chatId: message.chatId.toString(),
      sender: {
        id: message.senderId._id.toString(),
        email: message.senderId.email,
        name: message.senderId.name,
        role: message.senderId.role,
        avatar: message.senderId.avatar,
        isOnline: message.senderId.isOnline,
        lastSeen: message.senderId.lastSeen,
      },
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }));
  }

  async getMessageById(messageId: string): Promise<MessageResponse> {
    if (!Types.ObjectId.isValid(messageId)) {
      throw new BadRequestException('Invalid messageId format');
    }

    const message = await this.messageModel
      .findById(messageId)
      .populate<{
        senderId: PopulatedUser;
        strictPopulate: false;
      }>({ path: 'senderId', select: '-password', strictPopulate: false })
      .lean<PopulatedMessage>();

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return {
      id: message._id.toString(),
      content: message.content,
      chatId: message.chatId.toString(),
      sender: {
        id: message.senderId._id.toString(),
        email: message.senderId.email,
        name: message.senderId.name,
        role: message.senderId.role,
        avatar: message.senderId.avatar,
        isOnline: message.senderId.isOnline,
        lastSeen: message.senderId.lastSeen,
      },
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  async createChat(
    createChatDto: CreateChatDto,
    creatorId: string,
  ): Promise<Chat> {
    const session = await this.chatModel.startSession();
    session.startTransaction();

    try {
      const [chat] = await this.chatModel.create(
        [
          {
            type: createChatDto.type,
            name: createChatDto.name,
            creatorId:
              createChatDto.type === ChatType.GROUP ? creatorId : undefined,
          },
        ],
        { session },
      );

      if (!chat) {
        throw new Error('Chat creation failed');
      }

      const participantIds = new Set<string>(createChatDto.participants || []);
      if (createChatDto.type === ChatType.GROUP) {
        participantIds.add(creatorId);
      } else if (createChatDto.type === ChatType.DIRECT) {
        participantIds.add(creatorId);
      }

      const participants = Array.from(participantIds).map((userId) => {
        const participant: any = {
          userId,
          chatId: chat._id,
        };

        if (createChatDto.type === ChatType.GROUP) {
          participant.role = userId === creatorId ? 'admin' : 'member';
        }

        return participant;
      });

      const createdParticipants = await this.participantModel.create(
        participants,
        { session },
      );
      chat.participants = createdParticipants.map((p) => p._id.toString());
      await chat.save({ session });

      await session.commitTransaction();

      return await this.getChatById(chat._id as string);
    } catch (error) {
      await session.abortTransaction();
      console.error('Transaction aborted due to error:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async getUserChats(
    userId: string,
    chatType?: ChatType,
  ): Promise<ChatDocument[]> {
    const participantChats = await this.participantModel
      .find({ userId })
      .populate<{ chatId: ChatDocument }>({
        path: 'chatId',
        match: chatType ? { type: chatType } : {},
        options: {
          sort: { createdAt: 1 },
        },
      })
      .exec();

    const chats = participantChats
      .map((p) => p.chatId as ChatDocument)
      .filter(
        (chat): chat is ChatDocument => chat !== null && chat !== undefined,
      );

    if (chats.length === 0) {
      const chatTypeLabel = chatType === ChatType.DIRECT ? 'direct' : 'group';
      throw new NotFoundException(
        `No ${chatTypeLabel} chats found for this user`,
      );
    }

    return chats;
  }

  async getChatById(chatId: string): Promise<Chat> {
    const chat = await this.chatModel
      .findById(chatId)
      .populate({
        path: 'participants',
        populate: { path: 'user', select: '-password', strictPopulate: false },
        options: {
          sort: { createdAt: 1 },
        },
      })
      .exec();

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async createMessage(messageData: CreateMessageDto & { senderId: string }) {
    const session = await this.messageModel.startSession();
    session.startTransaction();

    try {
      const now = new Date();
      const message = await this.messageModel.create(
        [
          {
            ...messageData,
            createdAt: now,
            updatedAt: now,
          },
        ],
        {
          session,
        },
      );

      await this.chatModel.findByIdAndUpdate(
        messageData.chatId,
        {
          lastMessage: message[0]._id,
          updatedAt: now,
        },
        {
          session,
          new: true,
        },
      );

      const messageId = message[0]._id as string;
      await this.updateLastMessageForUsers(
        messageData.chatId,
        messageId,
        now,
        session,
      );

      await session.commitTransaction();

      return this.messageModel
        .findById(message[0]._id)
        .populate({
          path: 'sender',
          select: '-password',
          strictPopulate: false,
        })
        .exec();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async updateUserLastSeen(userId: string) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          lastSeen: new Date(),
        },
        { new: true },
      )
      .select('-password');
  }

  async getChatParticipants(chatId: string) {
    const participants = await this.participantModel
      .find({ chatId })
      .populate({ path: 'user', select: '-password', strictPopulate: false })
      .exec();

    if (!participants.length) {
      throw new NotFoundException('Chat participants not found');
    }

    return participants;
  }

  async removeParticipant(chatId: string, userId: string) {
    await this.participantModel.findOneAndDelete({ chatId, userId }).exec();
    return this.getChatParticipants(chatId);
  }

  private async updateLastMessageForUsers(
    chatId: string,
    messageId: string,
    createdAt: Date,
    session: any,
  ): Promise<void> {
    await this.chatModel.findByIdAndUpdate(
      chatId,
      {
        $set: {
          lastMessage: {
            messageId: messageId,
            timestamp: createdAt,
          },
        },
      },
      { session },
    );
  }
}
