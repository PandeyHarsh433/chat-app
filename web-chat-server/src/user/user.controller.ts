import { Controller, Get, Put, Query, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../guards/jwt-auth-guard';
import { User } from '../schemas/user.schema';
import { GetUser } from '../decorators/user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('profile')
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateData: Partial<User>,
  ) {
    return this.userService.updateProfile(userId, updateData);
  }

  @Get('search')
  async searchUsers(
    @Query('query') query: string = '',
    @Query('limit') limit: number = 10,
  ) {
    return this.userService.searchUsers(query, limit);
  }
}
