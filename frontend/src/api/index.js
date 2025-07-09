import axios from "axios";

// Create the Axios instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Retry failed requests on network errors (e.g., 502 on cold start)
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Retry only once
    if (
      error.code === "ERR_NETWORK" &&
      !config._retry &&
      !import.meta.env.DEV // avoid retry in dev to prevent confusion
    ) {
      config._retry = true;
      console.warn("🔁 Retrying request due to network error...");
      await new Promise((resolve) => setTimeout(resolve, 1500)); // wait 1.5 sec
      return instance(config);
    }

    // Log other errors
    console.error("❌ Axios error:", error.message);
    return Promise.reject(error);
  }
);

export default instance;
