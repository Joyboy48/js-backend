import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import CustomCursor from "../components/CustomCursor";
import AuroraBackground from "../components/InteractiveBackground";
import Logo from "../components/Logo";

const Login = () => {
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, loginContext } = useAuth();

  if (currentUser) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isEmail = form.usernameOrEmail.includes("@");
    const payload = isEmail
      ? { email: form.usernameOrEmail, password: form.password }
      : { username: form.usernameOrEmail, password: form.password };
    try {
      const res = await api.post("/users/login", payload);
      loginContext(res.data?.data?.user);
      toast.success("Welcome back! 🎬");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] bg-background flex items-center justify-center relative overflow-hidden p-4">
      <AuroraBackground />
      <CustomCursor />
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-6">
             <Logo size="lg" />
          </div>
        <p className="text-sm text-white/40 mt-1">Sign in to zooTube</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.5)]"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
                Email or Username
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  required
                  placeholder="you@example.com"
                  value={form.usernameOrEmail}
                  onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })}
                  className="w-full bg-white/5 border border-white/8 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/8 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm bg-primary text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-white/30">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
