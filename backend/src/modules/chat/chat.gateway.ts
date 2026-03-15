import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import * as cookie from 'cookie';

interface AuthSocket extends Socket {
  userId?: string;
}

@WebSocketGateway(3001, {
  namespace: 'chat',
  path: '/chat/socket.io',  // add this
  cors: { origin: true, credentials: true },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();
  private onlineUsers = new Set<string>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) { }

  afterInit() {

  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  async handleConnection(client: AuthSocket) {
    try {
      const cookies = cookie.parse(client.handshake.headers.cookie || '');
      const token = cookies['access_token'] || client.handshake.auth?.token;

      if (!token) {
        client.emit('error', { message: 'Authentication token missing' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      client.userId = payload.sub;
      this.userSockets.set(payload.sub, client.id);
      this.onlineUsers.add(payload.sub);
      const chats = await this.chatService.GetAllChats(payload.sub);
      chats.forEach((c) => client.join(c.RoomName));

      client.emit('connected', {
        userId: payload.sub,
        message: 'Connected to chat server',
        joinedRooms: chats.map((c) => c.RoomName),
      });
    } catch {
      client.emit('error', { message: 'Invalid authentication token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    if (client.userId) {
      this.userSockets.delete(client.userId);
      this.onlineUsers.delete(client.userId);
    }
  }

  @SubscribeMessage('StartPrivateChat')
  async handleStartPrivateChat(
    @MessageBody()
    data: { sourceId: string; destinationId: string; type: 'private'; RoomName: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    if (!client.userId) return client.emit('error', { message: 'Not authenticated' });

    try {
      const sourceId = client.userId; 
      const { destinationId, RoomName } = data;

      if (!sourceId || !destinationId)
        return client.emit('error', { message: 'sourceId and destinationId are required' });

      if (sourceId === destinationId)
        return client.emit('error', { message: 'Cannot chat with yourself' });

      let chat = await this.chatService.RoomAlreadyExist(RoomName);

      if (!chat) {
        chat = await this.chatService.StartPrivateChat(sourceId, destinationId, RoomName);
      }
      client.join(chat.RoomName);

      const destSocketId = this.userSockets.get(destinationId);
      if (destSocketId) {
        this.server.in(destSocketId).socketsJoin(chat.RoomName);
      }

      const chatPayload = this.formatChatPayload(chat);


      client.emit('chat:created', chatPayload);

      if (destSocketId) {
        this.server.to(destSocketId).emit('new_chat_created', chatPayload);
      }
    } catch (err) {
      console.error('StartPrivateChat error:', err);
      client.emit('error', { message: 'Failed to start private chat' });
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @MessageBody() data: { RoomName: string; type: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    if (!client.userId) return client.emit('error', { message: 'Not authenticated' });

    try {
      const room = await this.chatService.RoomAlreadyExist(data.RoomName);

      if (!room) {
        return client.emit('error', { message: 'Chat room not found' });
      }

      const isParticipant = await this.chatService.isUserParticipant(room.id, client.userId);
      if (!isParticipant) {
        return client.emit('error', { message: 'You are not a participant in this chat' });
      }

      client.join(data.RoomName);
      client.emit('joinedChat', { RoomName: data.RoomName, chatId: room.id });
    } catch (err) {
      console.error('join_chat error:', err);
      client.emit('error', { message: 'Failed to join chat' });
    }
  }

  @SubscribeMessage('joinAllChats')
  async handleJoinAllChats(@ConnectedSocket() client: AuthSocket) {
    if (!client.userId) return client.emit('error', { message: 'Not authenticated' });

    try {
      const chats = await this.chatService.GetAllChats(client.userId);
      chats.forEach((c) => client.join(c.RoomName));
      client.emit('joined_all_chats', {
        message: 'Joined all chats',
        chats: chats.map((c) => ({ chatId: c.id, RoomName: c.RoomName, type: c.type })),
      });
    } catch {
      client.emit('error', { message: 'Failed to join all chats' });
    }
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @MessageBody() data: { chatId: string; content: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    if (!client.userId) return client.emit('error', { message: 'Not authenticated' });

    try {
      const { chatId, content } = data;

      if (!content?.trim())
        return client.emit('error', { message: 'Message content cannot be empty' });

      const isParticipant = await this.chatService.isUserParticipant(chatId, client.userId);
      if (!isParticipant)
        return client.emit('error', { message: 'You are not a participant of this chat' });

      const chat = await this.chatService.GetChatById(chatId, client.userId);
      const roomName = chat.RoomName;

      const messageCount = await this.chatService.getMessageCount(chatId);
      if (messageCount === 0) {
        const sender = chat.participants.find((p) => p.userId === client.userId);
        const senderName = sender?.user?.Username || `User_${client.userId.substring(0, 8)}`;

        const systemMsg = await this.chatService.SaveMessage(
          chatId,
          client.userId,
          `Chat started by ${senderName}`,
          true,
        );

        this.server.to(roomName).emit(`chat:${chatId}:system:message`, {
          id: systemMsg.id,
          type: 'chat_started',
          content: systemMsg.content,
          senderId: systemMsg.senderId,
          timestamp: systemMsg.createdAt,
          isSystem: true,
        });
      }

      const message = await this.chatService.SaveMessage(chatId, client.userId, content.trim());

      this.server.to(roomName).emit(`chat:${chatId}:message:new`, {
        id: message.id,
        chatId: message.chatId,
        content: message.content,
        senderId: message.senderId,
        sender: message.sender
          ? { id: message.sender.id, username: message.sender.Username }
          : null,
        reads: message.reads || [],
        createdAt: message.createdAt,
        isEdited: false,
        isDeleted: false,
      });

      this.server.to(roomName).emit('message:sent', {
        chatId,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('message:send error:', err);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('message:edit')
  async handleEditMessage(
    @MessageBody() data: { messageId: string; content: string; chatId: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    if (!client.userId) return client.emit('error', { message: 'Not authenticated' });

    try {
      const updated = await this.chatService.editMessage(
        data.messageId,
        client.userId,
        data.content,
      );
      const chat = await this.chatService.GetChatById(data.chatId, client.userId);

      this.server.to(chat.RoomName).emit(`chat:${data.chatId}:message:edited`, {
        messageId: updated.id,
        content: updated.content,
        isEdited: true,
        editedAt: updated.updatedAt,
      });
    } catch (err) {
      console.error('message:edit error:', err);
      client.emit('error', { message: 'Failed to edit message' });
    }
  }

  @SubscribeMessage('message:delete')
  async handleDeleteMessage(
    @MessageBody() data: { messageId: string; chatId: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    if (!client.userId) return client.emit('error', { message: 'Not authenticated' });

    try {
      await this.chatService.deleteMessage(data.messageId, client.userId);
      const chat = await this.chatService.GetChatById(data.chatId, client.userId);

      this.server.to(chat.RoomName).emit(`chat:${data.chatId}:message:deleted`, data.messageId);
    } catch (err) {
      console.error('message:delete error:', err);
      client.emit('error', { message: 'Failed to delete message' });
    }
  }
  @SubscribeMessage('message:mark_read')
  async handleMarkRead(
    @MessageBody() data: { messageId: string; chatId: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    if (!client.userId) return;
    try {
      await this.chatService.markMessageAsRead(data.messageId, client.userId);
      const chat = await this.chatService.GetChatById(data.chatId, client.userId);
      this.server.to(chat.RoomName).emit(`chat:${data.chatId}:message:read`, {
        messageId: data.messageId,
        userId: client.userId,
      });
    } catch { }
  }

  @SubscribeMessage('messages:mark_read')
  async handleMarkManyRead(
    @MessageBody() data: { chatId: string; messageIds: string[] },
    @ConnectedSocket() client: AuthSocket,
  ) {
    if (!client.userId) return;
    try {
      await this.chatService.markMessagesAsRead(data.messageIds, client.userId);
      const chat = await this.chatService.GetChatById(data.chatId, client.userId);
      this.server.to(chat.RoomName).emit(`chat:${data.chatId}:messages:read`, {
        messageIds: data.messageIds,
        userId: client.userId,
      });
    } catch { }
  }

  @SubscribeMessage('user:startTyping')
  async handleStartTyping(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    if (!client.userId) return;
    try {
      const chat = await this.chatService.GetChatById(data.chatId, client.userId);
      client.to(chat.RoomName).emit(`chat:${data.chatId}:user:typing`, {
        userId: client.userId,
      });
    } catch { }
  }

  @SubscribeMessage('user:stopTyping')
  async handleStopTyping(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    if (!client.userId) return;
    try {
      const chat = await this.chatService.GetChatById(data.chatId, client.userId);
      client.to(chat.RoomName).emit(`chat:${data.chatId}:user:stopTyping`, {
        userId: client.userId,
      });
    } catch { }
  }

  @SubscribeMessage('join_activity_chat')
  async handleJoinActivityChat(
    @MessageBody() data: { activityId: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    if (!client.userId) return client.emit('error', { message: 'Not authenticated' });

    try {
      const chat = await this.chatService.joinActivityChat(data.activityId, client.userId);
      client.join(chat.RoomName);

      this.server.to(chat.RoomName).emit('user_joined_activity_chat', {
        userId: client.userId,
        activityId: data.activityId,
        chatId: chat.id,
      });

      client.emit('activity_chat:joined', this.formatChatPayload(chat));
    } catch (err) {
      console.error('join_activity_chat error:', err);
      client.emit('error', { message: 'Failed to join activity chat' });
    }
  }

  @SubscribeMessage('leave_activity_chat')
  async handleLeaveActivityChat(
    @MessageBody() data: { activityId: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    if (!client.userId) return client.emit('error', { message: 'Not authenticated' });

    try {
      const chat = await this.chatService.getActivityChat(data.activityId);
      if (!chat) return client.emit('error', { message: 'Activity chat not found' });

      await this.chatService.leaveActivityChat(data.activityId, client.userId);
      client.leave(chat.RoomName);

      this.server.to(chat.RoomName).emit('user_left_activity_chat', {
        userId: client.userId,
        activityId: data.activityId,
        chatId: chat.id,
      });

      client.emit('activity_chat:left', { chatId: chat.id });
    } catch (err) {
      console.error('leave_activity_chat error:', err);
      client.emit('error', { message: 'Failed to leave activity chat' });
    }
  }

  @SubscribeMessage('DeleteActivityChat')
  async handleDeleteActivityChat(
    @MessageBody() data: { RoomName: string; activityId: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    if (!client.userId) return client.emit('error', { message: 'Not authenticated' });

    try {
      const chatToDelete = await this.chatService.getActivityChat(data.activityId);
      if (!chatToDelete) return client.emit('error', { message: 'Activity chat not found' });

      await this.chatService.deleteActivityChat(data.activityId);

      this.server.to(data.RoomName).emit('activity_chat_deleted', {
        activityId: data.activityId,
        chatId: chatToDelete.id,  // ← correct UUID
        message: 'This activity chat has been deleted',
      });

      this.server.socketsLeave(data.RoomName);
    } catch (err) {
      console.error('DeleteActivityChat error:', err);
      client.emit('error', { message: 'Failed to delete activity chat' });
    }
  }

  private formatChatPayload(chat: any) {
    return {
      id: chat.id,
      RoomName: chat.RoomName,
      type: chat.type,
      name: chat.name,
      avatar: chat.avatar,
      activityId: chat.activityId,
      participants: chat.participants || [],
      messages: chat.messages || [],
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  }
}