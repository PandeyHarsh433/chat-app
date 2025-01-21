import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat/chat.service';
import { CreateMessageDto } from '../dto/message.dto';
import { AuthenticatedSocket } from '../types/ws.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface TypingStatus {
  userId: string;
  chatId: string;
  timestamp: number;
}

interface ChatState {
  onlineUsers: Set<string>;
  typingUsers: Map<string, TypingStatus>;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket'],
  namespace: '/',
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private chatStates: Map<string, ChatState> = new Map();
  private userChats: Map<string, Set<string>> = new Map();
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private getTypingKey(userId: string, chatId: string): string {
    return `${userId}_${chatId}`;
  }

  private initializeChatState(chatId: string) {
    if (!this.chatStates.has(chatId)) {
      this.chatStates.set(chatId, {
        onlineUsers: new Set(),
        typingUsers: new Map(),
      });
    }
  }

  private getChatState(chatId: string): ChatState {
    this.initializeChatState(chatId);
    return this.chatStates.get(chatId)!;
  }

  private extractToken(client: Socket): string | undefined {
    const auth =
      client.handshake.auth.token || client.handshake.headers.authorization;
    return auth?.split(' ')[1];
  }

  private async syncChatState(chatId: string) {
    const chatState = this.getChatState(chatId);
    this.server.to(`chat_${chatId}`).emit('chatStateSync', {
      chatId,
      chatState: {
        onlineUsers: Array.from(chatState.onlineUsers),
        typingUsers: Array.from(chatState.typingUsers.values()),
      },
    });
  }

  private cleanupTypingTimeout(typingKey: string) {
    const timeout = this.typingTimeouts.get(typingKey);
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeouts.delete(typingKey);
    }
  }

  private async updateTypingStatus(
    userId: string,
    chatId: string,
    isTyping: boolean,
  ) {
    const chatState = this.getChatState(chatId);
    const typingKey = this.getTypingKey(userId, chatId);

    this.cleanupTypingTimeout(typingKey);

    if (isTyping) {
      const typingStatus = {
        userId,
        chatId,
        timestamp: Date.now(),
      };

      chatState.typingUsers.set(typingKey, typingStatus);

      this.server.to(`chat_${chatId}`).emit('userTyping', {
        ...typingStatus,
        isTyping: true,
      });

      const timeout = setTimeout(async () => {
        chatState.typingUsers.delete(typingKey);

        this.server.to(`chat_${chatId}`).emit('userTyping', {
          userId,
          chatId,
          timestamp: Date.now(),
          isTyping: false,
        });

        await this.syncChatState(chatId);
        this.typingTimeouts.delete(typingKey);
      }, 5000);

      this.typingTimeouts.set(typingKey, timeout);
    } else {
      chatState.typingUsers.delete(typingKey);

      this.server.to(`chat_${chatId}`).emit('userTyping', {
        userId,
        chatId,
        timestamp: Date.now(),
        isTyping: false,
      });
    }

    await this.syncChatState(chatId);
  }

  private async cleanupUserState(userId: string) {
    const userChats = this.userChats.get(userId) || new Set();

    for (const chatId of userChats) {
      const chatState = this.getChatState(chatId);
      chatState.onlineUsers.delete(userId);

      const typingKey = this.getTypingKey(userId, chatId);
      this.cleanupTypingTimeout(typingKey);
      chatState.typingUsers.delete(typingKey);

      this.server.to(`chat_${chatId}`).emit('userTyping', {
        userId,
        chatId,
        timestamp: Date.now(),
        isTyping: false,
      });

      await this.syncChatState(chatId);
    }

    this.userChats.delete(userId);
  }

  async handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        throw new WsException('Authentication token not found');
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      const user = await this.jwtService.verify(token, { secret });
      client.data.user = user;

      console.log('Connected with user:', user.id);

      client.join(`user_${user.id}`);

      const userChats = await this.chatService.getUserChats(user.id);
      this.userChats.set(user.id, new Set());

      for (const chat of userChats) {
        const chatId = chat.id;
        client.join(`chat_${chatId}`);

        const chatState = this.getChatState(chatId);
        chatState.onlineUsers.add(user.id);

        this.userChats.get(user.id)?.add(chatId);

        await this.syncChatState(chatId);
      }

      this.server.emit('userStatus', { userId: user.id, isOnline: true });
    } catch (error) {
      console.error('WS Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() client: AuthenticatedSocket) {
    const userId = client.data.user?.id;
    if (!userId) return;

    console.log('User disconnected:', userId);

    await this.chatService.updateUserLastSeen(userId);
    await this.cleanupUserState(userId);

    client.leave(`user_${userId}`);
    this.server.emit('userStatus', { userId, isOnline: false });
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatId: string,
  ) {
    const userId = client.data.user.id;

    try {
      const recentMessages = await this.chatService.getChatMessages(chatId);

      client.join(`chat_${chatId}`);

      const chatState = this.getChatState(chatId);
      chatState.onlineUsers.add(userId);

      if (!this.userChats.has(userId)) {
        this.userChats.set(userId, new Set());
      }
      this.userChats.get(userId)?.add(chatId);

      await this.syncChatState(chatId);

      client.emit('chatHistory', {
        chatId,
        messages: recentMessages,
      });

      client.broadcast
        .to(`chat_${chatId}`)
        .emit('userJoinedChat', { userId, chatId });

    } catch (error) {
      console.error('Error handling join chat:', error);
      client.emit('error', {
        error: 'Failed to join chat',
        details: error.message,
      });
    }
  }

  @SubscribeMessage('leaveChat')
  async handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatId: string,
  ) {
    const userId = client.data.user.id;

    await this.updateTypingStatus(userId, chatId, false);

    client.leave(`chat_${chatId}`);

    const chatState = this.getChatState(chatId);
    chatState.onlineUsers.delete(userId);

    this.userChats.get(userId)?.delete(chatId);

    client.broadcast
      .to(`chat_${chatId}`)
      .emit('userLeftChat', { userId, chatId });

    await this.syncChatState(chatId);
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    const userId = client.data.user.id;

    try {
      await this.updateTypingStatus(userId, data.chatId, data.isTyping);
    } catch (error) {
      console.error('Error handling typing event:', error);
      client.emit('error', {
        error: 'Failed to handle typing event',
        details: error.message,
      });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    const userId = client.data.user.id;

    try {
      await this.updateTypingStatus(userId, createMessageDto.chatId, false);

      const message = await this.chatService.createMessage({
        ...createMessageDto,
        senderId: userId,
      });

      this.server.to(`chat_${message.chatId}`).emit('newMessage', {
        success: true,
        message,
      });
    } catch (error) {
      console.error('Error in handleMessage:', error);
      client.emit('messageError', {
        error: 'Failed to send message',
        details: error.message,
      });
    }
  }

  @SubscribeMessage('markMessagesRead')
  async handleMarkMessagesRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; messageIds: string[] },
  ) {
    const userId = client.data.user.id;

    try {
      await this.chatService.markMessagesAsRead(data.messageIds, userId);

      client.broadcast.to(`chat_${data.chatId}`).emit('messagesRead', {
        userId,
        chatId: data.chatId,
        messageIds: data.messageIds,
        readAt: new Date(),
      });
    } catch (error) {
      client.emit('error', {
        error: 'Failed to mark messages as read',
        details: error.message,
      });
    }
  }
}
