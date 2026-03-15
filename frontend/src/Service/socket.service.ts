import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(): void { 
   if (this.socket?.connected) {
   
      return;
    }

    const socketUrl = 'https://localhost/chat';

    this.socket = io(socketUrl, {
      path: '/chat/socket.io', 
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
    });

    this.socket.on('connected', (data) => {
  
    });

    this.socket.on('disconnect', (reason) => {

    });

    this.socket.on('connect_error', (error) => {
  
    });

    this.socket.on('error', (error) => {
  
    });

    // Debug: Log all incoming events
    this.socket.onAny((eventName, ...args) => {
    });

    this.socket.on('join_chat_request', (data) => {

      if (this.socket) {
        this.socket.emit('join_chat', { RoomName: data.RoomName, type: data.type });
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.listeners.clear();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any, callback?: (response: any) => void): void {
    if (this.socket?.connected) {
      
      this.socket.emit(event, data, (response: any) => {

        if (callback) callback(response);
      });
    } else {
      console.warn('Cannot emit event, socket not connected:', event);
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);

      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event)?.add(callback);
    }
  }

  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      if (callback) {
        
        this.socket.off(event, callback);
        this.listeners.get(event)?.delete(callback);
      } else {
        this.socket.off(event);
        this.listeners.delete(event);
      }
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }



  once(event: string, callback: (data: any) => void): void {
    if (this.socket) {
    
      this.socket.once(event, callback);
    }
  }


  joinChat(data: { RoomName: string, type: 'private' | 'group' }): void {
  
    this.emit('join_chat', data, (response) => {

    });
  }
  joinInAllChats(data: { chatIds: string[] }): void {

  this.emit('joinAllChats', data, (response) => { }); 
}

  StartPrivateChat(data:{ destinationId: string, type: 'private',RoomName:string }): void {
 
    this.emit('StartPrivateChat', data, (response) => {
   
    });
  }

  joinActivityChat(data: { activityId: string }): void {

    this.emit('join_activity_chat', data, (response) => {
    
    });
  }

  leaveActivityChat(data: { activityId: string }): void {
  
    this.emit('leave_activity_chat', data, (response) => {
     
    });
  }
  deletActivityChat(data: { activityId: string }): void {
   
    this.emit('delete_activity_chat', data, (response) => {
    
    });
  }
}

export const socketService = new SocketService();