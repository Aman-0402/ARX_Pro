import { NavLink } from "react-router-dom";
import { ADMIN_RESOURCES } from "@/config/adminResources";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-navy-900 min-h-screen p-6 flex flex-col">
      <h2 className="text-white font-bold text-lg mb-8">ARX Admin</h2>

      <nav className="flex-1 space-y-1">
        {ADMIN_RESOURCES.map((resource) => (
          <NavLink
            key={resource.key}
            to={`/admin/${resource.key}`}
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm ${
                isActive ? "bg-gold-400 text-navy-900 font-semibold" : "text-gray-300 hover:bg-navy-800"
              }`
            }
          >
            {resource.label}
          </NavLink>
        ))}
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `block px-3 py-2 rounded text-sm ${
              isActive ? "bg-gold-400 text-navy-900 font-semibold" : "text-gray-300 hover:bg-navy-800"
            }`
          }
        >
          Settings
        </NavLink>
      </nav>

      <button
        type="button"
        onClick={() => logout()}
        className="text-gray-400 hover:text-white text-sm text-left mt-6"
      >
        Log Out
      </button>
    </aside>
  );
}
