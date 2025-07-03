import React, { useState, useEffect, useMemo, useRef } from "react";
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
  const [highlightVideoIndex, setHighlightVideoIndex] = useState(null);
  const videosPerPage = 8;

  const listRef = useRef(null);

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

  useEffect(() => {
    setCurrentVideoPage(1);
    setHighlightVideoIndex(null);
  }, [selectedPlaylist, filter]);

  const counts = useMemo(() => {
    const videos = selectedPlaylist?.videos || [];
    return {
      all: videos.length,
      unwatched: videos.filter((v) => !v.status?.includes("watched")).length,
      watched: videos.filter((v) => v.status?.includes("watched")).length,
      practice: videos.filter((v) => v.status?.includes("practice")).length,
      saved: videos.filter((v) => v.status?.includes("saved")).length,
    };
  }, [selectedPlaylist]);

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
      alert("Failed to save playlist: " + (err.response?.data?.error || err.message));
    }
  };

  const handleStatusChange = async (videoId, status, action = "add") => {
    try {
      await axios.post("/api/playlists/video-status", {
        userId: user.id,
        playlistId: selectedPlaylist.playlistId,
        videoId,
        status,
        action,
      });

      const updatedVideos = selectedPlaylist.videos.map((v) => {
        if (v.id !== videoId) return v;
        let updatedStatus = Array.isArray(v.status) ? [...v.status] : [];
        if (action === "add" && !updatedStatus.includes(status)) {
          updatedStatus.push(status);
        } else if (action === "remove") {
          updatedStatus = updatedStatus.filter((s) => s !== status);
        }
        return { ...v, status: updatedStatus };
      });

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

  const filteredVideos = selectedPlaylist?.videos?.filter((v) => {
    if (filter === "all") return true;
    return v.status?.includes(filter);
  }) || [];

  const totalVideoPages = Math.ceil(filteredVideos.length / videosPerPage);

  const paginatedVideos = filteredVideos
    .slice((currentVideoPage - 1) * videosPerPage, currentVideoPage * videosPerPage)
    .map((video) => {
      const globalIndex = selectedPlaylist.videos.findIndex(v => v.id === video.id);
      return { ...video, globalIndex: globalIndex + 1 };
    });

  const handleJumpToIndex = (index) => {
    const page = Math.ceil(index / videosPerPage);
    setCurrentVideoPage(page);
    setHighlightVideoIndex(index);
    setTimeout(() => {
      if (listRef.current) {
        const el = listRef.current.querySelector(`#video-${index}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 300);
  };

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
              <PlaylistHeader
  playlist={selectedPlaylist}
  onJumpToVideo={(index) => {
    const page = Math.ceil(index / videosPerPage);
    setCurrentVideoPage(page);
    setTimeout(() => {
      const el = document.getElementById(`video-${index}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    setHighlightedIndex(index);
  }}
/>

              <FilterTabs
                activeFilter={filter}
                onFilterChange={setFilter}
                counts={counts}
              />
              <div className="flex flex-col gap-4" ref={listRef}>
                {paginatedVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    index={video.globalIndex}
                    video={video}
                    highlight={video.globalIndex === highlightVideoIndex}
                    onStatusChange={handleStatusChange}
                    onPlay={() => setVideoToPlay({ ...video, index: video.globalIndex })}
                  />
                ))}
              </div>

              {totalVideoPages > 1 && (
                <div className="flex justify-center items-center gap-6 mt-4">
                  <button
                    onClick={() => setCurrentVideoPage((p) => Math.max(1, p - 1))}
                    disabled={currentVideoPage === 1}
                    className="px-4 py-2 text-sm font-medium bg-gray-200 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentVideoPage} of {totalVideoPages}
                  </span>
                  <button
                    onClick={() => setCurrentVideoPage((p) => Math.min(totalVideoPages, p + 1))}
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

      <VideoPlayer
        video={videoToPlay}
        onClose={() => setVideoToPlay(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default App;
