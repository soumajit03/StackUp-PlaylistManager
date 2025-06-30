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
      // ✅ Normalize each video's status as array if needed
      if (Array.isArray(rest.videos)) {
        rest.videos = rest.videos.map(video => ({
          ...video,
          status: Array.isArray(video.status)
            ? video.status
            : video.status
            ? [video.status]
            : [],
        }));
      }

      playlist = new Playlist({ userId, playlistId, ...rest });
    }
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: "Failed to save playlist" });
  }
});

// Get all playlists for a user
router.get("/:userId", async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.params.userId });

    // ✅ Ensure all video statuses are arrays (for old documents)
    playlists.forEach(p => {
      p.videos.forEach(v => {
        if (!Array.isArray(v.status)) {
          v.status = v.status ? [v.status] : [];
        }
      });
    });

    res.json(playlists);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

// ✅ Update video status with add/remove support and 'unwatched' cleanup
router.post("/video-status", async (req, res) => {
  const { userId, playlistId, videoId, status, action } = req.body;

  try {
    const playlist = await Playlist.findOne({ userId, playlistId });
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    const video = playlist.videos.find(v => v.id === videoId);
    if (!video) return res.status(404).json({ error: "Video not found" });

    // Ensure status is always an array
    if (!Array.isArray(video.status)) {
      video.status = video.status ? [video.status] : [];
    }

    if (action === "add") {
      // ✅ Remove 'unwatched' when adding any other status
      if (status !== "unwatched") {
        video.status = video.status.filter(s => s !== "unwatched");
      }

      if (!video.status.includes(status)) {
        video.status.push(status);
      }
    } else if (action === "remove") {
      video.status = video.status.filter(s => s !== status);
    }

    await playlist.save();
    res.json({ success: true, video });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: err.message });
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
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete playlist" });
  }
});

module.exports = router;
