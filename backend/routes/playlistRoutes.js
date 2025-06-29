const express = require("express");
const router = express.Router();
const Playlist = require("../models/Playlist");

// Save or update playlist
router.post("/", async (req, res) => {
  const { userId, playlistId, ...rest } = req.body;
  try {
    let playlist = await Playlist.findOne({ userId, playlistId });
    if (playlist) {
      playlist.set({ ...rest });
    } else {
      playlist = new Playlist({ userId, playlistId, ...rest });
    }
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: "Failed to save playlist" });
  }
});

// Get all playlists for a user
router.get("/:userId", async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.params.userId });
    res.json(playlists);
  } catch {
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

// Update video status
router.post("/video-status", async (req, res) => {
  const { userId, playlistId, videoId, status } = req.body;
  try {
    const playlist = await Playlist.findOne({ userId, playlistId });
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    const video = playlist.videos.find((v) => v.id === videoId);
    if (video) {
      video.status = status;
    }

    await playlist.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update video status" });
  }
});

// Delete a playlist
router.delete("/:userId/:playlistId", async (req, res) => {
  try {
    await Playlist.deleteOne({
      userId: req.params.userId,
      playlistId: req.params.playlistId,
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete playlist" });
  }
});

module.exports = router;
