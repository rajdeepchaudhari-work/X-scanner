"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Brain,
  Zap,
  Settings,
  BookOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { href: "/accounts", label: "Accounts", icon: Users, group: "main" },
  { href: "/memory", label: "Memory", icon: Brain, group: "main" },
  { href: "/api-docs", label: "API Docs", icon: BookOpen, group: "system" },
  { href: "/settings", label: "Settings", icon: Settings, group: "system" },
]

function NavLinks({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" })
    router.push("/login")
    router.refresh()
  }

  return (
    <>
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
              onClick={onNavigate}
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
              onClick={onNavigate}
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
      <div className="border-t border-zinc-800 p-4 space-y-3">
        <p className="text-[11px] font-medium text-zinc-500">X Scanner v1.0</p>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 transition-all hover:bg-zinc-800/60 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-60 lg:flex-col border-r border-zinc-800 bg-zinc-950">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-zinc-800 px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20">
            <Zap className="h-4 w-4 text-sky-400" />
          </div>
          <span className="font-bold tracking-tight text-zinc-100">X Scanner</span>
        </div>
        <NavLinks />
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20">
            <Zap className="h-4 w-4 text-sky-400" />
          </div>
          <span className="font-bold tracking-tight text-zinc-100">X Scanner</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20">
              <Zap className="h-4 w-4 text-sky-400" />
            </div>
            <span className="font-bold tracking-tight text-zinc-100">X Scanner</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <NavLinks onNavigate={() => setOpen(false)} />
      </div>
    </>
  )
}
