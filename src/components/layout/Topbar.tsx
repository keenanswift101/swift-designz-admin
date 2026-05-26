"use client";

import { useState } from "react";
import { LogOut, Sun, Moon, Menu } from "lucide-react";
import { flushSync } from "react-dom";
import { signOut } from "@/app/auth/actions";
import { useTheme } from "@/components/ThemeProvider";
import NotificationBell from "./NotificationBell";
import type { Profile } from "@/types/database";

interface TopbarProps {
  profile: Profile | null;
  unreadNotifications: number;
  onMobileMenuOpen: () => void;
}

export default function Topbar({ profile, unreadNotifications, onMobileMenuOpen }: TopbarProps) {
  const { theme, toggle: toggleTheme } = useTheme();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    flushSync(() => setSigningOut(true));
    await signOut();
  }

  const initials = profile?.full_name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-14 z-20 flex items-center px-4 lg:px-6 gap-3 bg-sidebar/90 backdrop-blur-md border-b border-border">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-foreground hover:bg-card transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-1">
        <NotificationBell initialUnread={unreadNotifications} />

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-gray-500 hover:text-teal hover:bg-card transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* User pill */}
        <div className="flex items-center gap-2 pl-1">
          <div className="h-7 w-7 rounded-full bg-teal/20 flex items-center justify-center text-teal text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-foreground leading-tight">{profile?.full_name ?? "User"}</p>
            <p className="text-[10px] text-gray-500 capitalize leading-tight">{profile?.role ?? "admin"}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-card transition-colors disabled:opacity-50"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
