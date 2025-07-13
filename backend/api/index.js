import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import axios from 'axios';
import playlistRoutes from '../routes/playlistRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stackup')
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));

// ✅ Increase body size limits for large playlists
app.use(express.json({ 
  limit: '10mb' // Increase from default 1mb to 10mb
}));
app.use(express.urlencoded({ 
  limit: '10mb', 
  extended: true 
}));

// YouTube API route
app.get('/api/youtube/playlist', async (req, res) => {
  try {
    const { playlistId } = req.query;
    if (!playlistId) {
      return res.status(400).json({ error: 'Playlist ID is required' });
    }

    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    // Fetch playlist metadata (title, description, thumbnail, channelTitle)
    const playlistMetaRes = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
      params: {
        part: 'snippet',
        id: playlistId,
        key: API_KEY
      }
    });
    const playlistMeta = playlistMetaRes.data.items?.[0]?.snippet || {};

    // Get playlist items (videos)
    const playlistResponse = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
      params: {
        part: 'snippet',
        playlistId: playlistId,
        maxResults: 50,
        key: API_KEY
      }
    });

    const playlistItems = playlistResponse.data.items;
    if (!playlistItems || playlistItems.length === 0) {
      return res.json({
        ...playlistResponse.data,
        playlistMeta,
        items: []
      });
    }

    // Extract video IDs
    const videoIds = playlistItems
      .map(item => item.snippet.resourceId?.videoId)
      .filter(Boolean)
      .join(',');

    // Get detailed video information including thumbnails and channel data
    const videosResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'snippet,contentDetails',
        id: videoIds,
        key: API_KEY
      }
    });

    const videoDetails = videosResponse.data.items;

    // Combine playlist items with video details
    const enrichedItems = playlistItems.map(playlistItem => {
      const videoId = playlistItem.snippet.resourceId?.videoId;
      const videoDetail = videoDetails.find(v => v.id === videoId);

      return {
        ...playlistItem,
        snippet: {
          ...playlistItem.snippet,
          // Override with detailed video data if available
          thumbnails: videoDetail?.snippet?.thumbnails || playlistItem.snippet.thumbnails,
          channelTitle: videoDetail?.snippet?.channelTitle || playlistItem.snippet.channelTitle,
          videoOwnerChannelTitle: videoDetail?.snippet?.channelTitle || playlistItem.snippet.videoOwnerChannelTitle,
          // Add duration from video details
          duration: videoDetail?.contentDetails?.duration
        }
      };
    });

    // Attach playlist metadata to response for frontend use
    res.json({
      ...playlistResponse.data,
      playlistMeta,
      items: enrichedItems
    });

  } catch (error) {
    console.error('YouTube API error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch playlist from YouTube',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Routes
app.use('/api/playlists', playlistRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

export default app;