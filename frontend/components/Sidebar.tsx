"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Brain, Zap, Settings, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { href: "/accounts", label: "Accounts", icon: Users, group: "main" },
  { href: "/memory", label: "Memory", icon: Brain, group: "main" },
  { href: "/api-docs", label: "API Docs", icon: BookOpen, group: "system" },
  { href: "/settings", label: "Settings", icon: Settings, group: "system" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-zinc-800 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20">
          <Zap className="h-4 w-4 text-sky-400" />
        </div>
        <span className="font-bold tracking-tight text-zinc-100">
          X Scanner
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Main
        </p>
        {NAV_ITEMS.filter((i) => i.group === "main").map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-sky-400" : "text-zinc-600 group-hover:text-zinc-400"
                )}
              />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sky-400" />
              )}
            </Link>
          )
        })}

        <div className="my-3 border-t border-zinc-800/60" />

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          System
        </p>
        {NAV_ITEMS.filter((i) => i.group === "system").map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-sky-400" : "text-zinc-600 group-hover:text-zinc-400"
                )}
              />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sky-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800 p-4">
        <p className="text-[11px] font-medium text-zinc-500">X Scanner v1.0</p>
        <p className="text-[10px] text-zinc-700">
          Poll interval configurable in Settings
        </p>
      </div>
    </aside>
  )
}
