import React, { useState } from "react";
import axios from "../api";
import { useUser } from "@clerk/clerk-react";
import { formatDuration } from "../utils/youtube";

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
      const meta = res.data.playlistMeta || {};
      if (!items || items.length === 0) {
        throw new Error("No videos found or invalid playlist");
      }

      console.log("Fetched items from YouTube:", items);

      const videos = items.map((item) => {
        // Changed: Ensure proper channel title fallback for each video
        const channelTitle =
          item.snippet.videoOwnerChannelTitle ||
          item.snippet.channelTitle ||
          "No Channel Found";
        // Changed: Use only the video's own thumbnails
        const thumbnails = item.snippet.thumbnails || {};
        const thumbnail =
          thumbnails.maxres?.url ||
          thumbnails.standard?.url ||
          thumbnails.high?.url ||
          thumbnails.medium?.url ||
          thumbnails.default?.url ||
          "/default-thumbnail.jpg";

        return {
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail,
          channelTitle,
          publishedAt: item.snippet.publishedAt,
          duration: formatDuration(item.snippet.duration),
          status: "unwatched",
          notes: "",
        };
      });

      // Changed: Correctly determine playlist thumbnail and channel title for the main playlist header
      const playlistMetaThumbnails = meta.thumbnails || {};
      const firstVideoThumbnails = items[0]?.snippet?.thumbnails || {};
      const playlistThumbnail =
        playlistMetaThumbnails.maxres?.url ||
        playlistMetaThumbnails.standard?.url ||
        playlistMetaThumbnails.high?.url ||
        playlistMetaThumbnails.medium?.url ||
        playlistMetaThumbnails.default?.url ||
        firstVideoThumbnails.maxres?.url ||
        firstVideoThumbnails.standard?.url ||
        firstVideoThumbnails.high?.url ||
        firstVideoThumbnails.medium?.url ||
        firstVideoThumbnails.default?.url ||
        "/default-thumbnail.jpg";

      const playlistChannelTitle =
        meta.channelTitle ||
        items[0]?.snippet?.videoOwnerChannelTitle ||
        items[0]?.snippet?.channelTitle ||
        "No Channel Found";

      const playlist = {
        userId: user.id,
        playlistId,
        title: meta.title || items[0]?.snippet?.title || "Untitled",
        description: meta.description || "",
        thumbnail: playlistThumbnail,
        channelTitle: playlistChannelTitle,
        videoCount: items.length,
        videos,
      };

      console.log("Saving playlist to backend:", playlist);

      await onSave(playlist);
      setUrl("");
    } catch (err) {
      console.error("Failed to import playlist:", err);

      // ✅ Handle specific error cases
      if (err.response?.status === 413) {
        alert(
          "Playlist is too large to import. Try importing a smaller playlist or contact support."
        );
      } else {
        alert(
          "Failed to import playlist: " +
            (err.response?.data?.error || err.message)
        );
      }
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

