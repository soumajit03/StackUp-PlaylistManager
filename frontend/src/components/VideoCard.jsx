import React from "react";
import {
  Play,
  Calendar,
  BookmarkPlus,
  RotateCcw,
  Check,
  Bookmark,
} from "lucide-react";
import { formatDate } from "../utils/youtube";

const VideoCard = ({ video, onStatusChange, onPlay, index, highlight }) => {
  const hasStatus = (status) => video.status?.includes(status);

  const toggleStatus = (status) => {
    const action = hasStatus(status) ? "remove" : "add";
    onStatusChange(video.id, status, action);
  };

  // ✅ Compute visible tags (hide "unwatched" if others exist)
  const displayStatuses =
    video.status?.length > 1
      ? video.status.filter((s) => s !== "unwatched")
      : video.status || [];

  // ✅ Set background color if any meaningful tag exists
  const isTagged =
    hasStatus("watched") || hasStatus("practice") || hasStatus("saved");
  const backgroundClass = isTagged ? "bg-blue-100" : "bg-white";

  // ✅ Add highlight border if searched/jumped-to
  const highlightClass = highlight ? "ring-2 ring-yellow-400" : "";

  return (
    <div
      id={`video-${index}`}
      className={`flex items-start gap-4 p-3 rounded-xl shadow-sm border border-gray-100 relative ${backgroundClass} ${highlightClass}`}
    >
      {/* Video Index Number */}
      <div className="absolute -left-4 top-4 w-6 h-6 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center justify-center shadow">
        {index}
      </div>

      {/* Thumbnail + Tags */}
      <div className="relative group flex-shrink-0">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-40 h-24 object-cover rounded-md"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
          {video.duration}
        </div>

        {displayStatuses.length > 0 && (
          <div
            className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${
              displayStatuses.includes("watched")
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-gray-100 text-gray-700 border-gray-200"
            }`}
          >
            {displayStatuses.includes("watched") && <Check className="w-3 h-3" />}
            {displayStatuses.includes("practice") && <RotateCcw className="w-3 h-3" />}
            {displayStatuses.includes("saved") && <Bookmark className="w-3 h-3" />}
            <span>{displayStatuses.join(", ")}</span>
          </div>
        )}
      </div>

      {/* Title and Actions */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1 text-base line-clamp-2">
          {video.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {video.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span className="font-medium text-xs">{video.channelTitle}</span>
          <div className="flex items-center space-x-1 text-xs">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(video.publishedAt)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => onPlay(video)}
            className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            <Play className="w-4 h-4" />
            <span>Watch</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleStatus("practice")}
              className={`p-2 rounded-md transition-colors ${
                hasStatus("practice")
                  ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Mark for practice"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleStatus("saved")}
              className={`p-2 rounded-md transition-colors ${
                hasStatus("saved")
                  ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Save for later"
            >
              <BookmarkPlus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
