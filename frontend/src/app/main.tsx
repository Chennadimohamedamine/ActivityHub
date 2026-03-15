import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router"; 

import { AuthProvider } from "../features/auth/context/AuthProvider";

import "./index.css";
import { Query, QueryClient, QueryClientProvider } from "@tanstack/react-query";


ReactDOM.createRoot(document.getElementById("root")!).render(

  <AuthProvider>
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </AuthProvider>
);