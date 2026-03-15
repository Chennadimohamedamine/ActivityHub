import { Users as UsersIcon } from 'lucide-react';

const categoryStyles: Record<string, string> = {
  sports: 'bg-green-500/50 text-white font-bold border-green-400/40',
  outdoors: 'bg-emerald-500/50 text-white font-bold border-emerald-400/40', 
  social: 'bg-amber-500/50 text-white font-bold border-amber-400/40', 
  tech: 'bg-blue-500/50 text-white font-bold border-blue-400/40', 
  arts: 'bg-fuchsia-500/60 text-white font-bold border-fuchsia-400/40', 
  music: 'bg-violet-500/50 text-white font-bold border-violet-400/40',
  fitness: 'bg-rose-500/50 text-white font-bold border-rose-400/40', 
  gaming: 'bg-indigo-500/50 text-white font-bold border-indigo-400/40', 
  learning: 'bg-cyan-500/50 text-white font-bold border-cyan-400/40', 
  networking: 'bg-orange-500/50 text-white font-bold border-orange-400/40',
  default: 'bg-gray-500/50 text-white font-bold border-gray-400/40', 
};

export function CategoryBadge({ category }: { category: string }) {
  const style = categoryStyles[category] || categoryStyles['Default'];

  return (
    <span
      className={`
        px-3 h-5 
        text-xs font-md tracking-wide  rounded-full capitalize
         border backdrop-blur-md text-black flex items-center
        ${style}
      `}
    >
      # {category || 'General'}
    </span>
  );
}

// resubale 
export function ParticipantsCount({ count }: { count: number }) {
  const isEmpty = count === 0;
  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border border-dashed border-gray-600/50 ${isEmpty ? 'text-gray-400' : 'bg-[#1f1f1f] text-gray-100'}`}
    >
      <UsersIcon className="w-3.5 h-3.5" />
      {isEmpty ? 'Be the first to join' : `${count} ${count === 1 ? 'person' : 'people'} joined`}
    </div>
  );
}
