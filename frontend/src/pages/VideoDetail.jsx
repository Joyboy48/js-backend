import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThumbsUp, Share2, CheckCircle, Bell, Eye,
  ChevronDown, ChevronUp, Copy, ExternalLink, Link2, X, ListPlus
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Comments from "../components/Comments";
import { VideoCard } from "../components/VideoCard";

const formatNum = (n) => {
  if (!n) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

const formatDuration = (s) => {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

/* ─── Share Modal ─────────────────────────────── */
const ShareModal = ({ url, title, onClose }) => {
  const copy = () => { navigator.clipboard.writeText(url); toast.success("Link copied!"); };
  const shareOptions = [
    {
      name: "Copy Link", icon: Copy, color: "bg-white/10 hover:bg-white/20",
      action: copy,
    },
    {
      name: "Twitter / X", icon: ExternalLink, color: "bg-sky-500/15 hover:bg-sky-500/25 text-sky-400",
      action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, "_blank"),
    },
    {
      name: "Copy Embed", icon: Link2, color: "bg-primary/15 hover:bg-primary/25 text-primary",
      action: () => { navigator.clipboard.writeText(`<iframe src="${url}" frameborder="0" allowfullscreen></iframe>`); toast.success("Embed code copied!"); },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <h3 className="text-base font-bold text-white">Share Video</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-all card-hover">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* URL box */}
          <div className="flex items-center gap-2 px-3 py-2.5 glass-light rounded-xl">
            <p className="flex-1 text-xs text-white/50 truncate font-mono">{url}</p>
            <button onClick={copy} className="shrink-0 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-xs font-bold transition-all card-hover">
              Copy
            </button>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map(({ name, icon: Icon, color, action }) => (
              <button key={name} onClick={action}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl text-xs font-semibold text-white/70 transition-all card-hover ${color}`}>
                <Icon size={20} />
                {name}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Playlist Modal ───────────────────────────── */
const PlaylistModal = ({ videoId, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");

  const loadPlaylists = async () => {
    try {
      const userR = await api.get("/users/get-current-user");
      const userId = userR.data?.data?._id;
      if (userId) {
         const plR = await api.get(`/playlist/user/${userId}`);
         setPlaylists(plR.data?.data || []);
      }
    } catch { setPlaylists([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadPlaylists(); }, []);

  const toggleVideo = async (pl) => {
    const hasVideo = pl.videos?.some(v => (v._id || v) === videoId);
    try {
       if (hasVideo) {
         await api.patch(`/playlist/remove/${videoId}/${pl._id}`);
         toast.success("Removed from " + pl.name);
       } else {
         await api.patch(`/playlist/add/${videoId}/${pl._id}`);
         toast.success("Saved to " + pl.name);
       }
       loadPlaylists();
    } catch { toast.error("Failed to update playlist"); }
  };

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await api.post("/playlist", { name: newTitle, description: "Playlist" });
      const newPlId = res.data?.data?._id;
      if (newPlId) {
        await api.patch(`/playlist/add/${videoId}/${newPlId}`);
        toast.success(`Created & saved to ${newTitle}`);
        setNewTitle("");
        loadPlaylists();
      }
    } catch { toast.error("Failed to create playlist"); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ y: 40, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.95 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()} className="glass rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <h3 className="text-base font-bold text-white">Save to Playlist</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-all card-hover"><X size={16} /></button>
        </div>
        <div className="p-2 overflow-y-auto max-h-[40vh] min-h-[100px]">
          {loading ? <div className="p-4 text-center text-sm text-white/30">Loading...</div> : playlists.map(pl => {
              const hasVideo = pl.videos?.some(v => (v._id || v) === videoId);
              return (
                <button key={pl._id} onClick={() => toggleVideo(pl)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group card-hover">
                  <span className="text-sm font-semibold text-white/80 group-hover:text-white line-clamp-1">{pl.name}</span>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${hasVideo ? "bg-primary border-primary" : "border-white/20 group-hover:border-white/40"}`}>
                    {hasVideo && <CheckCircle size={10} className="text-white" />}
                  </div>
                </button>
              )
          })}
        </div>
        <div className="p-4 border-t border-white/6 bg-white/4">
          <form onSubmit={createPlaylist} className="flex items-center gap-2">
             <input type="text" placeholder="Create new playlist" value={newTitle} onChange={(e)=>setNewTitle(e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-sm focus:border-primary/50 outline-none text-white placeholder:text-white/30 card-hover" />
             <button type="submit" disabled={!newTitle.trim()} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed card-hover">Create</button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Main Page ───────────────────────────────── */
const VideoDetail = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [recommended, setRecommended] = useState([]);
  const [descExpanded, setDescExpanded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const fetchVideo = async () => {
      try {
        const res = await api.get(`/videos/${id}`);
        if (res.data.data) {
          setVideo(res.data.data);
          setLikesCount(res.data.data.likes || 0);
          setIsLiked(res.data.data.isLiked || false);
          setIsSubscribed(res.data.data.owner?.isSubscribed || false);
        }
      } catch { setVideo(null); }
      finally { setLoading(false); }
    };

    const fetchRecommended = async () => {
      try {
        const res = await api.get("/videos?limit=20&isShort=false");
        const data = res.data?.data;
        const arr = data?.videos || data?.docs || data;
        if (Array.isArray(arr)) setRecommended(arr.filter(v => v._id !== id));
      } catch {}
    };

    fetchVideo();
    fetchRecommended();
  }, [id]);

  const handleLike = async () => {
    try {
      await api.post(`/likes/toggle/v/${id}`);
      setIsLiked(p => !p);
      setLikesCount(p => isLiked ? p - 1 : p + 1);
    } catch { toast.error("Please login to like"); }
  };

  const handleSubscribe = async () => {
    if (!video?.owner?._id) return;
    try {
      await api.post(`/subscriptions/c/${video.owner._id}`);
      setIsSubscribed(p => !p);
      toast.success(isSubscribed ? "Unsubscribed" : "Subscribed! 🔔");
    } catch { toast.error("Please login to subscribe"); }
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-4">
            <div className="aspect-video shimmer rounded-2xl" />
            <div className="h-7 shimmer rounded-lg w-3/4" />
            <div className="h-5 shimmer rounded-lg w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-white/30">
        <div className="text-6xl mb-4">🎬</div>
        <p className="text-xl font-semibold">Video not found</p>
      </div>
    );
  }

  const shareUrl = window.location.href;

  return (
    <>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-6">

          {/* ══ LEFT: Player + Info ══ */}
          <div className="space-y-4 min-w-0">

            {/* Player */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
            >
              <video
                src={video.videoFile}
                controls autoPlay
                poster={video.thumbnail}
                className="w-full h-full"
              />
            </motion.div>

            {/* Title + meta */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">{video.title}</h1>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-white/35">
                <Eye size={14} />
                <span>{formatNum(video.views)} views</span>
                <span>·</span>
                <span>{formatDate(video.createdAt)}</span>
              </div>
            </motion.div>

            {/* Actions Row */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-y border-white/8"
            >
              {/* Channel */}
              <div className="flex items-center gap-3">
                <Link to={`/c/${video.owner?.username}`}>
                  <img
                    src={video.owner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${video.owner?.fullName}`}
                    alt={video.owner?.fullName}
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/10 hover:ring-primary/50 transition-all"
                  />
                </Link>
                <div>
                  <Link to={`/c/${video.owner?.username}`}
                    className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-primary transition-colors">
                    {video.owner?.fullName}
                    <CheckCircle size={13} className="text-primary" />
                  </Link>
                  <p className="text-xs text-white/35 mt-0.5">{formatNum(video.owner?.subscribersCount)} subscribers</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleSubscribe}
                  className={`ml-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all card-hover ${
                    isSubscribed ? "glass-light text-white/60 hover:text-white" : "bg-white text-black hover:bg-gray-100 shadow-lg"
                  }`}
                >
                  <Bell size={14} />
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </motion.button>
              </div>

              {/* Like + Share */}
              <div className="flex items-center gap-2">
                <div className="flex items-center glass-light rounded-xl overflow-hidden">
                  <motion.button
                    whileTap={{ scale: 0.9 }} onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all hover:bg-white/8 ${
                      isLiked ? "text-primary" : "text-white/60"
                    }`}
                  >
                    <ThumbsUp size={16} fill={isLiked ? "currentColor" : "none"} />
                    <span>{formatNum(likesCount)}</span>
                  </motion.button>
                  <div className="w-px h-6 bg-white/10" />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShareOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white/90 hover:bg-white/8 transition-all card-hover"
                  >
                    <Share2 size={16} />
                    <span className="hidden sm:block">Share</span>
                  </motion.button>
                  <div className="w-px h-6 bg-white/10" />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPlaylistOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white/90 hover:bg-white/8 transition-all card-hover"
                  >
                    <ListPlus size={16} />
                    <span className="hidden sm:block">Save</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="glass-light rounded-2xl p-4 cursor-pointer"
              onClick={() => setDescExpanded(p => !p)}
            >
              <p className={`text-sm text-white/70 leading-relaxed whitespace-pre-wrap ${!descExpanded ? "line-clamp-3" : ""}`}>
                {video.description || "No description provided."}
              </p>
              <button className="flex items-center gap-1 mt-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                {descExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {descExpanded ? "Show less" : "Show more"}
              </button>
            </motion.div>

            {/* Comments */}
            <Comments videoId={id} />
          </div>

          {/* ══ RIGHT: Recommended ══ */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Up Next</p>
            <div className="space-y-1">
              {recommended.slice(0, 14).map((rec, i) => (
                <motion.div
                  key={rec._id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <VideoCard video={rec} compact />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {shareOpen && (
          <ShareModal url={shareUrl} title={video.title} onClose={() => setShareOpen(false)} />
        )}
        {playlistOpen && (
          <PlaylistModal videoId={id} onClose={() => setPlaylistOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoDetail;
