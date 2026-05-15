import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-[#f7f7f7] overflow-hidden">
      <div className="mx-auto flex h-full gap-2.5 p-2">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <main className="flex-1 flex flex-col min-w-0 gap-2 overflow-hidden">
          <div className="flex-none">
            <Navbar />
          </div>
          <div className="flex-1 overflow-y-auto rounded-xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
