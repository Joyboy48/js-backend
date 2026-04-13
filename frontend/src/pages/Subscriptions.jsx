import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, UserCheck, Users, ExternalLink } from "lucide-react";
import api from "../api/axios";

const formatNum = (n) => {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const Subscriptions = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/subscriptions/c/me");
        if (Array.isArray(data?.data)) setChannels(data.data);
        else setChannels([]);
      } catch { setChannels([]); }
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
        className="flex items-center gap-5 mb-10 p-6 sm:p-8 glass rounded-3xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-secondary/15 border border-secondary/25 flex items-center justify-center shrink-0 z-10">
          <Users size={28} className="text-secondary" />
        </div>
        <div className="z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Subscriptions</h1>
          <p className="text-sm text-gray-500 dark:text-white/40 mt-1">
            {loading ? "Loading..." : `${channels.length} channel${channels.length !== 1 ? "s" : ""} you follow`}
          </p>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-5 glass rounded-2xl">
              <div className="w-16 h-16 shimmer rounded-full" />
              <div className="h-3.5 shimmer rounded-lg w-20" />
              <div className="h-3 shimmer rounded-lg w-14" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && channels.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center">
          <UserCheck size={64} className="text-gray-300 dark:text-white/10 mb-6" />
          <h3 className="text-xl font-bold text-gray-400 dark:text-white/40">No subscriptions yet</h3>
          <p className="text-sm text-gray-400 dark:text-white/25 mt-2">Channels you subscribe to will appear here</p>
          <Link to="/explore" className="mt-6 px-6 py-2.5 rounded-xl bg-secondary text-black text-sm font-semibold hover:bg-secondary/90 transition-colors">
            Explore Channels
          </Link>
        </motion.div>
      )}

      {/* Channel Grid */}
      {!loading && channels.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {channels.map((chan, i) => (
            <motion.div
              key={chan._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Link to={`/c/${chan.username}`}
                className="flex flex-col items-center gap-3 p-5 glass rounded-2xl hover:bg-gray-100 dark:hover:bg-white/8 transition-all relative overflow-hidden card-hover"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />

                <div className="relative">
                  <img
                    src={chan.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${chan.fullName}`}
                    alt={chan.fullName}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 dark:ring-white/10 group-hover:ring-secondary/40 transition-all"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary/80 border-2 border-background flex items-center justify-center">
                    <CheckCircle size={10} className="text-white" />
                  </div>
                </div>

                <div className="text-center min-w-0 w-full">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-secondary transition-colors">{chan.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-white/35 truncate">@{chan.username}</p>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-white/25 group-hover:text-gray-700 dark:group-hover:text-white/50 transition-colors">
                  <ExternalLink size={11} />
                  <span>View Channel</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
