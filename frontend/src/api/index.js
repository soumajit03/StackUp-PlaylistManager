import axios from "axios";

// Create the Axios instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Retry failed requests once if it's a network error and NOT in development
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (
      error.code === "ERR_NETWORK" &&
      !config._retry &&
      !import.meta.env.DEV
    ) {
      config._retry = true;
      console.warn("🔁 Retrying request due to network error...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return instance(config);
    }

    console.error("❌ Axios error:", error.message);
    return Promise.reject(error);
  }
);

export default instance;
