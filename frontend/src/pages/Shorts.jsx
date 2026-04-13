import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ThumbsUp, Share2, MessageCircle, ChevronUp, ChevronDown, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

const formatNum = (n) => {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const Shorts = () => {
  const [shorts, setShorts] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get("/videos?isShort=true&limit=20");
        const d = r.data?.data;
        const arr = d?.videos || d?.docs || d;
        setShorts(Array.isArray(arr) ? arr : []);
      } catch { setShorts([]); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const video = shorts[current];

  // Auto-play on change
  useEffect(() => {
    setIsLiked(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [current]);

  const goNext = useCallback(() => {
    if (current < shorts.length - 1) setCurrent(p => p + 1);
  }, [current, shorts.length]);

  const goPrev = useCallback(() => {
    if (current > 0) setCurrent(p => p - 1);
  }, [current]);

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowDown") goNext();
      if (e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev]);

  // Touch swipe
  const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 50) dy > 0 ? goNext() : goPrev();
    touchStartY.current = null;
  };

  // Wheel
  const onWheel = useCallback((e) => {
    e.preventDefault();
    if (e.deltaY > 30) goNext();
    else if (e.deltaY < -30) goPrev();
  }, [goNext, goPrev]);

  useEffect(() => {
    const el = document.getElementById("shorts-container");
    if (el) el.addEventListener("wheel", onWheel, { passive: false });
    return () => { if (el) el.removeEventListener("wheel", onWheel); };
  }, [onWheel]);

  const handleLike = async () => {
    if (!video) return;
    try {
      await api.post(`/likes/toggle/v/${video._id}`);
      setIsLiked(p => !p);
    } catch { toast.error("Login to like"); }
  };

  // ── Loading or Empty ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4 text-white/30">
          <div className="w-10 h-10 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
          <p className="text-sm">Loading Shorts...</p>
        </div>
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
        <div className="text-6xl mb-4">⚡</div>
        <h2 className="text-2xl font-bold text-white mb-2">No Shorts yet</h2>
        <p className="text-white/40 text-sm mb-6">Upload short vertical videos to see them here</p>
        <Link to="/channel" className="px-6 py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 transition-colors">
          Upload a Short
        </Link>
      </div>
    );
  }

  return (
    <div
      id="shorts-container"
      className="fixed inset-0 z-20 flex items-center justify-center"
      style={{ backgroundColor: '#0f0f0f' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center w-full max-w-sm md:max-w-none md:w-auto gap-2 md:gap-5 h-[100dvh] md:h-full"
        >
          {/* ── VIDEO ── */}
          <div className="relative w-full h-full md:h-[calc(100vh-60px)] md:max-h-[calc(100vh-60px)] md:aspect-[9/16] md:rounded-2xl overflow-hidden shadow-2xl bg-black">
            <video
              ref={videoRef}
              src={video?.videoFile}
              poster={video?.thumbnail}
              loop muted={muted} playsInline autoPlay
              className="w-full h-full object-cover"
            />

            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 flex gap-1 p-3">
              {shorts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`flex-1 h-0.5 rounded-full transition-all ${i === current ? "bg-white" : i < current ? "bg-white/40" : "bg-white/15"}`}
                />
              ))}
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Mute */}
            <button onClick={() => setMuted(p => !p)}
              className="absolute top-6 right-4 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white card-hover">
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Creator info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <Link to={`/c/${video?.owner?.username}`} className="flex items-center gap-2.5 mb-3 w-fit">
                <img
                  src={video?.owner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${video?.owner?.fullName}`}
                  alt="" className="w-9 h-9 rounded-xl object-cover ring-2 ring-white/20"
                />
                <div>
                  <p className="text-sm font-bold text-white leading-none">{video?.owner?.fullName}</p>
                  <p className="text-xs text-white/50">@{video?.owner?.username}</p>
                </div>
              </Link>
              <p className="text-sm text-white/85 font-medium line-clamp-2">{video?.title}</p>
              <p className="text-xs text-white/40 mt-1">{formatNum(video?.views)} views</p>
            </div>
          </div>

          {/* ── RIGHT ACTIONS ── */}
          <div className="absolute right-3 bottom-24 md:static md:bottom-auto md:right-auto flex flex-col items-center gap-4 z-30">
            {/* Nav buttons */}
            <button onClick={goPrev} disabled={current === 0}
              className={`p-3 rounded-2xl glass-light card-hover transition-all ${current === 0 ? "opacity-25" : "hover:bg-white/15"}`}>
              <ChevronUp size={22} />
            </button>
            <button onClick={goNext} disabled={current === shorts.length - 1}
              className={`p-3 rounded-2xl glass-light card-hover transition-all ${current === shorts.length - 1 ? "opacity-25" : "hover:bg-white/15"}`}>
              <ChevronDown size={22} />
            </button>

            <div className="w-px h-4 bg-white/10" />

            {/* Like */}
            <div className="flex flex-col items-center gap-1">
              <motion.button whileTap={{ scale: 0.8 }} onClick={handleLike}
                className={`p-3.5 rounded-2xl glass-light card-hover transition-all ${isLiked ? "text-primary shadow-[0_0_16px_rgba(99,102,241,0.6)]" : "hover:bg-white/12"}`}>
                <ThumbsUp size={22} fill={isLiked ? "currentColor" : "none"} />
              </motion.button>
              <span className="text-[10px] text-white/30">Like</span>
            </div>

            {/* Share */}
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/video/${video?._id}`); toast.success("Link copied!"); }}
                className="p-3.5 rounded-2xl glass-light hover:bg-white/12 card-hover transition-all">
                <Share2 size={22} />
              </button>
              <span className="text-[10px] text-white/30">Share</span>
            </div>

            {/* Full video */}
            <div className="flex flex-col items-center gap-1">
              <Link to={`/video/${video?._id}`} className="p-3.5 rounded-2xl glass-light hover:bg-white/12 card-hover transition-all">
                <MessageCircle size={22} />
              </Link>
              <span className="text-[10px] text-white/30">Open</span>
            </div>

            <div className="w-px h-4 bg-white/10" />

            {/* Counter */}
            <span className="text-xs font-mono text-white/25">{current + 1}/{shorts.length}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Shorts;
