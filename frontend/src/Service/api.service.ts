import  api from '../features/auth/hooks/axiosConfig.ts';
import axios from 'axios'
import type { Message, chat } from '../features/chat/types';

const handleApiError = (error: any): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;
    throw new Error(message);
  }
  throw error;
};

const ApiService = {
  
  async getAllChats(): Promise<any[]> {
    try {
      const { data } = await api.get<any[]>('/chat');
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getChatById(chatId: string): Promise<chat> {
    try {
      const { data } = await api.get<chat>(`/chat/${chatId}`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getUser() {
    try {
      const { data } = await api.get<{ user: any }>("/users/userinfo");
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  async searchUsers(query: string): Promise<any[]> {
    try {
      const { data } = await api.get<any[]>(`/users/search`, { params: { query } });
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }
  ,
  async getChatMessages(chatId: string, page?: number): Promise<Message[]> {
    try {
      const params = page ? { page } : {};
      const { data } = await api.get<Message[]>(`/chat/${chatId}/messages`, { params });
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async sendMessage(chatId: string, content: string): Promise<Message> {
    try {
      const { data } = await api.post<Message>(`/chat/${chatId}/messages`, { content, messageType: 'text' });
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async editMessage(messageId: string, content: string): Promise<Message> {
    try {
      const { data } = await api.patch<Message>(`/chat/messages/${messageId}`, { content });
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await api.delete(`/chat/messages/${messageId}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async markAsRead(chatId: string, messageIds?: string[]): Promise<void> {
    try {
      await api.patch(`/chat/${chatId}/read`, { messageIds });
    } catch (error) {
      return handleApiError(error);
    }
  },
  async getActivityImageProfile(activityId: string): Promise<any> {
    try {
      const { data } = await api.get(`/activities/${activityId}/imageProfile`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }
  ,

  async getActivityChat(activityId: string): Promise<chat | null> {
    try {
      const response = await api.get<chat>(`/chat/activity/${activityId}`);
      const data = response.data; // Extracting data from the response
      return data;
    } catch (error: any) { // Type assertion added here
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      return handleApiError(error);
    }
  },

  async createActivityChat(activityId: string): Promise<chat> {
    try {
      const { data } = await api.post<chat>(`/chat/activity/${activityId}/CreateChat`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async joinActivityChat(chatId: string): Promise<any> {
    try {
      const { data } = await api.post(`/chat/activity/${chatId}/join`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async leaveActivityChat(chatId: string): Promise<any> {
    try {
      const { data } = await api.post(`/chat/activity/${chatId}/leave`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  async getStatusOfUser(userId: string): Promise<any>{
    try {
      const { data } = await api.get(`/users/${userId}/online-status`);
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default ApiService;