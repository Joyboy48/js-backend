import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { useMiniPlayer } from "../context/MiniPlayerContext";

const MiniPlayer = () => {
  const { miniVideo, startTime, isVisible, closeMini } = useMiniPlayer();
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 }); // offset from default bottom-right
  const dragStart = useRef(null);

  // Set start time when video loads
  useEffect(() => {
    if (videoRef.current && startTime > 0) {
      videoRef.current.currentTime = startTime;
    }
  }, [miniVideo, startTime]);

  // Play/pause toggle
  useEffect(() => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.play().catch(() => {});
    else videoRef.current.pause();
  }, [playing]);

  // Drag support
  const onMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = {
      mx: e.clientX,
      my: e.clientY,
      ox: pos.x,
      oy: pos.y,
    };
  };
  const onMouseMove = (e) => {
    if (!isDragging || !dragStart.current) return;
    setPos({
      x: dragStart.current.ox + (e.clientX - dragStart.current.mx),
      y: dragStart.current.oy + (e.clientY - dragStart.current.my),
    });
  };
  const onMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  if (!miniVideo) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 40 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-[999] select-none"
          style={{
            bottom: `${-pos.y + 24}px`,
            right: `${-pos.x + 24}px`,
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={onMouseDown}
        >
          {/* Main container */}
          <div className="w-[320px] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10 bg-black group">

            {/* Video */}
            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                src={miniVideo.videoFile}
                poster={miniVideo.thumbnail}
                muted={muted}
                loop
                playsInline
                autoPlay
                className="w-full h-full object-contain"
              />

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Controls overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                {/* Mute */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={(e) => { e.stopPropagation(); setMuted(p => !p); }}
                  className="p-2 rounded-xl bg-black/50 backdrop-blur-md text-white border border-white/10 pointer-events-auto hover:bg-black/70 transition-colors"
                >
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </motion.button>

                {/* Play/Pause */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }}
                  className="p-3 rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/20 pointer-events-auto hover:bg-white/30 transition-colors"
                >
                  {playing ? <Pause size={20} /> : <Play size={20} />}
                </motion.button>

                {/* Expand to full */}
                <Link
                  to={`/video/${miniVideo._id}`}
                  onClick={closeMini}
                  className="pointer-events-auto"
                >
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className="p-2 rounded-xl bg-black/50 backdrop-blur-md text-white border border-white/10 hover:bg-black/70 transition-colors"
                  >
                    <Maximize2 size={16} />
                  </motion.div>
                </Link>
              </div>

              {/* Close button — always visible */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.stopPropagation(); closeMini(); }}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white/70 hover:text-white hover:bg-black/80 transition-all border border-white/8 z-10"
              >
                <X size={14} />
              </motion.button>
            </div>

            {/* Info bar */}
            <div className="px-3 py-2.5 flex items-center gap-2.5 bg-[#111] border-t border-white/6">
              <img
                src={miniVideo.owner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${miniVideo.owner?.fullName}`}
                alt=""
                className="w-7 h-7 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white/90 line-clamp-1 leading-tight">{miniVideo.title}</p>
                <p className="text-[10px] text-white/40">{miniVideo.owner?.fullName}</p>
              </div>
              <Link to={`/video/${miniVideo._id}`} onClick={closeMini}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="shrink-0 px-2 py-1 rounded-lg bg-primary/20 text-primary text-[10px] font-bold hover:bg-primary/30 transition-colors"
                >
                  Open
                </motion.div>
              </Link>
            </div>
          </div>

          {/* Drag hint */}
          <p className="text-center text-[10px] text-white/20 mt-1.5 select-none">drag to move</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MiniPlayer;
