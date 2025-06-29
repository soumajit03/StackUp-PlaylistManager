import React from "react";

const VideoPlayer = ({ video, onClose, onStatusChange }) => {
  if (!video) return null;

  const handleMarkWatched = () => {
    onStatusChange(video.id, "watched");
    onClose();
  };

  const handleMarkUnwatched = () => {
    onStatusChange(video.id, "unwatched");
    onClose();
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
          <h2 className="text-xl font-semibold">{video.title}</h2>

          <div className="flex gap-4">
            <button
              onClick={handleMarkWatched}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              Mark as Watched
            </button>
            <button
              onClick={handleMarkUnwatched}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 text-sm"
            >
              Mark as Unwatched
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
