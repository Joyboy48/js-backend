import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, Upload, LogOut, User, X, Menu, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import api from "../api/axios";
import Logo from "./Logo";

const Navbar = () => {
  const { currentUser, logoutContext } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?q=${encodeURIComponent(search.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      logoutContext();
      toast.success("See you soon 👋");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
    setMenuOpen(false);
  };

  // Close menu on outside click
  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Navbar */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-4 mt-4 flex items-center justify-between"
      >
        {/* ── LEFT: Logo ── */}
        <Logo size="sm" />

        {/* ── CENTER: Glass pill nav w/ search ── */}
        <div className="flex-1 flex justify-center px-4 max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.form
                key="search-form"
                onSubmit={handleSearch}
                initial={{ width: "40px", opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                exit={{ width: "40px", opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center glass rounded-2xl px-4 py-2.5 gap-3 w-full"
              >
                <Search size={16} className="text-primary shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search videos, creators..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearch(""); }}
                  className="text-white/30 hover:text-white/80 transition-colors card-hover"
                >
                  <X size={16} />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="nav-pills"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass rounded-2xl px-2 py-1.5 flex items-center gap-1"
              >
                {/* Quick nav links */}
                {[
                  { label: "Home", path: "/" },
                  { label: "Explore", path: "/explore" },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 card-hover ${
                      isActive(item.path)
                        ? "bg-primary/20 text-primary"
                        : "text-white/50 hover:text-white/90"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Divider */}
                <div className="w-px h-5 bg-white/10 mx-1" />

                {/* Search trigger */}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/8 transition-all text-sm card-hover"
                >
                  <Search size={15} />
                  <span className="hidden sm:block text-xs">Search...</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Actions ── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Bell */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => toast("No new notifications", { icon: "🔔" })}
            className="relative p-2.5 rounded-xl glass text-white/40 hover:text-white/80 transition-colors card-hover"
          >
            <Bell size={18} />
            {currentUser && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
            )}
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl glass text-gray-800 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors relative card-hover"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* Upload */}
          {currentUser && (
            <Link to="/channel">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl glass text-white/50 hover:text-white/90 transition-all text-sm font-semibold card-hover"
              >
                <Upload size={15} />
                <span className="hidden md:block">Upload</span>
              </motion.div>
            </Link>
          )}

          {/* Avatar / Sign In */}
          {currentUser ? (
            <div ref={menuRef} className="relative">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-2xl glass hover:bg-white/8 transition-all card-hover"
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden ring-2 ring-primary/20">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.fullName}`; }}
                  />
                </div>
                <span className="hidden md:block text-sm font-semibold text-white/80 max-w-[80px] truncate">
                  {currentUser.fullName?.split(" ")[0]}
                </span>
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 8 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-full mt-2 w-56 glass rounded-2xl py-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden"
                  >
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-white/6 mb-1">
                      <p className="text-sm font-bold text-white truncate">{currentUser.fullName}</p>
                      <p className="text-xs text-white/40 truncate mt-0.5">@{currentUser.username}</p>
                    </div>

                    <Link
                      to={`/c/${currentUser.username}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/65 hover:text-white hover:bg-white/6 transition-all card-hover"
                    >
                      <User size={15} className="text-secondary" />
                      My Channel
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-accent/70 hover:text-accent hover:bg-accent/8 transition-all card-hover"
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-white shadow-[0_0_24px_rgba(99,102,241,0.45)] hover:shadow-[0_0_35px_rgba(99,102,241,0.65)] transition-all card-hover"
              >
                Sign In
              </motion.div>
            </Link>
          )}
        </div>
      </motion.header>
    </div>
  );
};

export default Navbar;
