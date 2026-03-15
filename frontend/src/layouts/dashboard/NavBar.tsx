
import { Bell, Plus, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useEffect, useState } from "react";
import api from "../../features/auth/hooks/axiosConfig";
import NotificationBell from "../../features/notification/components/NotificationBell";


export default function NavBar() {
  const notificationCount = 3;
	const [profile, setProfile] = useState<any>(null)
	const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

	useEffect(() => {
		const fetchProfile = async () => {
			setProfile(null)
			setError(null) 
			try {
				let res;
					res = await api.get('https://localhost/api/users/profile', {withCredentials: true });	
				if (!res.data) {
					setError('User not found')
				} else {
					setProfile(res.data)
				}
			} catch (err: any) {
				if (err.response?.status === 404) {
					setError('User not found')
				} else {
					setError('Something went wrong')
				}
				console.error(err)}
		}
		fetchProfile()
	}, [])

  const handleLogout = async () => {
    try {
      await logout();       
      navigate("/"); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* ================= DESKTOP NAV ================= */}
      <nav
        className="hidden md:flex fixed top-0 left-64 right-0 h-16
        items-center justify-end px-6
        bg-[#141414] backdrop-blur-xl
        border-b border-white/5 shadow-lg z-20"
      >
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <NotificationBell />

          {/* Profile */}
          <NavLink
            to="/dashboard/profile"
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl
            hover:bg-white/10 transition"
          >
            <img
              src={`https://localhost${profile?.profileImage}`}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20"
            />
            <span className="hidden lg:block text-sm text-gray-200 font-medium">
              {profile ? `${profile.Firstname} ${profile.Lastname}` : "User"}
            </span>
          </NavLink>

          {/* Logout */}
      <button
        onClick={handleLogout}
        aria-label="Logout"
        className="p-2 rounded-xl
        text-gray-400 hover:text-red-500
        hover:bg-red-500/10 transition"
      >
        <LogOut className="w-4 h-4" />
      </button>
        </div>
      </nav>

      {/* ================= MOBILE NAV ================= */}
      <nav
        className="md:hidden fixed top-0 left-0 right-0 h-16
        flex items-center justify-between px-4
        bg-[#141414]/90 backdrop-blur-xl
        border-b border-white/10 shadow-md z-20"
      >
        {/* Left actions */}
        <NotificationBell />


        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Add
          <NavLink
            to='/dashboard/activity/create'
            className="flex items-center justify-center
            w-10 h-10 rounded-xl
            bg-[#FFC107]/15 text-[#FFC107]
            active:scale-95 transition"
          >
            <Plus className="w-5 h-5" />
          </NavLink> */}

          {/* Logout */}
      <button
        onClick={handleLogout}
        aria-label="Logout"
        className="p-2 rounded-xl
        text-gray-400 hover:text-red-500
        hover:bg-red-500/10 transition"
      >
        <LogOut className="w-4 h-4" />
      </button>
        </div>
      </nav>
    </>
  );
}
