import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost/api",
  withCredentials: true,
});

export default api;

api.interceptors.response.use(
  (response :any) => response,
  async (error : any) => {
    const originalRequest = error.config;


    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {


        await api.post("/auth/refresh");

        return api(originalRequest);
      } catch (refreshError) {
        const currentURL = window.location.pathname;
        if (currentURL !== '/') {
          window.location.href = "/";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
