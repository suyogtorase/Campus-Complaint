import { useContext } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutDashboard, FilePlus, List, LogOut,
  CheckSquare, BarChart2, Shield
} from "lucide-react";

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/landing", { replace: true });
  };

  const getNavLinks = () => {
    switch (user?.role) {
      case "student":
      case "teacher":
        return [
          { name: "My Complaints",  path: "/dashboard", icon: <LayoutDashboard size={18} /> },
          { name: "Raise Complaint", path: "/raise",     icon: <FilePlus size={18} /> },
        ];
      case "incharge":
        return [
          { name: "Assigned to Me", path: "/dashboard", icon: <CheckSquare size={18} /> },
        ];
      case "admin":
        return [
          { name: "Analytics",      path: "/dashboard",         icon: <BarChart2 size={18} /> },
          { name: "All Complaints", path: "/admin/complaints",  icon: <List size={18} /> },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-50">

      {/* ── Sidebar ── */}
      <nav className="w-[240px] shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col">

        {/* Brand */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-indigo-500 flex items-center gap-2 text-lg font-bold select-none">
            <Shield size={22} /> SmartCampus
          </h1>
        </div>

        {/* Nav links */}
        <div className="flex-1 p-4 flex flex-col gap-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all
                  ${isActive
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-100 border border-transparent"
                  }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* User card + logout */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-100 text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize truncate">{user?.role} · {user?.department !== "NONE" ? user?.department : "General"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="flex-1 p-8 overflow-y-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
