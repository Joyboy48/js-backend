import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, Share2, MessageCircle, ChevronUp, ChevronDown, X, Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

const ShortsPlayer = ({ shorts, onClose }) => {
  const [current, setCurrent] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const touchStartY = useRef(null);

  const video = shorts[current];

  const goNext = useCallback(() => {
    if (current < shorts.length - 1) setCurrent(p => p + 1);
  }, [current, shorts.length]);

  const goPrev = useCallback(() => {
    if (current > 0) setCurrent(p => p - 1);
  }, [current]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goNext();
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, onClose]);

  // Touch swipe
  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 50) dy > 0 ? goNext() : goPrev();
    touchStartY.current = null;
  };

  // Wheel scroll
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (e.deltaY > 30) goNext();
    if (e.deltaY < -30) goPrev();
  }, [goNext, goPrev]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.addEventListener("wheel", handleWheel, { passive: false });
    return () => { if (el) el.removeEventListener("wheel", handleWheel); };
  }, [handleWheel]);

  // Auto-play on change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [current]);

  const handleLike = async () => {
    try {
      await api.post(`/likes/toggle/v/${video._id}`);
      setIsLiked(p => !p);
    } catch {
      toast.error("Login to like");
    }
  };

  if (!video) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all card-hover"
      >
        <X size={20} />
      </button>

      {/* Video + Right actions */}
      <div className="relative h-full max-h-screen flex items-center justify-center gap-6">
        {/* Video */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[calc(100vh-40px)] max-h-[calc(100vh-40px)] aspect-[9/16] rounded-3xl overflow-hidden bg-surface shadow-2xl"
          >
            <video
              ref={videoRef}
              src={video.videoFile}
              poster={video.thumbnail}
              loop
              muted={muted}
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <Link to={`/c/${video.owner?.username}`} className="flex items-center gap-2 mb-3">
                <img
                  src={video.owner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${video.owner?.fullName}`}
                  alt={video.owner?.fullName}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-white/20"
                />
                <div>
                  <p className="text-sm font-bold text-white">{video.owner?.fullName}</p>
                  <p className="text-xs text-white/50">@{video.owner?.username}</p>
                </div>
              </Link>
              <p className="text-sm text-white/85 font-medium line-clamp-2">{video.title}</p>
            </div>

            {/* Mute toggle */}
            <button
              onClick={() => setMuted(p => !p)}
              className="absolute top-4 left-4 p-2 rounded-full bg-black/40 backdrop-blur-md text-white card-hover"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Progress indicator */}
            <div className="absolute top-0 left-0 right-0 flex gap-1 p-3">
              {shorts.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${
                    i === current ? "bg-white" : i < current ? "bg-white/50" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right Action Buttons */}
        <div className="flex flex-col gap-5 items-center">
          {/* Up / Down */}
          <div className="flex flex-col gap-2">
            <button
              onClick={goPrev}
              disabled={current === 0}
              className={`p-3 rounded-2xl glass-light transition-all card-hover ${current === 0 ? "opacity-30" : "hover:bg-white/15"}`}
            >
              <ChevronUp size={22} />
            </button>
            <button
              onClick={goNext}
              disabled={current === shorts.length - 1}
              className={`p-3 rounded-2xl glass-light transition-all card-hover ${current === shorts.length - 1 ? "opacity-30" : "hover:bg-white/15"}`}
            >
              <ChevronDown size={22} />
            </button>
          </div>

          {/* Like */}
          <div className="flex flex-col items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className={`p-3.5 rounded-2xl glass-light transition-all card-hover ${isLiked ? "text-primary glow-primary" : ""}`}
            >
              <ThumbsUp size={22} fill={isLiked ? "currentColor" : "none"} />
            </motion.button>
            <span className="text-xs text-white/40">{isLiked ? "Liked" : "Like"}</span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/video/${video._id}`); toast.success("Link copied!"); }}
              className="p-3.5 rounded-2xl glass-light hover:bg-white/15 transition-all card-hover"
            >
              <Share2 size={22} />
            </button>
            <span className="text-xs text-white/40">Share</span>
          </div>

          {/* Go to full video */}
          <div className="flex flex-col items-center gap-1">
            <Link
              to={`/video/${video._id}`}
              onClick={onClose}
              className="p-3.5 rounded-2xl glass-light hover:bg-white/15 transition-all card-hover"
            >
              <MessageCircle size={22} />
            </Link>
            <span className="text-xs text-white/40">More</span>
          </div>

          {/* Scroll progress */}
          <div className="text-xs text-white/30 font-mono">
            {current + 1}/{shorts.length}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShortsPlayer;
