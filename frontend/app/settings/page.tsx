"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  Clock,
  Save,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const PRESETS = [1, 2, 5, 10, 15, 30]

export default function SettingsPage() {
  const [savedInterval, setSavedInterval] = useState<number>(2)
  const [inputVal, setInputVal] = useState<string>("2")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.settings.get()
        setSavedInterval(data.poll_interval_minutes)
        setInputVal(String(data.poll_interval_minutes))
      } catch {
        setError("Could not load settings — is the backend running?")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const mins = parseInt(inputVal, 10)
    if (isNaN(mins) || mins < 1 || mins > 60) {
      setError("Interval must be between 1 and 60 minutes")
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await api.settings.update(mins)
      setSavedInterval(mins)
      setSuccess(
        `Polling interval updated to every ${mins} minute${mins !== 1 ? "s" : ""}. The scheduler is now live.`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const applyPreset = (mins: number) => {
    setInputVal(String(mins))
    setError(null)
    setSuccess(null)
  }

  const dirty = parseInt(inputVal, 10) !== savedInterval

  return (
    <div className="max-w-xl pt-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-100">
          <Settings className="h-6 w-6 text-zinc-400" />
          Settings
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          System configuration — changes apply immediately
        </p>
      </div>

      {/* Poll Interval Card */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-sky-400" />
            Tweet Poll Interval
          </CardTitle>
          <CardDescription>
            How often the background worker fetches tweets from twitterapi.io.
            Changing this reschedules the job instantly — no restart needed.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="h-9 animate-pulse rounded-lg bg-zinc-800" />
          ) : (
            <>
              {/* Quick presets */}
              <div>
                <p className="mb-2 text-xs font-medium text-zinc-500">
                  Quick presets
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => applyPreset(p)}
                      className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                        parseInt(inputVal, 10) === p
                          ? "border-sky-600 bg-sky-900/40 text-sky-300"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {p} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom input */}
              <form onSubmit={save}>
                <p className="mb-2 text-xs font-medium text-zinc-500">
                  Custom value (1 – 60 minutes)
                </p>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={inputVal}
                    onChange={(e) => {
                      setInputVal(e.target.value)
                      setError(null)
                      setSuccess(null)
                    }}
                    className="w-28"
                  />
                  <span className="text-sm text-zinc-500">minutes</span>
                  <Button
                    type="submit"
                    disabled={saving || !dirty}
                    size="sm"
                    className="ml-auto gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* Status messages */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-800/50 bg-red-950/30 px-3 py-2 text-xs text-red-300">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-300">
              <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {success}
            </div>
          )}

          {/* Current state */}
          {!loading && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
              <Info className="h-3 w-3" />
              Current saved value:{" "}
              <span className="font-medium text-zinc-400">
                every {savedInterval} minute{savedInterval !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Future settings placeholder */}
      <Card className="border-dashed opacity-50">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-500">
            More settings coming soon
          </CardTitle>
          <CardDescription className="text-xs">
            AI model selection, notification webhooks, data retention limits…
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
