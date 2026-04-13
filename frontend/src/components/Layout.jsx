import { Outlet } from "react-router-dom";
import FloatingDock from "./FloatingDock";
import Navbar from "./Navbar";
import CustomCursor from "./CustomCursor";
import AuroraBackground from "./InteractiveBackground";

const Layout = () => {
  return (
    <div className="relative min-h-screen bg-[#070709] text-white overflow-x-hidden">
      {/* ── DYNAMIC CANVAS BACKGROUND ── */}
      <AuroraBackground />

      <CustomCursor />
      <Navbar />

      <main className="relative z-10 pt-24 pb-32 min-h-screen hide-scrollbar">
        <Outlet />
      </main>

      <FloatingDock />
    </div>
  );
};

export default Layout;
