import React from "react";

interface TypingIndicatorProps {
  isGroupChat: boolean;
  typingUser: string | null;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isGroupChat, typingUser }) => {
  return (
    <div className="flex items-end gap-2 mt-3">
      {isGroupChat && (
        <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[9px] font-bold">
            {typingUser?.slice(0, 2).toUpperCase() ?? "??"}
          </span>
        </div>
      )}
      <div>
        {isGroupChat && typingUser && (
          <span className="text-[11px] text-zinc-500 mb-1 block ml-1">{typingUser} is typing…</span>
        )}
        <div className="bg-zinc-800/80 border border-zinc-700/40 px-4 py-3 rounded-2xl rounded-bl-md flex gap-1">
          <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
};
