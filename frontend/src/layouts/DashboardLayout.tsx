import { Outlet } from "react-router-dom";
import SideBar from "./dashboard/SideBar";
import NavBar from "./dashboard/NavBar";
import { useEffect } from "react";
import { socketService } from "../Service/socket.service";
import { useCategories } from "../features/activity/hooks/useCategories";
import { useAuthContext } from "../features/auth/context/AuthProvider";
import { NotificationProvider } from "../features/notification/context/NotificationContext";

export default function DashboardLayout() {
    const { user, loading } = useAuthContext();

    useEffect(() => {
        socketService.connect();
        return () => { socketService.disconnect(); };
    }, []);

    useCategories();


    return (
        <NotificationProvider userId={user?.sub}>
            <SideBar />
            <div className="md:ml-64 flex flex-col bg-[#1a1a1a] min-h-screen">
                <div className="mb-16">
                    <NavBar/ >
                </div>
                <main>
                    <Outlet />
                </main>
            </div>
        </NotificationProvider>
    );
}

