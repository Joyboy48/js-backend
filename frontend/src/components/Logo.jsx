import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "./../context/ThemeContext";

const Logo = ({ size = "sm" }) => {
  const { theme } = useTheme();
  // Configs for different sizes (Navbar vs Auth Pages)
  const isLarge = size === "lg";
  const containerClass = isLarge ? "w-16 h-16 rounded-[1.5rem]" : "w-11 h-11 rounded-2xl";
  const iconClass = isLarge ? "w-8 h-8 ml-1.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "w-6 h-6 ml-1 drop-shadow-md";
  const textSize = isLarge ? "text-5xl" : "text-2xl";

  return (
    <Link to="/" className="flex items-center gap-3 group shrink-0 w-fit mx-auto md:mx-0">
      
      {/* Container with "Breathing" and Complex Glowing animation */}
      <motion.div
        animate={{
          boxShadow: [
            "0 0 15px rgba(99,102,241,0.4)",
            "0 0 40px rgba(236,72,153,0.8)",
            "0 0 60px rgba(234,179,8,0.6)",
            "0 0 15px rgba(99,102,241,0.4)",
          ],
          scale: [1, 1.08, 1],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`${containerClass} bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-orange-500 flex items-center justify-center relative overflow-hidden shrink-0 z-10 p-0.5`}
      >
        {/* Animated Inner Shine (Sweep effect) */}
        <motion.div
          animate={{ x: ["-200%", "200%"] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
          className="absolute inset-0 w-1/2 h-full bg-white/30 skew-x-12 z-20"
          style={{ filter: "blur(4px)" }}
        />

        {/* Pulse rings from behind the icon */}
        <motion.div
          animate={{
            scale: [0.8, 1.8, 2.5],
            opacity: [0.8, 0, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 m-auto w-1/2 h-1/2 bg-white rounded-full mix-blend-overlay z-0 blur-[2px]"
        />

        {/* The Play Icon (Bouncing slightly to the "beat") */}
        <motion.div
          whileHover={{ scale: 1.2, rotate: 90 }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
          className="z-30 flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" fill="white" className={iconClass}>
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Brand Text */}
      <div className={`flex items-center tracking-tight font-outfit font-black ${textSize}`}>
        <motion.span 
           animate={{ 
             color: theme === "dark" 
               ? ["#ffffff", "#fbcfe8", "#ffffff"] 
               : ["#111827", "#db2777", "#111827"] 
           }}
           transition={{ duration: 3, repeat: Infinity }}
        >
          zoo
        </motion.span>
        {/* Animate the gradient text itself */}
        <motion.span 
           animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
           }}
           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
           className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
           style={{ backgroundSize: "200% 200%" }}
        >
          Tube
        </motion.span>
      </div>
    </Link>
  );
};

export default Logo;
