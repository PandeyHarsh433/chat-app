import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { ChatType } from '../types/enums';

export class CreateChatDto {
  @IsEnum(ChatType)
  type: ChatType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsArray()
  @IsString({ each: true })
  participants: string[];
}

export class JoinChatDto {
  @IsString()
  chatId: string;
}
