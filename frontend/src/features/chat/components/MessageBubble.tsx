import React from "react";

interface MessageBubbleProps {
  msg: any;
  isOwn: boolean;
  isGroupChat: boolean;
  isSameAuthorAsPrev: boolean;
  showMessageMenu: string | null;
  setShowMessageMenu: (id: string | null) => void;
  setEditingMessage: (msg: { id: string; content: string } | null) => void;
  handleDeleteMessage: (id: string) => void;
  getSenderName: (msg: any) => string;
  getSenderInitials: (msg: any) => string;
  getSenderColor: (senderId: string) => string;
  formatTimestamp: (ts: any) => string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  isOwn,
  isGroupChat,
  isSameAuthorAsPrev,
  showMessageMenu,
  setShowMessageMenu,
  setEditingMessage,
  handleDeleteMessage,
  getSenderName,
  getSenderInitials,
  getSenderColor,
  formatTimestamp,
}) => {
  if (isGroupChat && !isOwn) {
    const senderName = getSenderName(msg);
    const colorClass = getSenderColor(msg.senderId);

    return (
      <div className={`flex items-end gap-2 ${isSameAuthorAsPrev ? "mt-0.5" : "mt-3"}`}>
        <div className="flex-shrink-0 w-7">
          {!isSameAuthorAsPrev ? (
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
              <span className="text-white text-[9px] font-bold">{getSenderInitials(msg)}</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-start max-w-[72%] md:max-w-[60%]">
          {!isSameAuthorAsPrev && (
            <span className="text-[11px] font-semibold text-zinc-400 mb-1 ml-1">{senderName}</span>
          )}
          <div className={`relative group px-4 py-2.5 text-sm leading-relaxed shadow-sm rounded-2xl rounded-bl-md border border-zinc-700/40
            ${msg.isDeleted ? "opacity-50 italic bg-zinc-800/40 text-zinc-500" : "bg-zinc-800/80 text-zinc-100"}`}
          >
            {msg.content}
            {msg.isEdited && !msg.isDeleted && (
              <span className="text-[9px] opacity-50 ml-1.5">edited</span>
            )}
          </div>
          <span className="text-[10px] text-zinc-600 mt-1 ml-1">{formatTimestamp(msg.createdAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} ${isSameAuthorAsPrev ? "mt-0.5" : "mt-3"}`}>
      <div className={`max-w-[72%] md:max-w-[60%] group flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {isGroupChat && isOwn && !isSameAuthorAsPrev && (
          <span className="text-[11px] font-semibold text-zinc-400 mb-1 mr-1">You</span>
        )}

        <div className="relative flex items-end gap-2">
          <div className={`relative px-4 py-2.5 text-sm leading-relaxed shadow-sm
            ${isOwn
              ? "bg-[#fbbf24] text-zinc-900 rounded-2xl rounded-br-md"
              : "bg-zinc-800/80 text-zinc-100 rounded-2xl rounded-bl-md border border-zinc-700/40"
            }
            ${msg.isDeleted ? "opacity-50 italic" : ""}`}
          >
            {msg.content}
            {msg.isEdited && !msg.isDeleted && (
              <span className="text-[9px] opacity-50 ml-1.5">edited</span>
            )}
          </div>

          {isOwn && !msg.isDeleted && (
            <div className="relative flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setShowMessageMenu(showMessageMenu === msg.id ? null : msg.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-zinc-300 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              {showMessageMenu === msg.id && (
                <div className="absolute bottom-8 right-0 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1 min-w-[110px] z-50"
                  onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { setEditingMessage({ id: msg.id, content: msg.content }); setShowMessageMenu(null); }}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-900 flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-zinc-900 flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px] text-zinc-600">{formatTimestamp(msg.createdAt)}</span>
          {isOwn && !msg.isDeleted && (
            msg.reads?.length > 0 ? (
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l4 4 9-9M9 12.75l4 4 9-9" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )
          )}
        </div>
      </div>
    </div>
  );
};
