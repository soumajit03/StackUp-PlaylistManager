import React, { useState } from "react";
import axios from "../api";
import { useUser } from "@clerk/clerk-react";

const PlaylistInput = ({ onSave }) => {
  const { user } = useUser();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const extractId = (url) => {
    try {
      const u = new URL(url);
      const listId = u.searchParams.get("list");
      return listId || null;
    } catch {
      return null;
    }
  };

  const handleImport = async () => {
    const playlistId = extractId(url);
    if (!playlistId) return alert("Invalid YouTube playlist URL");

    setLoading(true);

    try {
      // Call backend instead of YouTube API directly
      const res = await axios.get("/api/youtube/playlist", {
        params: { playlistId },
      });

      const items = res.data.items;
      if (!items || items.length === 0) {
        throw new Error("No videos found or invalid playlist");
      }

      console.log("Fetched items from YouTube:", items);

      const videos = items.map((item) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.videoOwnerChannelTitle,
        publishedAt: item.snippet.publishedAt,
        status: "unwatched",
        notes: "",
      }));

      const playlist = {
        userId: user.id,
        playlistId,
        title: items[0]?.snippet?.title || "Untitled",
        description: "",
        thumbnail: items[0]?.snippet?.thumbnails?.medium?.url || "",
        channelTitle: items[0]?.snippet?.videoOwnerChannelTitle || "",
        videoCount: videos.length,
        videos,
      };

      console.log("Saving playlist to backend:", playlist);

      await onSave(playlist);
      setUrl("");
    } catch (err) {
      console.error("Failed to import playlist:", err);
      alert("Failed to import playlist: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste YouTube playlist URL..."
        className="w-full px-4 py-3 border rounded-lg"
      />
      <button
        onClick={handleImport}
        disabled={loading}
        className="bg-red-600 text-white px-5 py-3 rounded-lg hover:bg-red-700 transition"
      >
        {loading ? "Importing..." : "Import"}
      </button>
    </div>
  );
};

export default PlaylistInput;
    
