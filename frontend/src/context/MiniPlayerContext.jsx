import { createContext, useContext, useState, useCallback } from "react";

const MiniPlayerContext = createContext(null);

export const MiniPlayerProvider = ({ children }) => {
  const [miniVideo, setMiniVideo] = useState(null);    // { _id, title, videoFile, thumbnail, owner }
  const [startTime, setStartTime] = useState(0);        // where user left off
  const [isVisible, setIsVisible] = useState(false);

  const openMini = useCallback((video, time = 0) => {
    setMiniVideo(video);
    setStartTime(time);
    setIsVisible(true);
  }, []);

  const closeMini = useCallback(() => {
    setIsVisible(false);
    setMiniVideo(null);
    setStartTime(0);
  }, []);

  return (
    <MiniPlayerContext.Provider value={{ miniVideo, startTime, isVisible, openMini, closeMini }}>
      {children}
    </MiniPlayerContext.Provider>
  );
};

export const useMiniPlayer = () => {
  const ctx = useContext(MiniPlayerContext);
  if (!ctx) throw new Error("useMiniPlayer must be used inside MiniPlayerProvider");
  return ctx;
};
