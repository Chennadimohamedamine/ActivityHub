import { useEffect, useState } from "react";
import type { chat } from "../types";
import { ChatList } from "../components/ChatList";
import { ChatWindow } from "../components/ChatWindow";
import ApiService from "../../../Service/api.service";
import { socketService } from "../../../Service/socket.service";

const ChatPage: React.FC = () => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<chat | null>(null);
  const [chats, setChats] = useState<chat[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mergeChat = (prev: chat[], incoming: chat): chat[] => {
    const exists = prev.some((c) => c.id === incoming.id);
    const updated = exists
      ? prev.map((c) => (c.id === incoming.id ? { ...c, ...incoming } : c))
      : [...prev, incoming];
    return updated.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getUser();
        setUser(response);

      } catch (err) {
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        const response = await ApiService.getAllChats();
        setChats(response);
      } catch (err) {
        setError("Failed to fetch chats");
      }
    };

    fetchChats();

    if (!socketService.isConnected()) socketService.connect();
    const onChatCreated = (newChat: chat) => {
      setChats((prev) => mergeChat(prev, newChat));
      setActiveChatId(newChat.id);
      setActiveChat(newChat);
    };

    const onNewChatCreated = (newChat: chat) => {
      if (!user) return;
      const isParticipant = newChat.participants?.some((p: any) => p.userId === user.id);
      if (!isParticipant) return;
      setChats((prev) => mergeChat(prev, newChat));
    };

    const onActivityChatJoined = (data: chat) => {
      setChats((prev) => mergeChat(prev, data));
    };

    const onUserJoinedActivityChat = (data: any) => {
      setChats((prev) =>
        prev.map((c) =>
          c.id === data.chatId ? { ...c, updatedAt: new Date().toISOString() } : c
        )
      );
    };

    const onMessageSent = (data: any) => {
      setChats((prev) =>
        prev
          .map((c) =>
            c.id === data.chatId ? { ...c, updatedAt: new Date().toISOString() } : c
          )
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
    };

    const onActivityChatDeleted = (data: any) => {
      setChats((prev) => prev.filter((c) => c.id !== data.chatId));
      setActiveChatId((prev) => {
        if (prev === data.chatId) { setActiveChat(null); return null; }
        return prev;
      });
    };

    socketService.on("chat:created", onChatCreated);
    socketService.on("new_chat_created", onNewChatCreated);
    socketService.on("activity_chat:joined", onActivityChatJoined);
    socketService.on("user_joined_activity_chat", onUserJoinedActivityChat);
    socketService.on("message:sent", onMessageSent);
    socketService.on("activity_chat_deleted", onActivityChatDeleted);

    return () => {
      socketService.off("chat:created", onChatCreated);
      socketService.off("new_chat_created", onNewChatCreated);
      socketService.off("activity_chat:joined", onActivityChatJoined);
      socketService.off("user_joined_activity_chat", onUserJoinedActivityChat);
      socketService.off("message:sent", onMessageSent);
      socketService.off("activity_chat_deleted", onActivityChatDeleted);
    };
  }, [user]);


  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    const found = chats.find((c) => c.id === chatId) ?? null;
    setActiveChat(found);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0d0d0d]">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-zinc-700 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-zinc-700 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-zinc-700 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0d0d0d]">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0d0d0d]">
        <p className="text-zinc-500 text-sm">No user data available.</p>
      </div>
    );
  }
  return (
    <div className="flex h-[95vh] w-full overflow-hidden mb-8">
      <div className={`${activeChatId ? "hidden md:flex" : "flex"} w-full md:w-80 flex-shrink-0 flex-col h-full`}>
        <ChatList
          chats={chats}
          activeChatId={activeChatId ?? undefined}
          onsetActiveChatId={handleSelectChat}
          setChats={setChats}
          userinfo={user}
        />
      </div>


      <div className={`${activeChatId ? "flex" : "hidden md:flex"} flex-1 flex-col h-full overflow-hidden bg-[#0d0d0d]`}>
        {activeChatId ? (
          <ChatWindow
            chatId={activeChatId}
            user={user}
            initialChatInfo={activeChat}
            onBack={() => { setActiveChatId(null); setActiveChat(null); }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-14 h-14 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-zinc-400 text-sm font-medium mb-1">Select a conversation</p>
            <p className="text-zinc-600 text-xs">Choose a chat from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;