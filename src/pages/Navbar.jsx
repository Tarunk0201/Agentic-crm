import { Bell, LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const getPageName = () => {
    const path = location.pathname.split("/")[1];
    if (!path) return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
      <h1 className="text-xl font-semibold text-zinc-900">{getPageName()}</h1>
      <div className="flex items-center gap-4">
        <button className="text-zinc-500 hover:text-zinc-700">
          <Bell size={20} />
        </button>
        <button className="text-zinc-500 hover:text-zinc-700">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
