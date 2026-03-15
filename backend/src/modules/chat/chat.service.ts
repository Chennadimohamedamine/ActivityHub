import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatParticipant } from './entities/chat-participant.entity';
import { Message } from './entities/message.entity';
import { MessageRead } from './entities/message-read.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
    @InjectRepository(ChatParticipant)
    private chatParticipantsRepository: Repository<ChatParticipant>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(MessageRead)
    private messageReadsRepository: Repository<MessageRead>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,

  ) {}

  private deduplicateChats(chats: Chat[]): Chat[] {
    const seen = new Set<string>();
    return chats.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }

  private sortChatsByLatestMessage(chats: Chat[]): Chat[] {
    return chats.sort((a, b) => {
      const aTime =
        a.messages?.length > 0
          ? new Date(a.messages[a.messages.length - 1].createdAt).getTime()
          : new Date(a.updatedAt).getTime();
      const bTime =
        b.messages?.length > 0
          ? new Date(b.messages[b.messages.length - 1].createdAt).getTime()
          : new Date(b.updatedAt).getTime();
      return bTime - aTime;
    });
  }

  async GetAllChats(userId: string): Promise<Chat[]> {
    const participantEntries = await this.chatParticipantsRepository.find({
      where: { userId },
      relations: [
        'chat',
        'chat.participants',
        'chat.participants.user',
        'chat.messages',
        'chat.messages.sender',
        'chat.messages.reads',
      ],
    });

    const chats = participantEntries.map((e) => e.chat).filter(Boolean);
    const unique = this.deduplicateChats(chats);
    return this.sortChatsByLatestMessage(unique);
  }

  async GetChatById(chatId: string, userId: string): Promise<Chat> {
    const chat = await this.chatsRepository.findOne({
      where: { id: chatId },
      relations: [
        'participants',
        'participants.user',
        'messages',
        'messages.sender',
        'messages.reads',
      ],
      order: { messages: { createdAt: 'ASC' } },
    });

    if (!chat) throw new NotFoundException('Chat not found');

    const isParticipant = chat.participants.some((p) => p.userId === userId);
    if (!isParticipant)
      throw new ForbiddenException('You are not a participant of this chat');

    return chat;
  }

  async RoomAlreadyExist(RoomName: string): Promise<Chat | null> {
    if (!RoomName) return null;
    try {
      const chat = await this.chatsRepository
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.participants', 'participant')
        .leftJoinAndSelect('participant.user', 'participantUser')
        .leftJoinAndSelect('chat.messages', 'message')
        .leftJoinAndSelect('message.sender', 'messageSender')
        .leftJoinAndSelect('message.reads', 'reads')
        .where('chat.RoomName = :RoomName', { RoomName })
        .orderBy('message.createdAt', 'ASC')
        .getOne();

      return chat ?? null;
    } catch (err) {

      throw new InternalServerErrorException('Failed to load chat room');
    }
  }

  async findPrivateChat(userId: string, otherUserId: string): Promise<Chat | null> {
    const userChats = await this.chatParticipantsRepository.find({
      where: { userId },
      relations: ['chat'],
    });

    const privateChatIds = userChats
      .filter((p) => p.chat?.type === 'private' && !p.chat?.activityId)
      .map((p) => p.chatId);

    if (!privateChatIds.length) return null;

    const shared = await this.chatParticipantsRepository.findOne({
      where: { userId: otherUserId, chatId: In(privateChatIds) },
    });

    if (!shared) return null;

    const chat = await this.chatsRepository.findOne({
      where: { id: shared.chatId },
      relations: [
        'participants',
        'participants.user',
        'messages',
        'messages.sender',
        'messages.reads',
      ],
      order: { messages: { createdAt: 'ASC' } },
    });

    // Only return if exactly 2 participants (true private chat)
    if (chat && chat.participants.length !== 2) return null;
    return chat ?? null;
  }

  async StartPrivateChat(
    sourceId: string,
    destinationId: string,
    RoomName: string,
  ): Promise<Chat> {
    if (sourceId === destinationId)
      throw new BadRequestException('Cannot create chat with yourself');

    // Check by participants first (most reliable)
    const existing = await this.findPrivateChat(sourceId, destinationId);
    if (existing) return existing;

    // Validate both users exist
    const [source, dest] = await Promise.all([
      this.usersRepository.findOne({ where: { id: sourceId } }),
      this.usersRepository.findOne({ where: { id: destinationId } }),
    ]);
    if (!source) throw new NotFoundException('Source user not found');
    if (!dest) throw new NotFoundException('Destination user not found');

    // Create chat
    const chat = this.chatsRepository.create({ type: 'private', RoomName });
    const savedChat = await this.chatsRepository.save(chat);

    // Create both participants atomically
    await this.chatParticipantsRepository.save([
      this.chatParticipantsRepository.create({ chatId: savedChat.id, userId: sourceId }),
      this.chatParticipantsRepository.create({ chatId: savedChat.id, userId: destinationId }),
    ]);

    const created = await this.chatsRepository.findOne({
      where: { id: savedChat.id },
      relations: [
        'participants',
        'participants.user',
        'messages',
        'messages.sender',
        'messages.reads',
      ],
    });

    if (!created) throw new NotFoundException('Chat not found after creation');
    return created;
  }

  async createActivityChat(
    activityId: string,
    creatorId: string,
    activityTitle: string,
    image: string,
  ): Promise<Chat> {
    const existing = await this.chatsRepository.findOne({
      where: { activityId, type: 'group' },
    });
    if (existing) return existing;

    
    
    const chat = this.chatsRepository.create({
      type: 'group',
      RoomName: `Group: ${activityTitle}`,
      activityId,
      avatar: image,
    });
  
    const saved = await this.chatsRepository.save(chat);
    await this.chatParticipantsRepository.save(
      this.chatParticipantsRepository.create({ chatId: saved.id, userId: creatorId, role: 'admin' }),
    );

    const created = await this.chatsRepository.findOne({
      where: { id: saved.id },
      relations: ['participants', 'participants.user'],
    });
    if (!created) throw new NotFoundException('Activity chat not found after creation');
    return created;
  }

  async getActivityChat(activityId: string): Promise<Chat | null> {
    return this.chatsRepository.findOne({
      where: { activityId, type: 'group' },
      relations: [
        'participants',
        'participants.user',
        'messages',
        'messages.sender',
        'messages.reads',
      ],
      order: { messages: { createdAt: 'ASC' } },
    });
  }

  async joinActivityChat(activityId: string, userId: string): Promise<Chat> {
    const chat = await this.getActivityChat(activityId);
    if (!chat) throw new NotFoundException('Activity chat not found');

    const already = await this.isUserParticipant(chat.id, userId);
    if (already) return chat;

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.chatParticipantsRepository.save(
      this.chatParticipantsRepository.create({ chatId: chat.id, userId }),
    );

    const updated = await this.chatsRepository.findOne({
      where: { id: chat.id },
      relations: [
        'participants',
        'participants.user',
        'messages',
        'messages.sender',
        'messages.reads',
      ],
      order: { messages: { createdAt: 'ASC' } },
    });
    if (!updated) throw new NotFoundException('Chat not found');
    return updated;
  }

  async leaveActivityChat(activityId: string, userId: string): Promise<void> {
    const chat = await this.getActivityChat(activityId);
    if (!chat) throw new NotFoundException('Activity chat not found');

    const participant = await this.chatParticipantsRepository.findOne({
      where: { chatId: chat.id, userId },
    });
    if (!participant) throw new NotFoundException('You are not a participant');
    await this.chatParticipantsRepository.delete({ id: participant.id });
  }

  async deleteActivityChat(activityId: string): Promise<void> {
    const chat = await this.getActivityChat(activityId);
    if (!chat) throw new NotFoundException('Activity chat not found');
    await this.chatsRepository.delete({ id: chat.id });
  }


  async getMessagesForChat(chatId: string, userId: string): Promise<Message[]> {
    const isParticipant = await this.isUserParticipant(chatId, userId);
    if (!isParticipant)
      throw new ForbiddenException('You are not a participant of this chat');

    return this.messagesRepository.find({
      where: { chatId, isDeleted: false },
      relations: ['sender', 'reads'],
      order: { createdAt: 'ASC' },
    });
  }

  async SaveMessage(
    chatId: string,
    senderId: string,
    content: string,
    isSystem = false,
  ): Promise<Message> {
    if (!chatId || !senderId || !content?.trim())
      throw new BadRequestException('chatId, senderId, and content are required');

    if (!isSystem) {
      const isParticipant = await this.isUserParticipant(chatId, senderId);
      if (!isParticipant)
        throw new ForbiddenException('User is not a participant of this chat');
    }

    const message = this.messagesRepository.create({
      chatId,
      senderId,
      content: content.trim(),
      messageType: isSystem ? 'system' : 'text',
      isSystem,
    });
    const saved = await this.messagesRepository.save(message);

    if (!isSystem) {
      await this.upsertMessageRead(saved.id, senderId);
    }

    const found = await this.messagesRepository.findOne({
      where: { id: saved.id },
      relations: ['sender', 'reads'],
    });
    if (!found) throw new NotFoundException('Message not found after save');
    return found;
  }

  async editMessage(messageId: string, userId: string, content: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'reads'],
    });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId)
      throw new ForbiddenException('You can only edit your own messages');
    if (message.isDeleted)
      throw new BadRequestException('Cannot edit a deleted message');

    message.content = content.trim();
    message.isEdited = true;
    message.updatedAt = new Date();
    await this.messagesRepository.save(message);

    const updated = await this.messagesRepository.findOne({
      where: { id: message.id },
      relations: ['sender', 'reads'],
    });
    if (!updated) throw new NotFoundException('Message not found after edit');
    return updated;
  }

  async deleteMessage(messageId: string, userId: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId)
      throw new ForbiddenException('You can only delete your own messages');

    message.isDeleted = true;
    message.content = 'This message has been deleted';
    message.updatedAt = new Date();
    return this.messagesRepository.save(message);
  }

  async getMessageCount(chatId: string): Promise<number> {
    return this.messagesRepository.count({ where: { chatId, isDeleted: false } });
  }

  private async upsertMessageRead(messageId: string, userId: string): Promise<void> {
    await this.messageReadsRepository
      .createQueryBuilder()
      .insert()
      .into(MessageRead)
      .values({ messageId, userId })
      .orIgnore()
      .execute();
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messagesRepository.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    await this.upsertMessageRead(messageId, userId);
  }

  async markMessagesAsRead(messageIds: string[], userId: string): Promise<void> {
    await Promise.all(messageIds.map((id) => this.upsertMessageRead(id, userId)));
  }

  async getUnreadCount(chatId: string, userId: string): Promise<number> {
    const messages = await this.messagesRepository.find({
      where: { chatId, isDeleted: false },
      relations: ['reads'],
    });
    return messages.filter(
      (m) => m.senderId !== userId && !m.reads?.some((r) => r.userId === userId),
    ).length;
  }

  async isUserParticipant(chatId: string, userId: string): Promise<boolean> {
    const p = await this.chatParticipantsRepository.findOne({
      where: { chatId, userId },
    });
    return !!p;
  }

  async clearChat(
    chatId: string,
    userId: string,
  ): Promise<{ success: boolean; deletedCount: number }> {
    if (!(await this.isUserParticipant(chatId, userId)))
      throw new ForbiddenException('You are not a participant of this chat');

    const result = await this.messagesRepository.update(
      { chatId, isDeleted: false },
      { isDeleted: true, content: 'Message deleted', updatedAt: new Date() },
    );
    return { success: true, deletedCount: result.affected ?? 0 };
  }
}