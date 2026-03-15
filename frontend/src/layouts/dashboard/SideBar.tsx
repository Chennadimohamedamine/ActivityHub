import PostModal from "../../features/activity/components/activity-creation/PostModal";
import { NavLink } from "react-router-dom";
import { 
  Home as HomeIcon, 
  Compass as ExploreIcon,
  MessageCircle as ChatIcon, 
  Plus as CreateIcon, 
  Bell, 
  Bookmark, 
} from "lucide-react"; 
import { useState } from "react";

const mockData = {
  user: {
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop",
  }
};

type NavItemProps = {
  name: string;
  to: string;
  icon: React.ReactNode;
};

function NavItem({ name, to, icon }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `group flex items-center gap-4 px-4 py-3 mx-3 rounded-xl font-medium text-sm transition-all duration-300
        ${isActive 
            ? 'text-gray-200 bg-gradient-to-r from-[#F59E0B]/15 to-transparent' 
            : 'text-gray-400 hover:bg-neutral-800/50 hover:text-gray-300'
        }`
    }
    >
      <span className={`transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </span>
      <span className="tracking-wide">{name}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <>
      <PostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Desktop */}
      <aside className="hidden fixed md:flex flex-col h-screen w-64 bg-[#141414] border-r border-neutral-800/50 z-50">
        
        <div className="flex flex-col items-start mt-8 px-8 mb-6">
          <a href="/dashboard" className="text-amber-500 font-extrabold text-2xl tracking-tight">
              Activity Hub<span className="text-white"></span>
          </a>
          <p className="text-neutral-500 text-xs italic mt-1">Join in and Be part of it.</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col w-full h-full overflow-y-auto">
          <nav className="flex flex-col gap-1 mt-2 w-full">
            <div className="text-[10px] font-bold text-neutral-600 px-7 mt-4 mb-2 tracking-widest uppercase">
              General
            </div>
            
            <NavItem name="Feed" to="/dashboard/feed" icon={<HomeIcon className="w-5 h-5" />} />
            <NavItem name="Explore" to="/dashboard/explore" icon={<ExploreIcon className="w-5 h-5" />} />
            <NavItem name="Chat" to="/dashboard/chat" icon={<ChatIcon className="w-5 h-5" />} />
            
            <button
              onClick={toggleModal}
              className="group flex items-center gap-4 px-4 py-3 mx-3 rounded-xl font-medium text-sm text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300 transition-all duration-300 text-left"
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                <CreateIcon className="w-5 h-5 text-amber-500" />
              </span>
              <span className="tracking-wide">Create</span>
            </button>

            <div className="text-[10px] font-bold text-neutral-600 px-7 mt-6 mb-2 tracking-widest uppercase">
              Other
            </div>
            <NavItem name="Saved" to="/dashboard/activity/saved" icon={<Bookmark className="w-5 h-5" />} />
          </nav>
        </div>
      </aside>

      {/* Mobile */}
      <aside className="fixed md:hidden bottom-0 w-full h-16 bg-[#121212] flex items-center justify-around border-t border-neutral-800 z-40 px-2 pb-safe">
        
        <NavLink to="/dashboard/feed" className={({isActive}) => `p-2.5 rounded-xl transition-all duration-300 ${isActive ? "text-orange-300" : "text-neutral-500 hover:text-neutral-300"}`}>
          <HomeIcon className="w-6 h-6" />
        </NavLink>
        
        <NavLink to="/dashboard/explore" className={({isActive}) => `p-2.5 rounded-xl transition-all duration-300 ${isActive ? "text-orange-300" : "text-neutral-500 hover:text-neutral-300"}`}>
          <ExploreIcon className="w-6 h-6" />
        </NavLink>
        
        <button 
            onClick={toggleModal} 
            className="relative p-3.5 rounded-full active:scale-90 transition-all"
        >
          <CreateIcon className="w-8 h-8 text-neutral-500" />
        </button>

        <NavLink to="/dashboard/chat" className={({isActive}) => `p-2.5 rounded-xl transition-all duration-300 ${isActive ? "text-orange-300" : "text-neutral-500 hover:text-neutral-300"}`}>
          <ChatIcon className="w-6 h-6" />
        </NavLink>

        <NavLink to="/dashboard/activity/saved" className={({isActive}) => `p-2.5 rounded-xl transition-all duration-300 ${isActive ? "text-orange-300" : "text-neutral-500 hover:text-neutral-300"}`}>
          <Bookmark className="w-6 h-6" />
        </NavLink>
        
        <NavLink to="/dashboard/profile" className={({isActive}) => `p-1 rounded-full transition-all duration-300 ${isActive ? "ring-2 ring-orange-300 ring-offset-2 ring-offset-[#121212]" : "opacity-80 hover:opacity-100"}`}>
          <img 
            src={mockData.user.image} 
            alt="profile" 
            className="w-8 h-8 rounded-full object-cover border border-neutral-800" 
          />
        </NavLink>
      </aside>
    </>
  );
}