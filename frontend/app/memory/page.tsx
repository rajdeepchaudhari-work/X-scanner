"use client"

import { useState, useEffect } from "react"
import { Brain, AlertCircle } from "lucide-react"
import { api, type MemoryEntry } from "@/lib/api"
import { MemoryCard } from "@/components/MemoryCard"

export default function MemoryPage() {
  const [entries, setEntries] = useState<MemoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.memory.get()
        setEntries(data.memory)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load memory")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="pt-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-100">
          <Brain className="h-6 w-6 text-purple-400" />
          Memory Viewer
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          AI interpretations and reasoning memory · {entries.length} entries
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-800/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Info callout */}
      <div className="mb-6 rounded-xl border border-purple-900/50 bg-purple-950/20 px-4 py-3 text-xs text-purple-300">
        Memory entries are written via{" "}
        <code className="font-mono text-purple-200">POST /memory</code> when an
        AI agent processes a tweet. Use{" "}
        <code className="font-mono text-purple-200">GET /tweets/new</code> to
        get unprocessed tweets.
      </div>

      {/* Loading skeletons */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-zinc-800" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-24 text-center">
          <Brain className="mb-3 h-8 w-8 text-zinc-700" />
          <p className="text-zinc-400">No memory entries yet</p>
          <p className="mt-1 text-xs text-zinc-600">
            POST to /memory once your AI agent processes a tweet
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {entries.map((entry) => (
            <MemoryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
