import React, { useState } from "react";
import { Trash } from "lucide-react";

const Sidebar = ({
  playlists = [],
  selectedPlaylist = null,  // ✅ Accept selected playlist
  onSelect = () => {},
  onDelete = () => {},
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginated = playlists.slice(startIdx, endIdx);
  const totalPages = Math.ceil(playlists.length / itemsPerPage);

  // ✅ Helper to calculate watched % properly
  const getCompletion = (playlist) => {
    const total = playlist.videos?.length || 0;
    const watched = playlist.videos?.filter((v) => v.status === "watched").length || 0;

    if (total === 0) return "0% Watched";
    const percent = Math.round((watched / total) * 100);
    return `${percent}% Watched`;
  };

  return (
    <aside className="w-64 bg-white border-r p-4 space-y-4 max-h-screen overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">My Playlists</h2>

      {paginated.length === 0 ? (
        <p className="text-gray-500 text-sm">No playlists yet.</p>
      ) : (
        <ul className="space-y-2">
          {paginated.map((playlist) => {
            const isActive = selectedPlaylist?.playlistId === playlist.playlistId;
            return (
              <li
                key={playlist.playlistId}
                className={`flex items-start justify-between rounded-lg p-3 cursor-pointer transition
                  ${isActive
                    ? "bg-green-50 border border-green-300"
                    : "bg-gray-50 hover:bg-gray-100 border border-transparent"}`}
              >
                <div
                  className="flex-1 overflow-hidden"
                  onClick={() => onSelect(playlist)}
                >
                  <p className="font-medium text-sm truncate">
                    {playlist.title}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    {playlist.channelTitle}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {getCompletion(playlist)}
                  </p>
                </div>

                <button
                  onClick={() => onDelete(playlist.playlistId)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* ✅ Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-sm mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="text-blue-600 disabled:text-gray-400"
          >
            Prev
          </button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="text-blue-600 disabled:text-gray-400"
          >
            Next
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
