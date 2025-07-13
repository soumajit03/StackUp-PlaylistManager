import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  id: String,
  title: String,
  status: {
    type: [String],
    default: ['unwatched']
  }
}, { _id: false });

const playlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  playlistId: {
    type: String,
    required: true
  },
  title: String,
  videos: [videoSchema]
}, {
  timestamps: true
});

export default mongoose.model('Playlist', playlistSchema);
