import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Clock, Sparkles, ChevronRight, Zap, ChevronLeft } from "lucide-react";
import { VideoCard } from "../components/VideoCard";
import ShortsPlayer from "../components/ShortsPlayer";
import api from "../api/axios";

/* ─────────────────── helpers ─────────────────── */
const formatViews = (n) => {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const formatDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  const now = new Date();
  const diffMs = now - date;
  const secs = Math.floor(diffMs / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  if (years >= 1) return `${years}y ago`;
  if (months >= 1) return `${months}mo ago`;
  if (weeks >= 1) return `${weeks}w ago`;
  if (days >= 1) return `${days}d ago`;
  if (hours >= 1) return `${hours}h ago`;
  if (mins >= 1) return `${mins}m ago`;
  return "just now";
};

/* ─────────────────── Skeleton ─────────────────── */
const SkeletonCard = () => (
  <div className="space-y-3">
    <div className="aspect-video shimmer rounded-2xl" />
    <div className="flex gap-2.5">
      <div className="w-8 h-8 shimmer rounded-xl shrink-0" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="h-3.5 shimmer rounded-lg w-full" />
        <div className="h-3 shimmer rounded-lg w-2/3" />
      </div>
    </div>
  </div>
);

/* ─────────────────── Hero Slideshow ─────────────────── */
const HeroSlideshow = ({ videos }) => {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const go = useCallback((next) => {
    const d = next > idx ? 1 : -1;
    setDirection(d);
    setIdx(next);
    resetTimer();
  }, [idx]);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIdx(p => {
        setDirection(1);
        return (p + 1) % videos.length;
      });
    }, 5000);
  }, [videos.length]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [videos.length]);

  const video = videos[idx];
  if (!video) return null;

  const variants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
  };

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl gradient-border group" style={{ aspectRatio: "21/9" }}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={video._id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <Link to={`/video/${video._id}`}>
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-105"
            />
            {/* Layered gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/45 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/55 to-transparent" />

            {/* Info */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/25 border border-primary/35 text-primary text-[11px] font-bold mb-3 backdrop-blur-sm uppercase tracking-wider">
                  <Sparkles size={10} /> Featured
                </span>
                <h2 className="text-xl sm:text-3xl font-extrabold text-white leading-tight mb-3 max-w-lg line-clamp-2 drop-shadow-xl">
                  {video.title}
                </h2>
                <div className="flex items-center gap-3">
                  <img
                    src={video.owner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${video.owner?.fullName}`}
                    alt={video.owner?.fullName}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white/90 leading-none">{video.owner?.fullName}</p>
                    <p className="text-xs text-white/45 mt-0.5">{formatViews(video.views)} views · {formatDate(video.createdAt)}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="ml-auto hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-extrabold shadow-2xl"
                  >
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Watch Now
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Prev/Next Arrows */}
      <button
        onClick={(e) => { e.preventDefault(); go((idx - 1 + videos.length) % videos.length); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all card-hover"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); go((idx + 1) % videos.length); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all card-hover"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.preventDefault(); go(i); }}
            className={`rounded-full transition-all duration-300 card-hover ${i === idx
                ? "w-5 h-1.5 bg-white"
                : "w-1.5 h-1.5 bg-white/35 hover:bg-white/60"
              }`}
          />
        ))}
      </div>
    </div>
  );
};

/* ─────────────────── Shorts Card ─────────────────── */
const ShortCard = ({ video, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    transition={{ type: "spring", stiffness: 350, damping: 25 }}
    onClick={onClick}
    className="relative shrink-0 w-32 sm:w-40 aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group border border-white/8 hover:border-accent/40 transition-colors card-hover"
  >
    <img
      src={video.thumbnail}
      alt={video.title}
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
    {/* Play indicator */}
    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-accent/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
    <p className="absolute bottom-2 left-2 right-2 text-xs font-semibold text-white line-clamp-2 leading-tight">
      {video.title}
    </p>
    <p className="absolute top-2 left-2 text-[10px] font-bold text-accent/90">
      {formatViews(video.views)} views
    </p>
  </motion.div>
);

/* ─────────────────── Horizontal Row ─────────────────── */
const VideoRow = ({ title, icon: Icon, videos, accentClass }) => {
  const scrollRef = useRef(null);
  if (!videos?.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex items-center gap-2 font-bold text-sm ${accentClass}`}>
          <Icon size={18} strokeWidth={2.5} />
          {title}
        </div>
        <div className="flex-1 h-px bg-white/6" />
        <div className="flex gap-1">
          <button onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })} className="p-1.5 rounded-lg glass-light text-white/30 hover:text-white/70 transition-colors card-hover">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })} className="p-1.5 rounded-lg glass-light text-white/30 hover:text-white/70 transition-colors card-hover">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-3 hide-scrollbar">
        {videos.map((v, i) => (
          <motion.div
            key={v._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="shrink-0 w-60 sm:w-72"
          >
            <VideoCard video={v} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const tabs = [
  { id: "all", label: "For You", icon: Sparkles },
  { id: "trending", label: "Trending", icon: Flame },
  { id: "latest", label: "Latest", icon: Clock },
];

/* ═══════════════════════════════════════════════════════════ */
const Home = () => {
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [shortsOpen, setShortsOpen] = useState(false);
  const [shortsIdx, setShortsIdx] = useState(0);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isExplore = location.pathname === "/explore";
  const queryParam = searchParams.get("q") || "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (queryParam) {
          const r = await api.get(`/videos?query=${queryParam}&isShort=false`);
          const d = r.data?.data;
          setVideos(Array.isArray(d?.videos || d?.docs || d) ? (d?.videos || d?.docs || d) : []);
        } else {
          const [allR, shortsR, trendR, latestR] = await Promise.all([
            // Regular videos only (isShort=false)
            api.get("/videos?limit=20&isShort=false"),
            // Shorts only (isShort=true)
            api.get("/videos?limit=10&isShort=true"),
            api.get("/videos?sortBy=views&sortType=-1&limit=12&isShort=false"),
            api.get("/videos?sortBy=createdAt&sortType=-1&limit=12&isShort=false"),
          ]);
          const extract = (r) => {
            const d = r.data?.data;
            const a = d?.videos || d?.docs || d;
            return Array.isArray(a) ? a : [];
          };
          setVideos(extract(allR));
          setShorts(extract(shortsR));
          setTrending(extract(trendR));
          setLatest(extract(latestR));
        }
      } catch {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [queryParam, isExplore]);

  const heroVideos = videos.slice(0, 5);  // top 5 for slideshow
  const gridVideos = videos.slice(5);      // rest in grid

  const openShorts = (i = 0) => { setShortsIdx(i); setShortsOpen(true); };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 max-w-screen-2xl mx-auto">

      {/* ── SEARCH RESULTS ── */}
      {queryParam && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs text-white/35 uppercase tracking-widest mb-1">Results for</p>
          <h1 className="text-3xl font-extrabold">
            "<span className="text-gradient">{queryParam}</span>"
          </h1>
          <p className="text-sm text-white/30 mt-1">{videos.length} videos found</p>
        </motion.div>
      )}

      {!queryParam && (
        <>
          {/* ── HERO SLIDESHOW ── */}
          {loading ? (
            <div className="mb-8 shimmer rounded-3xl" style={{ aspectRatio: "21/9" }} />
          ) : heroVideos.length > 0 ? (
            <HeroSlideshow videos={heroVideos} />
          ) : null}

          {/* ── SHORTS STRIP ── */}
          {!loading && shorts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 text-accent font-bold text-sm">
                  <Zap size={18} strokeWidth={2.5} fill="currentColor" />
                  Shorts
                  <span className="px-2 py-0.5 rounded-full bg-accent/15 border border-accent/25 text-[10px] font-black uppercase tracking-wider">Beta</span>
                </div>
                <div className="flex-1 h-px bg-white/6" />
                <p className="text-xs text-white/30">Swipe to explore</p>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3 hide-scrollbar">
                {shorts.map((v, i) => (
                  <ShortCard key={v._id} video={v} onClick={() => openShorts(i)} />
                ))}
              </div>
            </motion.section>
          )}

          {/* ── TRENDING + LATEST ROWS ── */}
          {!loading && !isExplore && activeTab === "all" && (
            <>
              <VideoRow title="Trending Now" icon={Flame} videos={trending} accentClass="text-orange-400" />
              <VideoRow title="Latest Drops" icon={Clock} videos={latest} accentClass="text-cyan-400" />
            </>
          )}

          {/* ── TABS ── */}
          {!isExplore && (
            <div className="flex items-center gap-2 mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all card-hover ${active
                        ? "bg-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                        : "glass-light text-white/40 hover:text-white/80"
                      }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── MAIN GRID ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (queryParam ? videos : gridVideos).length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="text-7xl mb-5">🎬</div>
          <h3 className="text-xl font-bold text-white/50 mb-2">
            {queryParam ? "No results found" : "All caught up!"}
          </h3>
          <p className="text-sm text-white/25">
            {queryParam ? `Nothing matches "${queryParam}"` : "Upload something to see it here"}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {(queryParam ? videos : gridVideos).map((vid, i) => (
            <motion.div
              key={vid._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <VideoCard video={vid} />
            </motion.div>
          ))}
        </div>
      )}

      {/* ── SHORTS FULLSCREEN OVERLAY ── */}
      <AnimatePresence>
        {shortsOpen && (
          <ShortsPlayer
            shorts={shorts}
            initialIndex={shortsIdx}
            onClose={() => setShortsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
