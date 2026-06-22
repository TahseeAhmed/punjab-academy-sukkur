import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Wallet,
  ClipboardList,
  Megaphone,
  LogOut,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navByRole = {
  admin: [
    { to: "/", label: "Overview", icon: LayoutGrid, end: true },
    { to: "/students", label: "Students", icon: GraduationCap },
    { to: "/teachers", label: "Teachers", icon: Users },
    { to: "/classes", label: "Classes & Subjects", icon: BookOpen },
    { to: "/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/fees", label: "Fees", icon: Wallet },
    { to: "/academics", label: "Academics", icon: ClipboardList },
    { to: "/notices", label: "Notices", icon: Megaphone },
  ],
  teacher: [
    { to: "/", label: "Overview", icon: LayoutGrid, end: true },
    { to: "/students", label: "My Students", icon: GraduationCap },
    { to: "/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/academics", label: "Assignments & Results", icon: ClipboardList },
    { to: "/notices", label: "Notices", icon: Megaphone },
  ],
  student: [
    { to: "/", label: "Overview", icon: LayoutGrid, end: true },
    { to: "/attendance", label: "My Attendance", icon: CalendarCheck },
    { to: "/fees", label: "My Fees", icon: Wallet },
    { to: "/academics", label: "Assignments & Results", icon: ClipboardList },
    { to: "/notices", label: "Notices", icon: Megaphone },
  ],
};

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const items = navByRole[user.role] || [];

  return (
    <aside className="w-64 shrink-0 bg-forest text-white/90 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 rounded-full border-2 border-gold-light flex items-center justify-center shrink-0">
          <span className="font-display text-sm font-semibold text-gold-light">
            PA
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-white leading-tight">
            Punjab Academy
          </p>
          <p className="text-[11px] text-white/50 leading-tight">Sukkur</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 pb-3">
          <p className="text-sm font-medium text-white truncate">{user.name}</p>
          <p className="text-xs text-white/50 capitalize">{user.role}</p>
        </div>
        <NavLink
          to="/change-password"
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white/90"
            }`
          }
        >
          <KeyRound size={17} />
          Change password
        </NavLink>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white/90 transition-colors"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
};
