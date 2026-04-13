import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, Clock, ThumbsUp } from "lucide-react";

/* ─── Formatters ─────────────────────────────────── */
const formatDuration = (s) => {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};
const formatNum = (n) => {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};
const timeAgo = (d) => {
  if (!d) return "";
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60),
    day = Math.floor(h / 24), wk = Math.floor(day / 7),
    mo = Math.floor(day / 30), yr = Math.floor(day / 365);
  if (yr >= 1) return `${yr}y ago`;
  if (mo >= 1) return `${mo}mo ago`;
  if (wk >= 1) return `${wk}w ago`;
  if (day >= 1) return `${day}d ago`;
  if (h >= 1) return `${h}h ago`;
  if (m >= 1) return `${m}m ago`;
  return "just now";
};

/* ─────────────────────────────────────────────────────
   HoverPreview
   Appears DIRECTLY over the card, expanding it upward.
   Same position as the thumbnail, 1.2× wider, video plays
   in place of the thumbnail. Info shown underneath.
───────────────────────────────────────────────────── */
const HoverPreview = ({ video, rect, visible }) => {
  const previewRef = useRef(null);

  // Expanded popup width = card width × 1.25, clamped to screen
  const expandedW = rect ? Math.min(rect.width * 1.25, window.innerWidth - 32) : 320;
  // Center it on the card horizontally
  const rawLeft = rect ? rect.left - (expandedW - rect.width) / 2 : 0;
  const clampedLeft = Math.max(8, Math.min(rawLeft, window.innerWidth - expandedW - 8));

  // Align so the video sits where the thumbnail was, popup grows upward + downward
  const topOffset = rect ? rect.top - 8 : 0;

  // Autoplay after 500ms
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => previewRef.current?.play().catch(() => {}), 500);
    return () => {
      clearTimeout(t);
      if (previewRef.current) { previewRef.current.pause(); previewRef.current.currentTime = 0; }
    };
  }, [visible]);

  if (!rect || !video) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 6 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed z-[500] glass rounded-2xl overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.85)] border border-white/10"
      style={{
        left: clampedLeft,
        top: topOffset,
        width: expandedW,
        pointerEvents: "none",
      }}
    >
      {/* ── VIDEO / THUMBNAIL ── */}
      <div className="relative" style={{ aspectRatio: "16/9" }}>
        {video.videoFile ? (
          <video
            ref={previewRef}
            src={video.videoFile}
            poster={video.thumbnail}
            muted loop playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Duration */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 text-white text-xs font-bold">
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      {/* ── INFO ── */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
          {video.title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] text-white/40 flex-wrap">
          <span className="flex items-center gap-1"><Eye size={11} />{formatNum(video.views)} views</span>
          {video.likes > 0 && <span className="flex items-center gap-1"><ThumbsUp size={11} />{formatNum(video.likes)}</span>}
          <span className="flex items-center gap-1 ml-auto"><Clock size={11} />{timeAgo(video.createdAt)}</span>
        </div>

        {/* Description */}
        {video.description && (
          <p className="text-[11px] text-white/35 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        )}

        {/* Channel */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/6">
          <img
            src={video.owner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${video.owner?.fullName}`}
            alt={video.owner?.fullName}
            className="w-6 h-6 rounded-lg object-cover ring-1 ring-white/10"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-white/60 truncate">{video.owner?.fullName}</p>
          </div>
          <span className="text-[10px] text-white/20 shrink-0">Hover to preview</span>
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────
   VideoCard
───────────────────────────────────────────────────── */
export const VideoCard = ({ video, compact = false }) => {
  const { _id, thumbnail, title, views, createdAt, owner, duration } = video;
  const cardRef = useRef(null);

  // 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 });
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  // Hover preview state
  const [showPreview, setShowPreview] = useState(false);
  const [cardRect, setCardRect] = useState(null);
  const hoverTimer = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseEnter = useCallback(() => {
    hoverTimer.current = setTimeout(() => {
      if (cardRef.current) {
        setCardRect(cardRef.current.getBoundingClientRect());
        setShowPreview(true);
      }
    }, 600);
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(hoverTimer.current);
    setShowPreview(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  /* ── Compact variant ── */
  if (compact) {
    return (
      <Link to={`/video/${_id}`} className="flex gap-3 group p-2 rounded-xl hover:bg-white/5 transition-all card-hover">
        <div className="relative shrink-0 w-36 aspect-video rounded-lg overflow-hidden">
          <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {duration && (
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold">
              {formatDuration(duration)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="text-sm font-semibold text-white/80 group-hover:text-white line-clamp-2 leading-snug transition-colors">{title}</h4>
          <p className="text-xs text-white/40 mt-1">{owner?.fullName}</p>
          <p className="text-xs text-white/25 mt-0.5">{formatNum(views)} views</p>
        </div>
      </Link>
    );
  }

  /* ── Full card ── */
  return (
    <>
      <motion.div
        ref={cardRef}
        className="group relative card-hover"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link to={`/video/${_id}`} className="block">
          {/* 3D tilting thumbnail */}
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative overflow-hidden rounded-2xl bg-surface aspect-video"
          >
            <img
              src={thumbnail || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format"}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Glare */}
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: useTransform(
                  [glareX, glareY],
                  ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.1) 0%, transparent 60%)`
                )
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

            {duration && (
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                {formatDuration(duration)}
              </div>
            )}

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 flex items-center justify-center shadow-2xl"
                style={{ transform: "translateZ(20px)" }}
              >
                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.div>
            </div>

            {/* Stats strip */}
            <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-center gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <span className="flex items-center gap-1 text-[11px] text-white/70"><Eye size={11} />{formatNum(views)}</span>
              <span className="text-white/30 text-xs">·</span>
              <span className="flex items-center gap-1 text-[11px] text-white/70"><Clock size={11} />{timeAgo(createdAt)}</span>
            </div>
          </motion.div>

          {/* Info */}
          <div className="flex gap-2.5 mt-3 px-0.5">
            <img
              src={owner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${owner?.fullName}`}
              alt={owner?.fullName}
              className="w-8 h-8 rounded-xl object-cover ring-1 ring-white/8 group-hover:ring-primary/40 transition-all duration-300 shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white/85 group-hover:text-white line-clamp-2 leading-snug transition-colors">
                {title || "Untitled Video"}
              </h3>
              <p className="text-xs text-white/35 mt-1">{owner?.fullName}</p>
              <p className="text-xs text-white/25 mt-0.5">{formatNum(views)} views · {timeAgo(createdAt)}</p>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Hover preview — expands over card */}
      <AnimatePresence>
        {showPreview && (
          <HoverPreview video={video} rect={cardRect} visible={showPreview} />
        )}
      </AnimatePresence>
    </>
  );
};
