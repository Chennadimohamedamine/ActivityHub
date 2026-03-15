import React from "react";

interface EditMessageBarProps {
  editingMessage: { id: string; content: string };
  setEditingMessage: (msg: { id: string; content: string } | null) => void;
  handleEditMessage: (id: string, content: string) => void;
}

export const EditMessageBar: React.FC<EditMessageBarProps> = ({
  editingMessage,
  setEditingMessage,
  handleEditMessage,
}) => {
  return (
    <div className="px-4 py-3 bg-zinc-900/80 border-t border-zinc-800/60 flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 bg-yellow-400 rounded-full" />
          <span className="text-xs font-semibold text-yellow-400">Editing message</span>
        </div>
        <button
          onClick={() => setEditingMessage(null)}
          className="p-1 text-zinc-600 hover:text-zinc-300 rounded-lg hover:bg-zinc-800"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={editingMessage.content}
          onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleEditMessage(editingMessage.id, editingMessage.content);
            else if (e.key === "Escape") setEditingMessage(null);
          }}
          className="flex-1 bg-zinc-800 border border-zinc-700/60 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
          autoFocus
        />
        <button
          onClick={() => handleEditMessage(editingMessage.id, editingMessage.content)}
          disabled={!editingMessage.content.trim()}
          className="px-4 py-2 bg-yellow-400 text-zinc-900 rounded-xl text-sm font-bold hover:bg-yellow-300 transition-colors disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  );
};
