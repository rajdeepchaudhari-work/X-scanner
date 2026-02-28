import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/Sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "X Scanner",
  description: "Twitter AI Monitoring Dashboard",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen`}>
        <Sidebar />
        {/* Desktop: offset for fixed sidebar; Mobile: offset for top bar */}
        <main className="lg:ml-60 pt-14 lg:pt-0 min-h-screen p-4 lg:p-6">
          {children}
        </main>
      </body>
    </html>
  )
}
