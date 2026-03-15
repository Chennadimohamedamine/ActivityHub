import React from "react";
import { Link } from "react-router-dom";

interface ChatHeaderProps {
  display: { name: string; avatar: string | null; initials: string; memberCount: number | null };
  isConnected: boolean;
  isGroupChat: boolean;
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
  onBack?: () => void;
  onClearChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  display,
  isConnected,
  isGroupChat,
  showSettings,
  setShowSettings,
  onBack,
  onClearChat,
}) => {
  return (
    <div className="h-16 border-b border-zinc-800/60 flex items-center justify-between px-4 bg-[#111111] flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="md:hidden p-1.5 text-zinc-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="relative flex-shrink-0">
          {display.avatar ? (
            <img src={display.avatar} alt={display.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-zinc-800" />
          ) : (
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ring-2 ring-zinc-800 ${isGroupChat ? "bg-gradient-to-br from-violet-500 to-purple-600" : "bg-gradient-to-br from-yellow-400 to-orange-500"}`}>
              <span className="text-white text-xs font-bold">{display.initials}</span>
            </div>
          )}
          {isConnected && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#111111]" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-sm text-white ${!isGroupChat ? "hover:text-yellow-400" : ""}`}>
              {isGroupChat ? `${display.name}` : (<Link to={`/dashboard/profile/${display.name}`}>{display.name}</Link>)}
            </h3>
            {isGroupChat && (
              <span className="text-[9px] bg-violet-500/15 text-violet-400 px-1.5 py-0.5 rounded-md uppercase font-bold border border-violet-500/20">
                Channel
              </span>
            )}
          </div>
          <p className={`text-[10px] font-semibold tracking-widest uppercase mt-0.5 ${isConnected && !isGroupChat ? "text-emerald-500" : "text-zinc-600"}`}>
            {
              !isConnected && !isGroupChat
                ? "Offline"
                : isGroupChat
                  ? display.memberCount === 1
                    ? "1 member"
                    : `${display.memberCount} members`
                  : " Online"
            }
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
          className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 rounded-xl transition-all"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        {showSettings && (
          <div
            className="absolute top-10 right-0 w-52 bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl py-1.5 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {isGroupChat && display.memberCount && (
              <div className="px-4 py-2 border-b border-zinc-800/60 mb-1">
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">Group Members</p>
                <p className="text-xs text-zinc-400 mt-0.5">{display.memberCount} participants</p>
              </div>
            )}
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-900 transition-colors flex items-center gap-3"
              onClick={onClearChat}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
