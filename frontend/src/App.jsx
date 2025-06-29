import React, { useState, useEffect, useMemo } from "react";
import { RedirectToSignIn, useUser } from "@clerk/clerk-react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import PlaylistInput from "./components/PlaylistInput";
import FilterTabs from "./components/FilterTabs";
import PlaylistHeader from "./components/PlaylistHeader";
import VideoCard from "./components/VideoCard";
import VideoPlayer from "./components/VideoPlayer";
import axios from "./api";

const App = () => {
  const { user } = useUser();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [filter, setFilter] = useState("all");
  const [videoToPlay, setVideoToPlay] = useState(null);

  const [currentVideoPage, setCurrentVideoPage] = useState(1);
  const videosPerPage = 8;

  // ✅ Fetch playlists and auto-select first one if available
  useEffect(() => {
    if (user?.id) {
      axios.get(`/api/playlists/${user.id}`).then((res) => {
        const data = res.data || [];
        setPlaylists(data);

        if (data.length > 0 && !selectedPlaylist) {
          setSelectedPlaylist(data[0]);
        }
      });
    }
  }, [user, selectedPlaylist]);

  // ✅ Reset pagination on filter/playlist change
  useEffect(() => {
    setCurrentVideoPage(1);
  }, [selectedPlaylist, filter]);

  // ✅ Count videos by status
  const counts = useMemo(() => {
    const videos = selectedPlaylist?.videos || [];
    return {
      all: videos.length,
      unwatched: videos.filter((v) => v.status === "unwatched").length,
      watched: videos.filter((v) => v.status === "watched").length,
      practice: videos.filter((v) => v.status === "practice").length,
      saved: videos.filter((v) => v.status === "saved").length,
    };
  }, [selectedPlaylist]);

  // ✅ Save playlist to DB and UI
  const handleSavePlaylist = async (playlist) => {
    try {
      const playlistWithUser = { ...playlist, userId: user.id };
      const res = await axios.post("/api/playlists", playlistWithUser);

      setPlaylists((prev) => [
        ...prev.filter((p) => p.playlistId !== playlist.playlistId),
        res.data,
      ]);
      setSelectedPlaylist(res.data);
    } catch (err) {
      console.error("❌ Failed to save playlist:", err);
      alert(
        "Failed to save playlist: " + (err.response?.data?.error || err.message)
      );
    }
  };

  // ✅ Update video status
  const handleStatusChange = async (videoId, status) => {
    try {
      await axios.post("/api/playlists/video-status", {
        userId: user.id,
        playlistId: selectedPlaylist.playlistId,
        videoId,
        status,
      });

      const updatedVideos = selectedPlaylist.videos.map((v) =>
        v.id === videoId ? { ...v, status } : v
      );

      const updatedPlaylist = {
        ...selectedPlaylist,
        videos: updatedVideos,
      };

      setSelectedPlaylist({ ...updatedPlaylist });

      setPlaylists((prev) =>
        prev.map((p) =>
          p.playlistId === updatedPlaylist.playlistId ? updatedPlaylist : p
        )
      );
    } catch (err) {
      console.error("❌ Failed to update video status:", err);
    }
  };

  if (!user) return <RedirectToSignIn />;

  // ✅ Filter and paginate videos
  const filteredVideos = selectedPlaylist?.videos?.filter(
    (v) => filter === "all" || v.status === filter
  ) || [];

  const totalVideoPages = Math.ceil(filteredVideos.length / videosPerPage);
  const paginatedVideos = filteredVideos.slice(
    (currentVideoPage - 1) * videosPerPage,
    currentVideoPage * videosPerPage
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar
          playlists={playlists}
          selectedPlaylist={selectedPlaylist}
          onSelect={setSelectedPlaylist}
          onDelete={async (playlistId) => {
            await axios.delete(`/api/playlists/${user.id}/${playlistId}`);
            setPlaylists((p) => p.filter((p) => p.playlistId !== playlistId));
            setSelectedPlaylist(null);
          }}
        />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <PlaylistInput onSave={handleSavePlaylist} />
          {selectedPlaylist && (
            <>
              <PlaylistHeader playlist={selectedPlaylist} />
              <FilterTabs
                activeFilter={filter}
                onFilterChange={setFilter}
                counts={counts}
              />
              <div className="flex flex-col gap-4">
                {paginatedVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onStatusChange={handleStatusChange}
                    onPlay={() => setVideoToPlay(video)}
                  />
                ))}
              </div>

              {/* ✅ Pagination controls */}
              {totalVideoPages > 1 && (
                <div className="flex justify-center items-center gap-6 mt-4">
                  <button
                    onClick={() =>
                      setCurrentVideoPage((p) => Math.max(1, p - 1))
                    }
                    disabled={currentVideoPage === 1}
                    className="px-4 py-2 text-sm font-medium bg-gray-200 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentVideoPage} of {totalVideoPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentVideoPage((p) =>
                        Math.min(totalVideoPages, p + 1)
                      )
                    }
                    disabled={currentVideoPage === totalVideoPages}
                    className="px-4 py-2 text-sm font-medium bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ✅ Video Player Modal */}
      <VideoPlayer
        video={videoToPlay}
        onClose={() => setVideoToPlay(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default App;
