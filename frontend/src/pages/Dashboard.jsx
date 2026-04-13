import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, PlaySquare, Eye, Upload, Trash2, Edit,
  X, Zap, TrendingUp, Video, BarChart2, Clock,
  Film, CheckCircle, AlertCircle, ListVideo
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const formatNum = (n) => {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="relative glass rounded-2xl p-5 overflow-hidden group hover:bg-white/6 transition-all"
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${color} to-transparent pointer-events-none rounded-2xl`} />
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-xs text-white/40 font-medium uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-extrabold text-white leading-none">{value}</p>
        {sub && <p className="text-xs text-white/30 mt-1.5">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace("from-", "bg-").split(" ")[0].replace("/10", "/20")}`}>
        <Icon size={20} className="text-white/70" />
      </div>
    </div>
  </motion.div>
);

// ── Mini bar chart for analytics ──────────────────────
const MiniChart = ({ data, color = "#6366f1" }) => {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(d.value / max) * 100}%` }}
          transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 rounded-t-sm min-h-[2px] relative group"
          style={{ background: color, opacity: 0.6 + (i / data.length) * 0.4 }}
        >
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded glass text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {d.label}: {d.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "videos",   label: "Videos",   icon: Video },
  { id: "shorts",   label: "Shorts",   icon: Zap },
  { id: "playlists",label: "Playlists",icon: ListVideo },
];

const Dashboard = () => {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [isShort, setIsShort] = useState(false);
  const videoRef = useRef(null);
  const thumbRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      const [statsR, vidsR, userR] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/videos"),
        api.get("/users/get-current-user")
      ]);
      setStats(statsR.data?.data || null);
      const all = Array.isArray(vidsR.data?.data) ? vidsR.data.data : [];
      setVideos(all.filter(v => !v.isShort));
      setShorts(all.filter(v => v.isShort));

      const userId = userR.data?.data?._id;
      if (userId) {
         const plR = await api.get(`/playlist/user/${userId}`);
         setPlaylists(plR.data?.data || []);
      }
    } catch {
      setStats(null); setVideos([]); setShorts([]); setPlaylists([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/videos/${id}`);
      toast.success("Deleted");
      setVideos(p => p.filter(v => v._id !== id));
      setShorts(p => p.filter(v => v._id !== id));
    } catch { toast.error("Failed to delete"); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (thumbRef.current?.files[0]) fd.append("thumbnail", thumbRef.current.files[0]);
    try {
      setUploading(true);
      toast.loading("Updating...", { id: "up" });
      await api.patch(`/videos/${editModal._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Updated! 🎉", { id: "up" });
      setEditModal(null);
      load();
    } catch {
      toast.error("Update failed", { id: "up" });
    } finally { setUploading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (videoRef.current?.files[0]) fd.append("videoFile", videoRef.current.files[0]);
    if (thumbRef.current?.files[0]) fd.append("thumbnail", thumbRef.current.files[0]);
    fd.append("isShort", String(isShort));
    try {
      setUploading(true);
      toast.loading("Uploading… this may take a minute", { id: "up" });
      await api.post("/videos", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Published! 🎉", { id: "up" });
      setUploadModal(false);
      load();
    } catch {
      toast.error("Upload failed", { id: "up" });
    } finally { setUploading(false); }
  };

  // Fake weekly view chart from stats
  const chartData = stats ? [
    { label: "Mon", value: Math.round((stats.totalViews || 0) * 0.08) },
    { label: "Tue", value: Math.round((stats.totalViews || 0) * 0.12) },
    { label: "Wed", value: Math.round((stats.totalViews || 0) * 0.10) },
    { label: "Thu", value: Math.round((stats.totalViews || 0) * 0.15) },
    { label: "Fri", value: Math.round((stats.totalViews || 0) * 0.18) },
    { label: "Sat", value: Math.round((stats.totalViews || 0) * 0.22) },
    { label: "Sun", value: Math.round((stats.totalViews || 0) * 0.15) },
  ] : [];

  const VideoTable = ({ data, type }) => (
    data.length === 0 ? (
      <div className="flex flex-col items-center py-20 text-center">
        <Film size={48} className="text-gray-300 dark:text-white/10 mb-4" />
        <p className="text-gray-400 dark:text-white/40 font-semibold">No {type}s uploaded yet</p>
        <button onClick={() => { setIsShort(type === "short"); setUploadModal(true); }}
          className="mt-4 px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors card-hover">
          Upload {type === "short" ? "⚡ Short" : "🎬 Video"}
        </button>
      </div>
    ) : (
      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead>
          <tr className="border-b border-gray-200 dark:border-white/6 text-gray-500 dark:text-white/35 text-xs uppercase tracking-widest">
              <th className="px-5 py-3 font-semibold">Content</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Views</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/4">
            {data.map((v, i) => (
              <motion.tr key={v._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              className="hover:bg-gray-50 dark:hover:bg-white/4 transition-colors group"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-[260px]">
                    <div className={`relative shrink-0 overflow-hidden rounded-xl bg-surface ${type === "short" ? "w-10 h-[70px]" : "w-24 h-14"}`}>
                      <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-white/80 line-clamp-2 text-sm leading-snug">{v.title}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    v.isPublished
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  }`}>
                    {v.isPublished ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                    {v.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-500 dark:text-white/35 whitespace-nowrap">
                  {new Date(v.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5 text-gray-600 dark:text-white/50 font-mono">{formatNum(v.views)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditModal(v)} className="p-2 rounded-lg glass-light hover:text-gray-900 dark:hover:text-white text-gray-400 dark:text-white/40 transition-colors card-hover">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(v._id)}
                      className="p-2 rounded-lg hover:bg-accent/15 text-gray-400 dark:text-white/40 hover:text-accent transition-colors card-hover">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 max-w-screen-2xl mx-auto">

      {/* ─── TOP BAR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Creator Studio</h1>
          <p className="text-sm text-gray-500 dark:text-white/35 mt-1">Manage your content and monitor performance</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setIsShort(false); setUploadModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:shadow-[0_0_36px_rgba(99,102,241,0.6)] transition-all card-hover"
        >
          <Upload size={16} /> Upload
        </motion.button>
      </div>

      {/* ─── TABS ─── */}
      <div className="flex items-center gap-1 p-1 glass rounded-2xl w-fit mb-8">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all card-hover ${
              tab === id ? "bg-primary text-white shadow-[0_0_16px_rgba(99,102,241,0.4)]" : "text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/80"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      <AnimatePresence mode="wait">
        {tab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Eye} label="Total Views" value={formatNum(stats?.totalViews)} sub="Lifetime" color="from-primary/10" delay={0} />
              <StatCard icon={Users} label="Subscribers" value={formatNum(stats?.totalSubscribers)} sub="Channels following you" color="from-secondary/10" delay={0.05} />
              <StatCard icon={Video} label="Videos" value={formatNum(videos.length)} sub="Published" color="from-gold/10" delay={0.1} />
              <StatCard icon={Zap} label="Shorts" value={formatNum(shorts.length)} sub="Published" color="from-accent/10" delay={0.15} />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
              {/* Views chart */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-white/35 uppercase tracking-widest mb-0.5">Weekly Views</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNum(stats?.totalViews)}</p>
                  </div>
                  <TrendingUp size={18} className="text-primary" />
                </div>
                <MiniChart data={chartData} color="#6366f1" />
                <div className="flex justify-between mt-2">
                  {chartData.map((d, i) => (
                    <p key={i} className="text-[10px] text-gray-400 dark:text-white/20 text-center flex-1">{d.label}</p>
                  ))}
                </div>
              </div>

              {/* Content breakdown */}
              <div className="glass rounded-2xl p-5">
                <p className="text-xs text-gray-500 dark:text-white/35 uppercase tracking-widest mb-4">Content Mix</p>
                <div className="space-y-3">
                  {[
                    { label: "Videos", count: videos.length, color: "bg-primary", total: videos.length + shorts.length },
                    { label: "Shorts", count: shorts.length, color: "bg-accent", total: videos.length + shorts.length },
                  ].map(({ label, count, color, total }) => {
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/60 font-medium">{label}</span>
                          <span className="text-white/40 font-mono">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-white/6 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className={`h-full rounded-full ${color}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Top video */}
                {videos[0] && (
                  <div className="mt-5 pt-4 border-t border-white/6">
                    <p className="text-xs text-gray-400 dark:text-white/30 mb-2">Top Performing</p>
                    <div className="flex items-center gap-3">
                      <img src={videos[0].thumbnail} alt="" className="w-14 h-9 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white/80 truncate">{videos[0].title}</p>
                        <p className="text-xs text-gray-500 dark:text-white/35">{formatNum(videos[0].views)} views</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Videos Preview */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/6">
                <p className="font-bold text-gray-800 dark:text-white/80">Recent Uploads</p>
                <button onClick={() => setTab("videos")} className="text-xs text-primary hover:text-primary/80 transition-colors card-hover">View all →</button>
              </div>
              <VideoTable data={[...videos, ...shorts].slice(0, 5)} type="video" />
            </div>
          </motion.div>
        )}

        {tab === "videos" && (
          <motion.div key="videos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Videos</h2>
                <p className="text-sm text-gray-500 dark:text-white/35">{videos.length} regular videos uploaded</p>
              </div>
              <button onClick={() => { setIsShort(false); setUploadModal(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass-light text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white text-sm font-semibold transition-all card-hover">
                <Upload size={14} /> Upload Video
              </button>
            </div>
            <div className="glass rounded-2xl overflow-hidden">
              <VideoTable data={videos} type="video" />
            </div>
          </motion.div>
        )}

        {tab === "shorts" && (
          <motion.div key="shorts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Zap size={18} className="text-accent" /> Your Shorts
                </h2>
                <p className="text-sm text-gray-500 dark:text-white/35">{shorts.length} shorts uploaded</p>
              </div>
              <button onClick={() => { setIsShort(true); setUploadModal(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/15 border border-accent/25 text-accent hover:bg-accent/25 text-sm font-semibold transition-all card-hover">
                <Zap size={14} /> Upload Short
              </button>
            </div>
            <div className="glass rounded-2xl overflow-hidden">
              <VideoTable data={shorts} type="short" />
            </div>
          </motion.div>
        )}

        {tab === "playlists" && (
          <motion.div key="playlists" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ListVideo size={18} className="text-primary" /> Your Playlists
                </h2>
                <p className="text-sm text-gray-500 dark:text-white/35">{playlists.length} playlists created</p>
              </div>
            </div>
            {playlists.length === 0 ? (
               <div className="flex flex-col items-center py-20 text-center glass rounded-2xl">
                 <ListVideo size={48} className="text-gray-300 dark:text-white/10 mb-4" />
                 <p className="text-gray-400 dark:text-white/40 font-semibold mb-2">No playlists yet</p>
                 <p className="text-sm text-gray-400 dark:text-white/30">Create a playlist while watching videos to organize your library.</p>
               </div>
            ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {playlists.map((pl, i) => (
                    <motion.div key={pl._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4 flex flex-col group relative card-hover cursor-pointer" onClick={() => window.location.href=`/playlist/${pl._id}`}>
                       <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3 relative">
                         {pl.videos && pl.videos[0] ? (
                           <img src={pl.videos[0].thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center bg-white/5"><ListVideo size={24} className="text-white/20"/></div>
                         )}
                         <div className="absolute right-2 bottom-2 bg-black/80 backdrop-blur text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-white flex items-center gap-1">
                           <ListVideo size={10} /> {(pl.videos || []).length}
                         </div>
                       </div>
                       <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">{pl.name}</h3>
                       <p className="text-xs text-gray-500 dark:text-white/40 mt-1 line-clamp-2">{pl.description || "No description"}</p>
                       
                       <button onClick={async (e) => { 
                         e.stopPropagation();
                         if(confirm("Delete playlist?")) {
                           try { await api.delete(`/playlists/${pl._id}`); toast.success("Deleted"); load(); } catch { toast.error("Fail"); }
                         }
                       }} className="absolute top-6 right-6 p-1.5 bg-black/80 hover:bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white backdrop-blur z-20 tooltip tooltip-left" data-tip="Delete playlist">
                         <Trash2 size={14} />
                       </button>
                    </motion.div>
                 ))}
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── UPLOAD MODAL ─── */}
      <AnimatePresence>
        {uploadModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/6">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isShort ? "bg-accent/20" : "bg-primary/20"}`}>
                    {isShort ? <Zap size={18} className="text-accent" /> : <Video size={18} className="text-primary" />}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">{isShort ? "Upload Short" : "Upload Video"}</h2>
                    <p className="text-xs text-gray-500 dark:text-white/35">{isShort ? "Vertical content, ≤60s recommended" : "Regular landscape content"}</p>
                  </div>
                </div>
                <button onClick={() => setUploadModal(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/8 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-all card-hover">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                <form onSubmit={handleUpload} className="space-y-4">

                  {/* Toggle Short/Video */}
                  <div className="flex p-1 glass rounded-xl">
                    <button type="button" onClick={() => setIsShort(false)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${!isShort ? "bg-primary text-white" : "text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/70"}`}>
                      <Video size={14} /> Video
                    </button>
                    <button type="button" onClick={() => setIsShort(true)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${isShort ? "bg-accent text-white" : "text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/70"}`}>
                      <Zap size={14} /> Short
                    </button>
                  </div>

                  {/* Video file */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-widest">Video File *</label>
                    <input type="file" ref={videoRef} accept="video/*" required
                      className="w-full text-sm text-gray-600 dark:text-white/50 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-xl p-2 outline-none card-hover" />
                  </div>

                  {/* Thumbnail */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-widest">Thumbnail *</label>
                    <input type="file" ref={thumbRef} accept="image/*" required
                      className="w-full text-sm text-gray-600 dark:text-white/50 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-accent/20 file:text-accent hover:file:bg-accent/30 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-xl p-2 outline-none card-hover" />
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-widest">Title *</label>
                    <input type="text" name="title" required placeholder="Give it a great title"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-widest">Description *</label>
                    <textarea name="description" required rows={3} placeholder="What's this about..."
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setUploadModal(false)}
                      className="flex-1 py-2.5 rounded-xl glass-light text-gray-700 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5 dark:hover:text-white text-sm font-semibold transition-all card-hover">
                      Cancel
                    </button>
                    <button type="submit" disabled={uploading}
                      className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 card-hover ${
                        isShort ? "bg-accent hover:bg-accent/90 shadow-[0_0_20px_rgba(244,63,94,0.4)]" : "bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                      }`}>
                      {uploading ? "Uploading..." : isShort ? "⚡ Publish Short" : "🎬 Publish Video"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── EDIT MODAL ─── */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="glass rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/20">
                    <Edit size={18} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Edit Video</h2>
                    <p className="text-xs text-white/35">Update details and thumbnail</p>
                  </div>
                </div>
                <button onClick={() => setEditModal(null)} className="p-2 rounded-xl hover:bg-white/8 text-white/40 hover:text-white transition-all card-hover"><X size={18} /></button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                <form onSubmit={handleEdit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">New Thumbnail (Optional)</label>
                    <input type="file" ref={thumbRef} accept="image/*" className="w-full text-sm text-white/50 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 bg-white/4 border border-white/8 rounded-xl p-2 outline-none card-hover" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Title *</label>
                    <input type="text" name="title" defaultValue={editModal.title} required className="w-full px-4 py-2.5 bg-white/4 border border-white/8 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:border-primary/40 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Description *</label>
                    <textarea name="description" defaultValue={editModal.description} required rows={3} className="w-full px-4 py-2.5 bg-white/4 border border-white/8 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:border-primary/40 transition-colors resize-none" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-2.5 rounded-xl glass-light text-white/50 hover:text-white text-sm font-semibold transition-all card-hover">Cancel</button>
                    <button type="submit" disabled={uploading} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 card-hover bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                      {uploading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
