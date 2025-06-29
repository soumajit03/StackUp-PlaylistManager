import React from 'react';
import {
  Play,
  Calendar,
  BookmarkPlus,
  RotateCcw,
  Check,
  Bookmark,
} from 'lucide-react';
import { formatDate } from '../utils/youtube';

const VideoCard = ({ video, onStatusChange, onPlay }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'watched':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'practice':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'saved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'watched':
        return <Check className="w-3 h-3" />;
      case 'practice':
        return <RotateCcw className="w-3 h-3" />;
      case 'saved':
        return <Bookmark className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-start gap-4 p-3 rounded-xl bg-white shadow-sm border border-gray-100">
      <div className="relative group flex-shrink-0">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-40 h-24 object-cover rounded-md"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
          {video.duration}
        </div>
        <div
          className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            video.status
          )} flex items-center space-x-1`}
        >
          {getStatusIcon(video.status)}
          <span className="capitalize">{video.status}</span>
        </div>
      </div>

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
              onClick={() =>
                onStatusChange(
                  video.id,
                  video.status === 'practice' ? 'unwatched' : 'practice'
                )
              }
              className={`p-2 rounded-md transition-colors ${
                video.status === 'practice'
                  ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Mark for practice"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                onStatusChange(
                  video.id,
                  video.status === 'saved' ? 'unwatched' : 'saved'
                )
              }
              className={`p-2 rounded-md transition-colors ${
                video.status === 'saved'
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
