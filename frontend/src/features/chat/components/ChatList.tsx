import React, { useEffect, useState } from "react";
import type { chat } from "../types";
import { Loader } from "lucide-react";
import ApiService from "../../../Service/api.service";
import { socketService } from "../../../Service/socket.service";

interface ChatListProps {
  chats: chat[];
  activeChatId?: string;
  onsetActiveChatId?: (chatId: string) => void;
  setChats: React.Dispatch<React.SetStateAction<chat[]>>;
  userinfo: any;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onsetActiveChatId,
  userinfo,
}) => {
  const [activeFilter, setActiveFilter] = useState<"all" | "private" | "group">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!socketService.isConnected()) socketService.connect();
  }, []);

  const sortedChats = chats
    .filter((c) => activeFilter === "all" || c.type === activeFilter)
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );

  const getChatDisplayInfo = (chat: chat) => {
    if (chat.type === "private" && chat.participants) {
      const other = chat.participants.find((p: any) => p.userId !== userinfo.id);
      if (other?.user) {
        const name =
          other.user.Username
        return {
          name,
          avatar: `https://localhost${other.user.profileImage}` || null,
          initials: name.slice(0, 2).toUpperCase(),
        };
      }
    }
    const chatName = chat.RoomName?.replace("Group: ", "") || chat.name || "Chat";
    return {
      name: chatName,

      avatar: chat.avatar ? `https://localhost/uploads/${chat.avatar}` : null,
      initials: chatName.slice(0, 2).toUpperCase(),
    };
  };

  const getTimeAgo = (date: string) => {
    if (!date) return "";
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    const h = Math.floor(diff / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getLastMessagePreview = (chat: chat) => {
    if (!chat.messages?.length) return "No messages yet";
    const last = chat.messages[chat.messages.length - 1];
    if (last.isDeleted) return "Message deleted";
    let prefix = "";
    if (chat.type === "group") {
      if (last.senderId === userinfo.id) {
        prefix = "You: ";
      } else {
        const sender = chat.participants?.find((p: any) => p.userId === last.senderId)?.user;
        const senderName = sender?.username || last.sender?.username || "Unknown";
        prefix = senderName.slice(0, 10) + ": ";
      }
    }
    const content = last.content || "";
    const max = 30 - prefix.length;
    return prefix + (content.length > max ? content.slice(0, max) + "…" : content);
  };

  const checkExistingChat = (userId: string) =>
    chats.find(
      (c) => c.type === "private" && c.participants?.some((p: any) => p.userId === userId)
    );

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); setShowSearchResults(false); return; }
    setIsSearching(true);
    try {
      const results = await ApiService.searchUsers(query);
      setSearchResults((results || []).filter((u: any) => u.id !== userinfo.id));
      setShowSearchResults(true);
    } catch { setSearchResults([]); }
    finally { setIsSearching(false); }
  };

  const handleSelectUser = async (selectedUser: any) => {
    if (selectedUserId === selectedUser.id) return;
    try {
      setSelectedUserId(selectedUser.id);
      setIsSearching(true);

      const existing = checkExistingChat(selectedUser.id);
      if (existing) {
        onsetActiveChatId?.(existing.id);
        setSearchQuery(""); setSearchResults([]); setShowSearchResults(false);
        setSelectedUserId(null);
        return;
      }

      const roomId = [userinfo.id, selectedUser.id].sort().join('-');
      socketService.StartPrivateChat({
        destinationId: selectedUser.id,
        type: "private",
        RoomName: `private-${roomId}`,
      });

      const newChat = await new Promise<any>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Timeout")), 5000);
        socketService.once("chat:created", (data) => { clearTimeout(timeout); resolve(data); });
      });

      onsetActiveChatId?.(newChat.id);
      setSearchQuery(""); setSearchResults([]); setShowSearchResults(false);
      setSelectedUserId(null);
    } catch {
      alert("Failed to open chat. Please try again.");
      setSelectedUserId(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark border-r border-zinc-800">


      <div className="px-5 pt-5 pb-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-white mb-4">Messages</h1>
        <div className="mb-3 relative">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search or start new chat..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery && setShowSearchResults(true)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400/30 transition-all"
            />
          </div>

          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-50">
              {isSearching && (
                <div className="p-4 flex items-center justify-center gap-2 text-zinc-500 text-sm">
                  <Loader className="w-4 h-4 animate-spin" /> Searching...
                </div>
              )}
              {!isSearching && !searchResults.length && searchQuery && (
                <div className="p-4 text-center text-zinc-600 text-sm">No users found</div>
              )}
              {!isSearching && searchResults.map((u) => {
                const busy = selectedUserId === u.id;
                const hasChat = checkExistingChat(u.id);
                const displayName = u.Username || "Unknown";
                return (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    disabled={busy}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 transition-colors border-b border-zinc-800/60 last:border-b-0 ${busy ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {u.avatar ? (
                      <img src={u.avatar} alt={displayName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-black text-xs font-bold">{displayName.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                      <p className="text-xs text-zinc-600 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {hasChat && (
                        <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-md uppercase font-bold border border-emerald-500/20">
                          Chat
                        </span>
                      )}
                      {busy
                        ? <Loader className="w-4 h-4 animate-spin text-zinc-500" />
                        : <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      }
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-1.5">
          {(["all", "private", "group"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${activeFilter === f
                  ? "bg-yellow-400 text-zinc-900"
                  : "bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800"
                }`}
            >
              {f === "group" ? "Channel" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {sortedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-zinc-500 text-sm font-medium">
              {activeFilter === "private" ? "No private chats" : activeFilter === "group" ? "No channels" : "No conversations yet"}
            </p>
            <p className="text-zinc-700 text-xs mt-1">Search above to get started</p>
          </div>
        ) : (
          sortedChats.map((chat) => {
            const info = getChatDisplayInfo(chat);
            const isActive = chat.id === activeChatId;
            return (
              <button
                key={chat.id}
                onClick={() => {
                  onsetActiveChatId?.(chat.id);
                  setShowSearchResults(false);
                  setSearchQuery("");
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 mt-2 transition-all ${isActive ? "bg-zinc-800 ring-1 ring-yellow-400/20" : "hover:bg-zinc-900/50"
                  }`}
              >
                <div className="relative flex-shrink-0">
                  {typeof info.avatar === 'string' ? (
                    <img src={info.avatar} alt={info.name} className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <span className="text-black text-xs font-bold">{info.initials}</span>
                    </div>
                  )}
                  {chat.unreadCount && chat.unreadCount > 0 ? (
                    <div className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-yellow-400 text-zinc-900 text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                      {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                    </div>
                  ) : null}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <p className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-zinc-200"}`}>
                      {info.name}
                    </p>
                    <span className="text-[10px] text-zinc-600 uppercase flex-shrink-0">
                      {getTimeAgo(chat.updatedAt || chat.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{getLastMessagePreview(chat)}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};