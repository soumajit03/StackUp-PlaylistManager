import React from 'react';
import { Users, Video } from 'lucide-react';


  const PlaylistHeader = ({ playlist }) => {
  const total = playlist.videos?.length || 0;
  const watched = playlist.videos?.filter(v => v.status?.includes("watched")).length || 0;
  const percent = total > 0 ? Math.round((watched / total) * 100) : 0;


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
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{playlist.channelTitle}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Video className="w-4 h-4" />
              <span>{playlist.videoCount || videos.length} videos</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-green-700">
                {percent}% Watched
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistHeader;
