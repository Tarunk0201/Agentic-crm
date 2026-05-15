import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  LayoutDashboard,
  Users,
  FileText,
  CalendarClock,
  Phone,
  Megaphone,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const Logo = () => (
  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900">
    <div className="h-5 w-5 rounded-full bg-white" />
  </div>
);

function NavItem({ item, isCollapsed }) {
  const { label, icon: Icon, path, children, badge } = item;
  const [isOpen, setIsOpen] = useState(false);
  const [isPopoutOpen, setIsPopoutOpen] = useState(false);
  const hasChildren = children && children.length > 0;
  const node = useRef();

  const handleToggle = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (node.current && !node.current.contains(e.target)) {
        setIsPopoutOpen(false);
      }
    };

    if (isPopoutOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopoutOpen]);

  const commonClasses =
    "flex w-full items-center gap-2 rounded-lg px-1 py-1 text-sm transition-all";
  const activeClasses = "bg-[#fff2e6] text-[#da7d33]";
  const inactiveClasses = "text-zinc-700 hover:bg-[#f8f8f8]";

  if (isCollapsed) {
    if (hasChildren) {
      return (
        <div ref={node} className="relative">
          <div
            onClick={() => setIsPopoutOpen(!isPopoutOpen)}
            className={`${commonClasses} justify-center ${inactiveClasses} cursor-pointer`}
          >
            {Icon && <Icon size={25} />}
          </div>
          {isPopoutOpen && (
            <div className="absolute left-full top-0 z-10 ml-2 w-max min-w-[200px] rounded-lg bg-white p-2 shadow-lg">
              <p className="px-3 py-1.5 font-semibold">{label}</p>
              <div className="flex flex-col gap-1">
                {children.map((child) => (
                  <NavItem key={child.label} item={child} isCollapsed={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        to={path}
        className={({ isActive }) =>
          `${commonClasses} justify-center ${
            isActive ? activeClasses : inactiveClasses
          }`
        }
      >
        {Icon && <Icon size={20} />}
      </NavLink>
    );
  }

  if (hasChildren) {
    return (
      <div>
        <div
          onClick={handleToggle}
          className={`${commonClasses} ${inactiveClasses} cursor-pointer justify-between`}
        >
          <div className="flex items-center justify-center gap-2">
            {Icon && <Icon size={16} />}
            <span className="font-semibold">{label}</span>
          </div>
          <ChevronDown
            size={16}
            className={`transform transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pl-4 pt-1"
            >
              <div className="flex flex-col gap-1 border-l border-zinc-200 pl-3">
                {children.map((child) => (
                  <NavItem key={child.label} item={child} isCollapsed={false} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `${commonClasses} ${isActive ? activeClasses : inactiveClasses}`
      }
    >
      {Icon && <Icon size={16} />}
      <span className="font-semibold">{label}</span>
      {badge && (
        <span className="ml-auto rounded-md bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function Sidebar({ mobileOpen, setMobileOpen }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    // { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    // {
    //   label: "Audience",
    //   icon: Users,
    //   children: [
    //     { label: "Subscribers", path: "/audience/subscribers" },
    //     { label: "Leads", path: "/audience/leads" },
    //   ],
    // },
    // { label: "Posts", icon: FileText, path: "/posts", badge: 8 },
    // { label: "Schedules", icon: CalendarClock, path: "/schedules", badge: 3 },
    {
      label: "IVR",
      icon: Phone,
      children: [
        { label: "Contacts", path: "/contacts" },
        { label: "Logs", path: "/logs" },
        { label: "Meetings", path: "/meetings" },
        { label: "Script Builder", path: "/script-flow" },
      ],
    },
    // { label: "Promote", icon: Megaphone, path: "/promote" },
  ];

  const content = (
    <div
      className={`glass relative flex h-full flex-col gap-4  rounded-[14px]  ${
        isCollapsed ? "px-2 py-2 w-16" : "px-3 py-2"
      }`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-12.5 -right-3 z-10 hidden rounded-full border border-zinc-200 bg-white p-1 shadow-md hover:bg-zinc-50 md:block"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div
        className={`flex items-center gap-2 ${isCollapsed ? "justify-center" : ""}`}
      >
        <Logo />
        {!isCollapsed && (
          <p className="text-sm font-medium text-zinc-700">IVR</p>
        )}
        <button className="md:hidden" onClick={() => setMobileOpen(false)}>
          <ChevronLeft size={14} className="text-orange-500" />
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavItem key={item.label} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 rounded-lg bg-[#ea8d3f] p-2 text-white shadow-sm md:hidden"
      >
        <Menu size={16} />
      </button>
      <aside
        className={`hidden md:block transition-all duration-300 ${
          isCollapsed ? "w-auto" : "w-auto"
        }`}
      >
        {content}
      </aside>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white p-3 md:hidden"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
