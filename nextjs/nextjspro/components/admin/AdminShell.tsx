"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  BadgeCheck,
  Mail,
  Users,
  Briefcase,
  Layers,
  BarChart3,
  Building2,
  MessageSquare,
  DollarSign,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/blog", label: "Blog Posts", icon: FileText, exact: false },
  { href: "/admin/services", label: "Services", icon: Layers, exact: false },
  { href: "/admin/certificates", label: "Certificates", icon: BadgeCheck, exact: false },
  { href: "/admin/contacts", label: "Contacts", icon: Mail, exact: false },
  { href: "/admin/team", label: "Team Members", icon: Users, exact: false },
  { href: "/admin/portfolio", label: "Portfolio", icon: Briefcase, exact: false },
  { href: "/admin/stats", label: "Stats Counter", icon: BarChart3, exact: false },
  { href: "/admin/clients", label: "Clients", icon: Building2, exact: false },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquare, exact: false },
  { href: "/admin/pricing", label: "Pricing Plans", icon: DollarSign, exact: false },
  { href: "/admin/settings", label: "Site Settings", icon: Settings, exact: false },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const Sidebar = (
    <aside className="flex flex-col w-64 bg-navy-900 h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <Image src="/images/logo.png" alt="ARX" width={36} height={36} />
        <div>
          <p className="font-poppins font-bold text-white text-sm leading-none">
            ARX Infotech
          </p>
          <p className="text-gray-400 text-xs mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold font-poppins transition-colors duration-150",
                active
                  ? "bg-gold-400 text-navy-900"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={17} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold font-poppins text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-150"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-30">{Sidebar}</div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 flex flex-col w-64 h-full">
            {Sidebar}
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-col min-h-screen lg:pl-64">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-5 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <button
            type="button"
            aria-label="Open navigation menu"
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <span className="text-sm text-gray-500 dark:text-gray-400 font-poppins">
            Logged in as <span className="font-semibold text-navy-900 dark:text-white">Admin</span>
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
