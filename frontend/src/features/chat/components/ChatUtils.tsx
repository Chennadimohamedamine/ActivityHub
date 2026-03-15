interface ChatUtilsProps {
    error?: string | null;
    setError?: (error: string | null) => void;
    isGroupChat?: any;    
}

export const ErrorMessages = ({
    error,
    setError,
}: ChatUtilsProps) => {
    return (
        <div className="flex items-center justify-between px-4 py-2 bg-red-950/40 border-b border-red-900/30 flex-shrink-0">
            <p className="text-red-400 text-xs">{error}</p>
            <button onClick={() => setError?.(null)} className="text-red-500/60 hover:text-red-400 ml-4">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

export const LoadingIndicator = () => {
    return (
        <div className="flex justify-center py-12">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-zinc-700 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-zinc-700 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-zinc-700 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
    );
}

export const EmptyState = (
    isGroupChat?: any
) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center py-16">
        <div className="w-14 h-14 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-zinc-400 text-sm font-medium mb-1">No messages yet</p>
        <p className="text-zinc-600 text-xs">
          {isGroupChat ? "Be the first to say something!" : "Start the conversation!"}
        </p>
        </div>
    );
}
