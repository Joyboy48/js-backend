import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Compass, PlaySquare, History, ThumbsUp, Video, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Home",     icon: Home,      path: "/" },
  { label: "Explore",  icon: Compass,   path: "/explore" },
  { label: "Shorts",   icon: Zap,       path: "/shorts" },
  { label: "Studio",   icon: Video,     path: "/channel", auth: true },
  { label: "Subs",     icon: PlaySquare,path: "/subscriptions", auth: true },
  { label: "History",  icon: History,   path: "/history", auth: true },
  { label: "Liked",    icon: ThumbsUp,  path: "/liked",   auth: true },
];

const FloatingDock = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const visible = navItems.filter(item => !item.auth || currentUser);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.nav
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass rounded-2xl px-3 py-2.5 flex items-center gap-1"
      >
        {visible.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} to={item.path} className="relative group">
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-white dark:bg-elevated text-xs font-medium text-gray-800 dark:text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200 pointer-events-none border border-gray-200 dark:border-white/10">
                {item.label}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-white/10" />
              </div>

              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.9 }}
                className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/80 hover:bg-gray-100 dark:hover:bg-white/6"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />

                {/* Active dot */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="dock-active"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
};

export default FloatingDock;
