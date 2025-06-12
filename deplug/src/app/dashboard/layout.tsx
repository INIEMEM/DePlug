'use client';
import Link from "next/link";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiUser,
  FiLogOut
} from "react-icons/fi";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const navItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: <FiHome size={20} />,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: <FiUser size={20} />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col w-48 h-screen bg-gray-100 p-4 fixed top-0 left-0">
        <div className="space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 p-2 rounded hover:bg-gray-200 ${
                pathname === item.href ? "bg-gray-300 font-semibold" : ""
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 p-2 text-red-500 hover:bg-red-100 rounded"
          >
            <FiLogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Bottom Nav for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-t-slate-400 shadow-md p-2 flex justify-around items-center md:hidden z-50">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center text-sm ${
              pathname === item.href ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-sm text-red-500"
        >
          <FiLogOut size={20} />
          Logout
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-48 p-4 pt-6 pb-20 md:pb-4">
        {children}
      </main>
    </div>
  );
}
