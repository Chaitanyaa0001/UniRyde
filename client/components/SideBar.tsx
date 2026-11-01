"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CarFront,
  CalendarDays,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/auth/auth.context";

const navigation = [
    {
    name: "Profile",
    href: "/profile",
    icon: Users,
  },
  {
    name: "Find Carpools",
    href: "/carpool",
    icon: CarFront,
  },
  {
    name: "My Bookings",
    href: "/my-bookings",
    icon: CalendarDays,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[250px] flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-[90px] items-center border-b border-gray-100 px-7">
        <Link href="/carpool" className="text-2xl font-bold tracking-tight">
          <span className="text-gray-900">Uni</span>
          <span className="text-[#009F9F]">Ryde</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-8">
        <p className="mb-5 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Main Menu
        </p>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-[#009F9F] text-white shadow-sm"
                    : "text-gray-600 hover:bg-teal-50 hover:text-[#009F9F]"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-100 p-4">
        <button onClick={() => void logout()} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-500">
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
}