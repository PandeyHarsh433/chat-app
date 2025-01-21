import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
  ParseIntPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../guards/jwt-auth-guard';
import { GetUser } from '../decorators/user.decorator';
import { CreateChatDto } from '../dto/chat.dto';
import { CreateMessageDto } from '../dto/message.dto';
import { ParseDatePipe } from '../pipes/parse-data.pipes';
import { ChatType } from '../types/enums';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  createChat(
    @Body() createChatDto: CreateChatDto,
    @GetUser('id') userId: string,
  ) {
    return this.chatService.createChat(createChatDto, userId);
  }

  @Get(':chatType')
  getUserDirectChats(
    @GetUser('id') userId: string,
    @Param('chatType') chatType: ChatType,
  ) {
    return this.chatService.getUserChats(userId, chatType);
  }

  @Get()
  getUserChats(@GetUser('id') userId: string) {
    return this.chatService.getUserChats(userId);
  }

  @Get(':chatId')
  getChatById(@Param('chatId') chatId: string) {
    return this.chatService.getChatById(chatId);
  }

  @Get(':chatId/messages')
  getChatMessages(@Param('chatId') chatId: string) {
    return this.chatService.getChatMessages(chatId);
  }

  @Get('/messages/:messageId')
  getMessageDetail(@Param('messageId') messageId: string) {
    return this.chatService.getMessageById(messageId);
  }

  @Post(':chatId/messages')
  createMessage(
    @Param('chatId') chatId: string,
    @Body() createMessageDto: CreateMessageDto,
    @GetUser('id') userId: string,
  ) {
    return this.chatService.createMessage({
      ...createMessageDto,
      chatId,
      senderId: userId,
    });
  }

  @Get(':chatId/participants')
  getChatParticipants(@Param('chatId') chatId: string) {
    return this.chatService.getChatParticipants(chatId);
  }

  @Post(':chatId/participants')
  addParticipants(
    @Param('chatId') chatId: string,
    @Body('userIds', new ParseArrayPipe({ items: String })) userIds: string[],
    @GetUser('id') userId: string,
  ) {
    return this.chatService.addParticipants(chatId, userIds, userId);
  }

  @Delete(':chatId/participants/:userId')
  removeParticipant(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ) {
    return this.chatService.removeParticipant(chatId, userId);
  }
}
