import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThumbsUp, Play, Clock, Heart } from "lucide-react";
import { VideoCard } from "../components/VideoCard";
import api from "../api/axios";

const formatDuration = (s) => {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

const formatViews = (n) => {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/likes/videos");
        const d = data?.data;
        if (Array.isArray(d)) {
          setVideos(d.map(item => item.likedVideo || item).filter(Boolean));
        } else setVideos([]);
      } catch { setVideos([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 max-w-screen-2xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5 mb-10 p-6 sm:p-8 glass rounded-3xl overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 relative z-10">
          <Heart size={28} className="text-primary fill-primary/40" />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Liked Videos</h1>
          <p className="text-sm text-white/40 mt-1">
            {loading ? "Loading..." : `${videos.length} video${videos.length !== 1 ? "s" : ""} you loved`}
          </p>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-video shimmer rounded-2xl" />
              <div className="h-4 shimmer rounded-lg w-3/4" />
              <div className="h-3 shimmer rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && videos.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center">
          <ThumbsUp size={64} className="text-white/10 mb-6" />
          <h3 className="text-xl font-bold text-white/40">No liked videos yet</h3>
          <p className="text-sm text-white/25 mt-2">Videos you like will appear here</p>
          <Link to="/" className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
            Browse Videos
          </Link>
        </motion.div>
      )}

      {/* Grid */}
      {!loading && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {videos.map((video, i) => (
            <motion.div key={video._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <VideoCard video={video} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedVideos;
