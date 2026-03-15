import React from "react";

const EMOJIS = ["🔥", "👍", "😂", "😍", "🙌", "⛰️", "👟", "🍕", "🍻"];

interface MessageInputProps {
  inputValue: string;
  isConnected: boolean;
  isGroupChat: boolean;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (v: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  addEmoji: (emoji: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  inputValue,
  isConnected,
  isGroupChat,
  showEmojiPicker,
  setShowEmojiPicker,
  handleInputChange,
  handleSendMessage,
  addEmoji,
}) => {
  return (
    <div className="px-4 py-3 bg-[#111111] border-t border-zinc-800/60 flex-shrink-0 relative">
      {showEmojiPicker && (
        <div
          className="absolute bottom-full left-4 mb-2 p-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-wrap max-w-[260px] gap-1 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => addEmoji(e)}
              className="w-9 h-9 flex items-center justify-center text-xl hover:bg-zinc-800 rounded-xl transition-all active:scale-90"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex gap-2 max-w-5xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as any); }
            }}
            placeholder={isConnected ? (isGroupChat ? "Message the group…" : "Type your message…") : "Connecting..."}
            disabled={!isConnected}
            rows={1}
            className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-2xl py-2.5 pl-4 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 min-h-[42px] max-h-32 resize-none transition-all disabled:opacity-40"
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-yellow-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        <button
          type="submit"
          disabled={!inputValue.trim() || !isConnected}
          className="flex-shrink-0 w-10 h-10 bg-yellow-400 text-zinc-900 rounded-full flex items-center justify-center hover:bg-yellow-300 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all shadow-lg shadow-yellow-400/20"
        >
          <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>

      <p className="text-center text-[9px] text-zinc-700 mt-2 uppercase tracking-widest font-semibold">
        {isConnected ? "End-to-end encrypted" : "Connecting to server..."}
      </p>
    </div>
  );
};
