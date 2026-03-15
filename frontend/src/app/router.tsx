
import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import HomePage from "../features/public/pages/HomePage";
import ExplorePage from "../features/activity/pages/ExplorePage";
import ChatPage from "../features/chat/pages/ChatPage";
import SavedActivityPage from "../features/activity/pages/SavedActivityPage";
import NotificationPage from "../features/notification/pages/NotificationPage";
import ProfilePage from "../features/user/ProfilePage";
import NotFoundPage from "../layouts/NotFoundPage";
import Feed from "../features/activity/pages/FeedPage";
import Dashboard from "../dashboard/dashboard";
import PrivacyPolicy from "../layouts/privacy-policy";
import TermsOfService from "../layouts/Termsofservice";
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/terms-of-service",
        element: <TermsOfService />,
      }
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "explore", element: <ExplorePage /> },
      { path: "feed", element: <Feed /> },
      { path: "chat", element: <ChatPage /> },
      { path: "activity/saved", element: <SavedActivityPage /> },
      { path: "notifications", element: <NotificationPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "profile/:username", element: <ProfilePage /> },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);