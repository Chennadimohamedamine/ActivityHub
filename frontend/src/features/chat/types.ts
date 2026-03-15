export interface User {
    Username: any;
    id: string;
    email: string;
    username: string;
    avatar?: string;
    bio?: string;
    profileImage ?: string;
    createdAt: string;
    updatedAt: string;
  }
  
export interface chat {
    RoomName: any;
    id: string;
    name?: string;
    type: 'private' | 'group';
    avatar?: string;
    participants?: ChatParticipant[];
    messages?: Message[];
    createdAt: string;
    updatedAt: string;
    isBlocked: boolean;
    isMuted: boolean;
    unreadCount?: number;
    lastMessage?: Message;
  }
  
  export interface ChatParticipant {
    id: string;
    chatId: string;
    userId: string;
    user: User;
    lastReadAt?: string;
    joinedAt: string;
  }
  

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    sender?: User;
    content: string;
    createdAt: string;
    updatedAt?: string;
    messageType?: string;
    isEdited?: boolean;
    isDeleted?: boolean;
    reads?: MessageRead[];
  }
  
  export interface MessageRead {
    id?: string;
    messageId: string;
    userId: string;
    readAt: string;
  }