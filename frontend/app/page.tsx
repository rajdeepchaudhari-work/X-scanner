"use client"

import { useState, useEffect, useCallback } from "react"
import { RefreshCw, Radio, AlertCircle } from "lucide-react"
import { api, type Tweet } from "@/lib/api"
import { TweetCard } from "@/components/TweetCard"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [fetchResult, setFetchResult] = useState<{
    fetched: number
    stored_new: number
  } | null>(null)

  const loadTweets = useCallback(async () => {
    try {
      const data = await api.tweets.getNew()
      setTweets(data.tweets)
      setLastRefresh(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tweets")
    } finally {
      setLoading(false)
    }
  }, [])

  const triggerFetch = async () => {
    setFetching(true)
    setFetchResult(null)
    try {
      const result = await api.fetch.trigger()
      setFetchResult(result)
      await loadTweets()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fetch failed")
    } finally {
      setFetching(false)
    }
  }

  // Auto-refresh every 5 seconds
  useEffect(() => {
    loadTweets()
    const interval = setInterval(loadTweets, 5_000)
    return () => clearInterval(interval)
  }, [loadTweets])

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Tweet Feed</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Showing unprocessed tweets · auto-refreshes every 5s
            {lastRefresh && (
              <span className="ml-1">
                · updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {fetchResult && (
            <span className="text-xs text-zinc-400">
              {fetchResult.fetched} fetched · {fetchResult.stored_new} new
            </span>
          )}
          <Button
            onClick={triggerFetch}
            disabled={fetching}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${fetching ? "animate-spin" : ""}`}
            />
            {fetching ? "Fetching..." : "Fetch Now"}
          </Button>
        </div>
      </div>

      {/* Live badge */}
      <div className="mb-5 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        <span className="text-xs font-medium text-green-400">Live</span>
        <span className="text-xs text-zinc-500">
          {tweets.length} unprocessed tweet{tweets.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-800/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Skeleton loading */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-xl bg-zinc-800"
            />
          ))}
        </div>
      ) : tweets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-24 text-center">
          <Radio className="mb-3 h-8 w-8 text-zinc-700" />
          <p className="text-zinc-400">No new tweets</p>
          <p className="mt-1 text-xs text-zinc-600">
            Click &quot;Fetch Now&quot; or add accounts on the Accounts page
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
        </div>
      )}
    </div>
  )
}
