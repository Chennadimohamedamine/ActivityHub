import React, { useEffect, useRef, useState } from "react";
import type { User } from "../types";
import ApiService from "../../../Service/api.service";
import { socketService } from "../../../Service/socket.service";
import { EmptyState, ErrorMessages, LoadingIndicator } from "./ChatUtils";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { EditMessageBar } from "./EditMessageBar";
import { MessageInput } from "./MessageInput";

interface ChatWindowProps {
  chatId: string;
  user: User | null;
  initialChatInfo?: any;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatId,
  user,
  initialChatInfo,
  onBack,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatInfo, setChatInfo] = useState<any>(initialChatInfo ?? null);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null);
  const [participantsMap, setParticipantsMap] = useState<Record<string, { id: string; Username: string }>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const isActiveRef = useRef(true);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0d0d0d]">
        <p className="text-zinc-500 text-sm">Please log in to access the chat</p>
      </div>
    );
  }

  const isGroupChat = chatInfo?.type === "group";

  const getSenderName = (msg: any): string => {

    if (msg?.sender?.Username) {
      return msg.sender.Username;
    }
    if (chatInfo?.participants) {
      const participant = chatInfo.participants.find(
        (p: any) => p.userId === msg?.senderId
      );
      if (participant?.user?.Username) {
        return participant.user.Username;
      }
    }
    const participant = participantsMap[msg.senderId];
    if (participant?.Username) {
      return participant.Username;
    }
    return `User_${msg?.senderId?.slice(0, 6) ?? "?"}`;
  };

  const getSenderInitials = (msg: any): string =>
    getSenderName(msg).slice(0, 2).toUpperCase();

  const getSenderColor = (senderId: string): string => {
    const palette = [
      "from-violet-500 to-purple-600",
      "from-blue-500 to-cyan-600",
      "from-emerald-500 to-teal-600",
      "from-pink-500 to-rose-600",
      "from-orange-500 to-amber-600",
      "from-indigo-500 to-blue-600",
    ];
    let hash = 0;
    for (let i = 0; i < senderId.length; i++) hash = senderId.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
  };

  useEffect(() => {
    if (!chatId) return;
    setIsLoading(true);
    setError(null);
    setMessages([]);

    const chatInfoPromise = initialChatInfo
      ? Promise.resolve(initialChatInfo)
      : ApiService.getChatById(chatId);

    const messagesPromise = ApiService.getChatMessages(chatId);

    Promise.all([messagesPromise, chatInfoPromise])
      .then(async ([msgs, info]) => {
        setMessages(msgs || []);
        setChatInfo(info);
        setError(null);
        socketService.joinChat({ RoomName: info.RoomName, type: info.type });
        if (msgs?.length > 0) markMessagesAsRead(msgs);


      const map: Record<string, { id: string; Username: string }> = {};

      info.participants?.forEach((p: any) => {
        if (p.userId && p.user) {
          map[p.userId] = {
            id: p.userId,
            Username: p.user.Username,
          };
        }
      });
      setParticipantsMap(map);
  
      if (info.type === "private") {
        const otherUser = Object.values(map).find(
          (p: any) => p.Username !== user.Username
        );
        if (otherUser) {
  
          const status = await ApiService.getStatusOfUser(otherUser.id);
      
            setIsOnline(status.isOnline);
        }
      }
    })

      .catch((err) => {
      })
      .finally(() => setIsLoading(false));
  }, [chatId]);

  useEffect(() => {
    if (initialChatInfo) setChatInfo(initialChatInfo);

  }, [initialChatInfo]);

  useEffect(() => {
    if (!chatId) return;

    const onConnect = () => {
      setIsConnected(true);
      if (chatInfo?.RoomName) socketService.joinChat({ RoomName: chatInfo.RoomName, type: chatInfo.type });
    };
    const onDisconnect = () => setIsConnected(false);

    const onNewMessage = (message: any) => {
      setMessages((prev) => [...prev, message]);
      if (isActiveRef.current) {
        socketService.emit("message:mark_read", { messageId: message.id, chatId });
      }
    };

    const onSystemMessage = (data: any) => {
      setMessages((prev) => [
        ...prev,
        { id: `system_${Date.now()}`, isSystem: true, content: data.content, createdAt: data.timestamp },
      ]);
    };

    const onEditedMessage = (data: any) => {
      setMessages((prev) =>
        prev.map((m) => m.id === data.messageId ? { ...m, content: data.content, isEdited: true } : m)
      );
    };

    const onDeletedMessage = (messageId: string) => {
      setMessages((prev) =>
        prev.map((m) => m.id === messageId ? { ...m, isDeleted: true, content: "Message deleted" } : m)
      );
    };

    const onUserTyping = (data: any) => {
      setIsTyping(true);
      if (isGroupChat && data?.userId) {
        const participant = chatInfo?.participants?.find((p: any) => p.userId === data.userId);
        setTypingUser(participant?.user?.username || `User_${data.userId?.slice(0, 6)}`);
      }
    };
    const onUserStopTyping = () => { setIsTyping(false); setTypingUser(null); };

    socketService.on("connect", onConnect);
    socketService.on("disconnect", onDisconnect);
    socketService.on(`chat:${chatId}:system:message`, onSystemMessage);
    socketService.on(`chat:${chatId}:message:new`, onNewMessage);
    socketService.on(`chat:${chatId}:message:edited`, onEditedMessage);
    socketService.on(`chat:${chatId}:message:deleted`, onDeletedMessage);
    socketService.on(`chat:${chatId}:user:typing`, onUserTyping);
    socketService.on(`chat:${chatId}:user:stopTyping`, onUserStopTyping);
    setIsConnected(socketService.isConnected());

    return () => {
      socketService.off("connect", onConnect);
      socketService.off("disconnect", onDisconnect);
      socketService.off(`chat:${chatId}:system:message`, onSystemMessage);
      socketService.off(`chat:${chatId}:message:new`, onNewMessage);
      socketService.off(`chat:${chatId}:message:edited`, onEditedMessage);
      socketService.off(`chat:${chatId}:message:deleted`, onDeletedMessage);
      socketService.off(`chat:${chatId}:user:typing`, onUserTyping);
      socketService.off(`chat:${chatId}:user:stopTyping`, onUserStopTyping);
    };
  }, [chatId, chatInfo]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    if (isActiveRef.current && messages.length > 0) markMessagesAsRead(messages);
  }, [messages, isTyping]);

  useEffect(() => {
    const onVisibility = () => {
      isActiveRef.current = !document.hidden;
      if (isActiveRef.current && messages.length > 0) markMessagesAsRead(messages);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [messages]);

  useEffect(() => {
    const handler = () => { setShowSettings(false); setShowEmojiPicker(false); setShowMessageMenu(null); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const markMessagesAsRead = (msgs: any[]) => {
    const unread = msgs.filter(
      (m) => !m.isSystem && m.senderId !== user?.id &&
        (!m.reads || !m.reads.some((r: any) => r.userId === user?.id))
    );
    if (unread.length > 0) {
      socketService.emit("messages:mark_read", { chatId, messageIds: unread.map((m) => m.id) });
    }
  };

  const sendMessage = (content: string) => {
    if (!content?.trim()) return;
    socketService.emit("message:send", { chatId, content: content.trim() });
  };

  const startTyping = () => socketService.emit("user:startTyping", { chatId });
  const stopTyping = () => socketService.emit("user:stopTyping", { chatId });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length === 1) startTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
    stopTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleEditMessage = (messageId: string, content: string) => {
    if (!content.trim()) return;
    socketService.emit("message:edit", { messageId, content, chatId });
    setEditingMessage(null);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm("Delete this message?")) {
      socketService.emit("message:delete", { messageId, chatId });
      setShowMessageMenu(null);
    }
  };

  const addEmoji = (emoji: string) => {
    if (editingMessage) setEditingMessage({ ...editingMessage, content: editingMessage.content + emoji });
    else setInputValue((p) => p + emoji);
    setShowEmojiPicker(false);
  };

  const getChatDisplayInfo = () => {
    if (!chatInfo) return { name: "Chat", avatar: null, initials: "CH", memberCount: null };

    if (chatInfo.type === "private" && chatInfo.participants) {
      const other = chatInfo.participants.find((p: any) => p.userId !== user?.id);
      if (other?.user) {

        const name = other.user.Username || other.user.email?.split("@")[0] || `User_${other.userId?.slice(0, 6)}`;
        return { name, avatar: `https://localhost${other.user.profileImage}` || null, initials: name.slice(0, 2).toUpperCase(), memberCount: null };
      }
    }

    const chatName = chatInfo.RoomName?.replace("Group: ", "") || chatInfo.name || "Chat";
    const memberCount = chatInfo.participants?.length ?? null;
    return { name: chatName, avatar: chatInfo.avatar ? `https://localhost/uploads/${chatInfo.avatar}` : null, initials: chatName.slice(0, 2).toUpperCase(), memberCount };
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return "";
    try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
    catch { return ""; }
  };

  const getDateLabel = (ts: any) => {
    if (!ts) return "Today";
    try {
      const d = new Date(ts), today = new Date(), yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (d.toDateString() === today.toDateString()) return "Today";
      if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
      return d.toLocaleDateString();
    } catch { return "Today"; }
  };

  if (!chatId) return null;

  const display = getChatDisplayInfo();

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d]">
      <ChatHeader
        display={display}
        isConnected={isOnline}
        isGroupChat={isGroupChat}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        onBack={onBack}
        onClearChat={() => {
          if (window.confirm("Clear all messages?")) {
            setMessages([]);
            setShowSettings(false);
          }
        }}
      />

      {error && <ErrorMessages error={error} setError={setError} />}

      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-0.5">
        {isLoading && <LoadingIndicator />}
        {!isLoading && messages.length === 0 && <EmptyState isGroupChat={isGroupChat} />}

        {messages.map((msg, index) => {
          const isOwn = msg.senderId === user?.id;
          const isSystem = msg.isSystem;
          const showDateSep = index === 0 || getDateLabel(messages[index - 1]?.createdAt) !== getDateLabel(msg.createdAt);
          const prevMsg = messages[index - 1];
          const isSameAuthorAsPrev =
            index > 0 &&
            !prevMsg?.isSystem &&
            prevMsg?.senderId === msg.senderId &&
            !showDateSep;

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="text-[10px] text-zinc-600 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800/40">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <React.Fragment key={msg.id}>
              {showDateSep && (
                <div className="flex justify-center my-4">
                  <span className="text-[10px] text-zinc-600 bg-zinc-900/60 px-3 py-1 rounded-full uppercase tracking-widest font-semibold">
                    {getDateLabel(msg.createdAt)}
                  </span>
                </div>
              )}
              <MessageBubble
                msg={msg}
                isOwn={isOwn}
                isGroupChat={isGroupChat}
                isSameAuthorAsPrev={isSameAuthorAsPrev}
                showMessageMenu={showMessageMenu}
                setShowMessageMenu={setShowMessageMenu}
                setEditingMessage={setEditingMessage}
                handleDeleteMessage={handleDeleteMessage}
                getSenderName={getSenderName}
                getSenderInitials={getSenderInitials}
                getSenderColor={getSenderColor}
                formatTimestamp={formatTimestamp}
              />
            </React.Fragment>
          );
        })}

        {isTyping && (
          <TypingIndicator isGroupChat={isGroupChat} typingUser={typingUser} />
        )}
      </div>

      {editingMessage && (
        <EditMessageBar
          editingMessage={editingMessage}
          setEditingMessage={setEditingMessage}
          handleEditMessage={handleEditMessage}
        />
      )}

      <MessageInput
        inputValue={inputValue}
        isConnected={isConnected}
        isGroupChat={isGroupChat}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        handleInputChange={handleInputChange}
        handleSendMessage={handleSendMessage}
        addEmoji={addEmoji}
      />
    </div>
  );
};
