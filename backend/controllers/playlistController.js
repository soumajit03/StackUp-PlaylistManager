const Playlist = require('../models/Playlist');

// Save or update a playlist for a user
exports.savePlaylist = async (req, res) => {
    try {
        const { userId, playlistId, title, description, thumbnail, channelTitle, videoCount, videos } = req.body;
        if (!userId || !playlistId || !Array.isArray(videos)) {
            return res.status(400).json({ error: 'userId, playlistId, and videos are required.' });
        }
        const update = { userId, playlistId, title, description, thumbnail, channelTitle, videoCount, videos };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const playlist = await Playlist.findOneAndUpdate(
            { userId, playlistId },
            { $set: update },
            options
        );
        res.status(201).json(playlist.toObject());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all playlists for a user
exports.getUserPlaylists = async (req, res) => {
    try {
        const { userId } = req.params;
        const playlists = await Playlist.find({ userId });
        res.json(playlists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update video status in a playlist for a user
exports.updateVideoStatus = async (req, res) => {
    try {
        const { userId, playlistId, videoId, status } = req.body;
        if (!userId || !playlistId || !videoId || !status) {
            return res.status(400).json({ error: 'userId, playlistId, videoId, and status are required.' });
        }
        const playlist = await Playlist.findOne({ userId, playlistId });
        if (!playlist) return res.status(404).json({ error: 'Playlist not found.' });
        const video = playlist.videos.find(v => v.id === videoId);
        if (!video) return res.status(404).json({ error: 'Video not found.' });
        video.status = status;
        await playlist.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a playlist for a user
exports.deletePlaylist = async (req, res) => {
    try {
        const { userId, playlistId } = req.params;
        const result = await Playlist.findOneAndDelete({ userId, playlistId });
        if (!result) {
            return res.status(404).json({ error: 'Playlist not found.' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
