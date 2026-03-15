import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/interfaces/auth-user.interface';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getAllChats(@CurrentUser() user: AuthUser) {
    return this.chatService.GetAllChats(user.sub);
  }

  @Get(':id')
  async getChatById(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.chatService.GetChatById(id, user.sub);
  }

  @Get(':id/messages')
  async getMessages(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.chatService.getMessagesForChat(id, user.sub);
  }

  @Get(':id/unread')
  async getUnreadCount(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const count = await this.chatService.getUnreadCount(id, user.sub);
    return { count };
  }

  @Post(':id/clear')
  @HttpCode(HttpStatus.OK)
  async clearChat(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.chatService.clearChat(id, user.sub);
  }

  @Patch(':id/messages/:messageId')
  async editMessage(
    @Param('messageId') messageId: string,
    @Body('content') content: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.chatService.editMessage(messageId, user.sub, content);
  }

  @Delete(':id/messages/:messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.chatService.deleteMessage(messageId, user.sub);
  }
}