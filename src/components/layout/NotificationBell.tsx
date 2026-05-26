"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

interface NotificationBellProps {
  initialUnread: number;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const TYPE_COLORS: Record<string, string> = {
  quotation_accepted: "bg-teal/20 text-teal",
  payment_received: "bg-green-500/20 text-green-400",
  info: "bg-gray-500/20 text-gray-400",
};

export default function NotificationBell({ initialUnread }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(initialUnread);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const n = payload.new as Notification;
          setUnread((prev) => prev + 1);
          setNotifications((prev) => [n, ...prev]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadNotifications() {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, body, link, read, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotifications(data as Notification[]);
    setLoaded(true);
  }

  async function markAllRead() {
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleOpen() {
    setOpen(true);
    if (!loaded) loadNotifications();
    if (unread > 0) markAllRead();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-1.5 rounded-lg text-gray-500 hover:text-teal hover:bg-card transition-colors"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-teal text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-9 right-0 w-80 bg-sidebar border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Notifications</p>
            <div className="flex items-center gap-1">
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={markAllRead}
                  className="p-1 rounded text-gray-500 hover:text-teal transition-colors"
                  title="Mark all read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded text-gray-500 hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {!loaded ? (
              <div className="px-4 py-8 text-center text-xs text-gray-500">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-gray-500">No notifications yet</div>
            ) : (
              notifications.map((n) => {
                const dot = TYPE_COLORS[n.type] ?? TYPE_COLORS.info;
                const content = (
                  <div
                    className={cn(
                      "px-4 py-3 border-b border-border/50 hover:bg-card/50 transition-colors",
                      !n.read && "bg-teal/5"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span className={cn("mt-0.5 h-2 w-2 rounded-full shrink-0", dot.split(" ")[0])} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-medium leading-snug", n.read ? "text-gray-400" : "text-foreground")}>
                          {n.title}
                        </p>
                        {n.body && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>}
                        <p className="text-[10px] text-gray-600 mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  </div>
                );

                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
