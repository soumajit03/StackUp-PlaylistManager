require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");

const playlistRoutes = require("./routes/playlistRoutes");

const app = express();

// ✅ FIX: allow large JSON bodies (needed for long playlists)
app.use(express.json({ limit: "10mb" }));
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// API routes
app.use("/api/playlists", playlistRoutes);

// ✅ Optional: Proxy to YouTube playlist fetch (for hiding API key from frontend)
app.get("/api/youtube/playlist", async (req, res) => {
  const { playlistId } = req.query;
  if (!playlistId) return res.status(400).json({ error: "Missing playlistId" });

  try {
    let items = [];
    let nextPageToken = undefined;

    do {
      const ytRes = await axios.get("https://www.googleapis.com/youtube/v3/playlistItems", {
        params: {
          part: "snippet",
          maxResults: 50,
          playlistId,
          key: process.env.YOUTUBE_API_KEY,
          pageToken: nextPageToken,
        },
      });

      items = items.concat(ytRes.data.items);
      nextPageToken = ytRes.data.nextPageToken;
    } while (nextPageToken);

    res.json({ items });
  } catch (err) {
    console.error("YouTube API Error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

// DB + server start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ DB connection error:", err));
