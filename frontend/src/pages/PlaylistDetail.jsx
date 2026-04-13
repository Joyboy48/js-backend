import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, ListVideo, Clock, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { VideoCard } from "../components/VideoCard";

const PlaylistDetail = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick formatter
  const formatViews = (n) => {
    if (!n) return "0";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const { data } = await api.get(`/playlist/${id}`);
        setPlaylist(data?.data);
      } catch (err) {
        toast.error("Failed to load playlist");
        setPlaylist(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 max-w-screen-2xl mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 space-y-4">
             <div className="aspect-square shimmer rounded-2xl" />
             <div className="h-8 shimmer rounded-lg w-3/4" />
             <div className="h-4 shimmer rounded-lg w-1/2" />
          </div>
          <div className="flex-1 space-y-4 pt-10">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-32 shimmer rounded-2xl w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <ListVideo size={64} className="text-white/10 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Playlist Not Found</h2>
      </div>
    );
  }

  const videos = playlist.videos || [];
  const validVideos = videos.filter(v => typeof v === 'object' && v !== null); // safety check
  const firstVideo = validVideos[0];
  const coverImage = firstVideo?.thumbnail || `https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format`;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 max-w-screen-2xl mx-auto py-8">
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* ── LEFT: Playlist Hero / Meta ── */}
        <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0">
          <div className="sticky top-28 glass rounded-3xl p-5 overflow-hidden">
            {/* Ambient Background Glow matching the cover image */}
            <div 
              className="absolute inset-0 opacity-20 blur-[60px] transform scale-150 pointer-events-none" 
              style={{ backgroundImage: `url(${coverImage})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
            />
            
            <div className="relative z-10">
              <div className="aspect-video sm:aspect-square w-full rounded-xl overflow-hidden mb-5 relative shadow-2xl bg-surface">
                <img src={coverImage} alt="Playlist Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5">
                  <ListVideo size={14} /> {validVideos.length} videos
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
                {playlist.name}
              </h1>
              <p className="text-sm text-white/50 mb-6 leading-relaxed">
                {playlist.description || "No description provided"}
              </p>

              <div className="flex items-center gap-3 mb-6">
                 <img src={`https://api.dicebear.com/7.x/initials/svg?seed=You`} alt="Author" className="w-8 h-8 rounded-full ring-2 ring-white/10" />
                 <div>
                   <p className="text-sm font-semibold text-white/90">Created by you</p>
                   <p className="text-xs text-white/40">Updated completed</p>
                 </div>
              </div>

              <div className="flex gap-3">
                <Link to={validVideos.length > 0 ? `/video/${validVideos[0]._id}` : '#'} 
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-[0_0_24px_rgba(99,102,241,0.3)] transition-all ${validVideos.length > 0 ? 'bg-primary text-white hover:bg-primary/90' : 'bg-primary/50 text-white/50 cursor-not-allowed'}`}
                >
                  <Play size={16} fill={validVideos.length > 0 ? "white" : "none"} /> Play All
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Video List ── */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-xl font-bold text-white">Videos</h3>
            <span className="text-sm text-white/40">{validVideos.length} items</span>
          </div>

          {validVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center glass-light rounded-3xl mx-2">
              <ListVideo size={48} className="text-white/20 mb-4" />
              <p className="text-lg font-semibold text-white/60">This playlist is empty</p>
              <p className="text-sm text-white/30 mt-1">Videos you add will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {validVideos.map((v, i) => (
                <motion.div
                  key={v._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col sm:flex-row gap-4 p-3 rounded-2xl glass hover:bg-white/10 transition-colors group relative"
                >
                   {/* Number Index */}
                   <div className="hidden sm:flex w-8 shrink-0 items-center justify-center text-sm font-bold text-white/30 group-hover:text-white/60">
                     {i + 1}
                   </div>

                   <Link to={`/video/${v._id}`} className="relative sm:w-48 shrink-0 rounded-xl overflow-hidden aspect-video bg-black">
                     <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     {v.duration && (
                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold">
                          {Math.floor((v.duration || 0) / 60)}:{Math.floor((v.duration || 0) % 60).toString().padStart(2, '0')}
                        </div>
                     )}
                   </Link>

                   <div className="flex flex-col flex-1 py-1 mr-2 min-w-0">
                     <Link to={`/video/${v._id}`} className="text-base sm:text-lg font-semibold text-white/90 group-hover:text-white line-clamp-2 leading-snug transition-colors">
                       {v.title}
                     </Link>
                     <div className="flex items-center gap-2 mt-1.5 text-xs text-white/40 font-medium">
                        <span>{v.owner?.fullName || "Author"}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {formatViews(v.views)} views</span>
                     </div>
                   </div>

                   <div className="absolute sm:relative top-3 right-3 sm:top-0 sm:right-0 p-2 sm:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors tooltip tooltip-left" data-tip="Remove from playlist">
                       <Trash2 size={16} />
                     </button>
                   </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetail;
