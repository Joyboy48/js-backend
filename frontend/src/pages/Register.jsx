import { useState, useRef } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Loader2, ImagePlus, PlaySquare } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import CustomCursor from "../components/CustomCursor";
import AuroraBackground from "../components/InteractiveBackground";
import Logo from "../components/Logo";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const avatarRef = useRef();
  const coverRef = useRef();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!avatar) return toast.error("Avatar is required!");

    setLoading(true);
    
    // Construct FormData for multipart/form-data
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("avatar", avatar);
    if (coverImage) data.append("coverImage", coverImage);

    try {
      const response = await api.post("/users/register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(response.data.message || "Registration successful!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) setter(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070709] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-gray-900 dark:text-white transition-colors duration-300">
      <AuroraBackground />
      <CustomCursor />
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="flex justify-center mb-6">
           <Logo size="lg" />
        </div>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-accent hover:text-accent/80 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10"
      >
        <div className="glass py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-200 dark:border-white/10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Image Uploaders */}
            <div className="flex gap-4 mb-6">
               <div 
                 className="w-24 h-24 rounded-full border-2 border-dashed border-gray-500 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden relative shrink-0"
                 onClick={() => avatarRef.current?.click()}
               >
                 {avatar ? (
                     <img src={URL.createObjectURL(avatar)} className="w-full h-full object-cover" />
                 ) : (
                     <>
                        <ImagePlus size={24} className="text-gray-400 mb-1" />
                        <span className="text-[10px] text-gray-400">Avatar *</span>
                     </>
                 )}
                 <input type="file" ref={avatarRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setAvatar)} />
               </div>

               <div 
                 className="flex-1 h-24 rounded-xl border-2 border-dashed border-gray-500 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-colors overflow-hidden relative"
                 onClick={() => coverRef.current?.click()}
               >
                 {coverImage ? (
                     <img src={URL.createObjectURL(coverImage)} className="w-full h-full object-cover" />
                 ) : (
                     <>
                        <ImagePlus size={24} className="text-gray-400 mb-1" />
                        <span className="text-xs text-gray-400">Cover Image</span>
                     </>
                 )}
                 <input type="file" ref={coverRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setCoverImage)} />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                    type="text" required
                    className="appearance-none block w-full pl-10 px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all sm:text-sm"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                </div>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">@</div>
                    <input
                    type="text" required
                    className="appearance-none block w-full pl-10 px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all sm:text-sm"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    />
                </div>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="email" required
                  className="appearance-none block w-full pl-10 px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all sm:text-sm"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="password" required
                  className="appearance-none block w-full pl-10 px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm shadow-accent/20 text-sm font-semibold text-white bg-gradient-to-r from-accent to-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Channel"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
