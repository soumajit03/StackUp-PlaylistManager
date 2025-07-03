import React, { useState } from 'react';
import { Users, Video } from 'lucide-react';

const PlaylistHeader = ({ playlist, onJumpToVideo }) => {
  const total = playlist.videos?.length || 0;
  const watched = playlist.videos?.filter(v => v.status?.includes("watched")).length || 0;
  const percent = total > 0 ? Math.round((watched / total) * 100) : 0;

  const [videoIndexInput, setVideoIndexInput] = useState("");

  const handleJump = () => {
    const index = parseInt(videoIndexInput);
    if (!isNaN(index) && index >= 1 && index <= total) {
      onJumpToVideo(index);
    } else {
      alert("Enter a valid video number between 1 and " + total);
    }
  };

  const handleContinue = () => {
    const watchedIndices = playlist.videos
      .map((v, i) => v.status?.includes("watched") ? i : -1)
      .filter(i => i !== -1);

    const nextIndex = watchedIndices.length > 0
      ? watchedIndices[watchedIndices.length - 1] + 2 // +1 to go next, +1 for 1-based index
      : 1;

    if (nextIndex > total) {
      alert("🎉 You've completed the playlist!");
    } else {
      onJumpToVideo(nextIndex);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start space-x-6">
        <img
          src={playlist.thumbnail}
          alt={playlist.title}
          className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {playlist.title}
          </h1>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {playlist.description}
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{playlist.channelTitle}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Video className="w-4 h-4" />
              <span>{playlist.videoCount || playlist.videos.length} videos</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-green-700">
                {percent}% Watched
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Jump to video #"
              value={videoIndexInput}
              onChange={(e) => setVideoIndexInput(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm w-40"
            />
            <button
              onClick={handleJump}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Go
            </button>
            <button
              onClick={handleContinue}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistHeader;
