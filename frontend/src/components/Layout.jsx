import { Outlet } from "react-router-dom";
import FloatingDock from "./FloatingDock";
import Navbar from "./Navbar";
import CustomCursor from "./CustomCursor";
import AuroraBackground from "./InteractiveBackground";
import MiniPlayer from "./MiniPlayer";

const Layout = () => {
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#070709] text-gray-900 dark:text-white overflow-x-hidden transition-colors duration-300">
      {/* ── DYNAMIC CANVAS BACKGROUND ── */}
      <AuroraBackground />

      <CustomCursor />
      <Navbar />

      <main className="relative z-10 pt-24 pb-32 min-h-screen hide-scrollbar">
        <Outlet />
      </main>

      <FloatingDock />

      {/* ── GLOBAL MINI PLAYER ── */}
      <MiniPlayer />
    </div>
  );
};

export default Layout;
