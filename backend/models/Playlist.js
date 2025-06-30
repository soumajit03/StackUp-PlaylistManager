const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  thumbnail: String,
  duration: String,
  channelTitle: String,
  publishedAt: String,
  status: [String],
  notes: String,
});

const playlistSchema = new mongoose.Schema({
  userId: String,
  playlistId: String,
  title: String,
  description: String,
  thumbnail: String,
  channelTitle: String,
  videoCount: Number,
  videos: [videoSchema],
});

module.exports = mongoose.model("Playlist", playlistSchema);
