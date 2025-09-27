"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import Link from "next/link";

interface User {
  email: string;
  points: number;
  tier: "free" | "premium" | "unlimited";
}

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const [signingOut, setSigningOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Error signing out:", error);
      setSigningOut(false);
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "🎯" },
    { href: "/tasks", label: "Tasks", icon: "📋" },
    { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ];

  const isActivePath = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const getTierBadge = (tier: string) => {
    const badges = {
      free: { label: "Free", color: "bg-gray-100 text-gray-700" },
      premium: { label: "Premium", color: "bg-blue-100 text-blue-700" },
      unlimited: { label: "Pro", color: "bg-purple-100 text-purple-700" },
    };
    return badges[tier as keyof typeof badges] || badges.free;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl">🎯</span>
            <h1 className="text-2xl font-bold text-gray-900">TaskBounty</h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePath(item.href)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                {/* Points Display */}
                <div className="hidden sm:flex items-center space-x-1 text-sm">
                  <span className="text-yellow-500">⚡</span>
                  <span className="font-medium text-gray-700">
                    {user.points.toLocaleString()}
                  </span>
                </div>

                {/* Tier Badge */}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    getTierBadge(user.tier).color
                  }`}
                >
                  {getTierBadge(user.tier).label}
                </span>
              </div>

              {/* User Avatar */}
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Dropdown Arrow */}
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  showUserMenu ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {user.email}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {user.points.toLocaleString()} points
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getTierBadge(user.tier).color
                      }`}
                    >
                      {getTierBadge(user.tier).label}
                    </span>
                  </div>
                </div>

                {/* Mobile Navigation (shown on mobile) */}
                <div className="md:hidden border-b border-gray-200">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowUserMenu(false)}
                      className={`flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 ${
                        isActivePath(item.href)
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-700"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <span>⚙️</span>
                    <span>Settings</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <span>📊</span>
                    <span>View Stats</span>
                  </Link>

                  {user.tier === "free" && (
                    <Link
                      href="/profile?tab=upgrade"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                    >
                      <span>⭐</span>
                      <span>Upgrade Plan</span>
                    </Link>
                  )}
                </div>

                {/* Sign Out */}
                <div className="border-t border-gray-200 pt-1">
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>🚪</span>
                    <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
