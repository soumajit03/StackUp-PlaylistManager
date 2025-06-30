import React from "react";

const VideoPlayer = ({ video, onClose, onStatusChange }) => {
  if (!video) return null;

  const hasStatus = (status) => video.status?.includes(status);

  const handleToggleWatched = () => {
    const action = hasStatus("watched") ? "remove" : "add";
    onStatusChange(video.id, "watched", action);
    onClose(); // optional
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-white rounded-lg overflow-hidden shadow-xl w-full max-w-3xl relative">
        <div className="flex justify-end p-2">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">
            ✕
          </button>
        </div>

        <iframe
          className="w-full aspect-video"
          src={`https://www.youtube.com/embed/${video.id}`}
          frameBorder="0"
          allowFullScreen
          title={video.title}
        ></iframe>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            {video.index && (
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                #{video.index}
              </span>
            )}
<h2 className="text-xl font-semibold">
  #{video.index}. {video.title}
</h2>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleToggleWatched}
              className={`px-4 py-2 rounded-lg text-sm ${
                hasStatus("watched")
                  ? "bg-gray-300 text-gray-800 hover:bg-gray-400"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {hasStatus("watched") ? "Mark as Unwatched" : "Mark as Watched"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
