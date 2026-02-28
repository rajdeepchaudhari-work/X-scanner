"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, UserPlus, Users, AlertCircle, CheckCircle } from "lucide-react"
import { api, type Account } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadAccounts = async () => {
    try {
      const data = await api.accounts.get()
      setAccounts(data.accounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts")
    } finally {
      setLoading(false)
    }
  }

  const addAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = username.trim().replace(/^@/, "")
    if (!clean) return

    setAdding(true)
    setError(null)
    setSuccess(null)

    try {
      await api.accounts.add(clean)
      setSuccess(`@${clean} added successfully`)
      setUsername("")
      await loadAccounts()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add account")
    } finally {
      setAdding(false)
    }
  }

  const deleteAccount = async (u: string) => {
    setDeletingId(u)
    setError(null)
    try {
      await api.accounts.delete(u)
      setAccounts((prev) => prev.filter((a) => a.username !== u))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account")
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  const queryPreview =
    accounts.length > 0
      ? `(${accounts.map((a) => `from:${a.username}`).join(" OR ")})`
      : null

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Account Manager</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Manage which Twitter/X accounts to monitor
        </p>
      </div>

      {/* Add Account Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4 text-sky-400" />
            Add Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addAccount} className="flex gap-3">
            <Input
              placeholder="@username or username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={adding}
              className="flex-1"
            />
            <Button type="submit" disabled={adding || !username.trim()}>
              <Plus className="mr-1.5 h-4 w-4" />
              {adding ? "Adding..." : "Add"}
            </Button>
          </form>

          {error && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </div>
          )}
          {success && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-green-400">
              <CheckCircle className="h-3.5 w-3.5" />
              {success}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accounts List */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Monitored Accounts
        </h2>
        <span className="text-xs text-zinc-600">
          <Users className="mr-1 inline h-3 w-3" />
          {accounts.length} account{accounts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-800" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-12 text-center">
          <Users className="mx-auto mb-2 h-6 w-6 text-zinc-700" />
          <p className="text-sm text-zinc-500">No accounts added yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map((account) => (
            <div
              key={account.username}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-zinc-100">
                  @{account.username}
                </p>
                <p className="text-xs text-zinc-500">
                  Added {new Date(account.added_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteAccount(account.username)}
                disabled={deletingId === account.username}
                className="text-zinc-600 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Query preview */}
      {queryPreview && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="mb-1.5 text-xs font-medium text-zinc-500">
            Active search query:
          </p>
          <code className="font-mono text-xs text-sky-400 break-all">
            {queryPreview}
          </code>
        </div>
      )}
    </div>
  )
}
