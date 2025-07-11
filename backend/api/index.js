const serverless = require("serverless-http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");

const Playlist = require("../models/Playlist");
const playlistRoutes = require("../routes/playlistRoutes");

dotenv.config();

const app = express();

// ✅ CORS Setup
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://stackup-frontend-ten.vercel.app"
];

app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Test route to verify Vercel function is working
app.get("/", (req, res) => {
  res.send("✅ Playlist Manager Backend is Live via Vercel Function");
});

// ✅ All Playlist routes
app.use("/api/playlists", playlistRoutes);

// ✅ YouTube Proxy Route
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

// ✅ Connect to MongoDB once (outside the function)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo connection failed:", err));

// ✅ Export for Vercel Serverless
module.exports = serverless(app);
