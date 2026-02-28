import { type MemoryEntry } from "@/lib/api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

function importanceBadge(
  score: number
): "success" | "warning" | "destructive" | "secondary" {
  if (score >= 0.75) return "success"
  if (score >= 0.45) return "warning"
  if (score >= 0.2) return "secondary"
  return "destructive"
}

function importanceLabel(score: number): string {
  if (score >= 0.75) return "High"
  if (score >= 0.45) return "Medium"
  if (score >= 0.2) return "Low"
  return "Minimal"
}

interface MemoryCardProps {
  entry: MemoryEntry
}

export function MemoryCard({ entry }: MemoryCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            {entry.tweet_author && (
              <p className="text-sm font-semibold text-zinc-100">
                @{entry.tweet_author}
              </p>
            )}
            <p className="text-xs text-zinc-500">{formatDate(entry.created_at)}</p>
          </div>
          <Badge variant={importanceBadge(entry.importance)} className="shrink-0">
            {importanceLabel(entry.importance)} ·{" "}
            {Math.round(entry.importance * 100)}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Original tweet excerpt */}
        {entry.tweet_text && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-800/40 px-3 py-2">
            <p className="line-clamp-2 text-xs text-zinc-400">
              {entry.tweet_text}
            </p>
          </div>
        )}

        {/* Interpretation */}
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Interpretation
          </p>
          <p className="text-sm text-zinc-300">{entry.interpretation}</p>
        </div>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
