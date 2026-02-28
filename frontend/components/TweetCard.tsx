import { type Tweet } from "@/lib/api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

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

function avatarInitials(author: string): string {
  return author.slice(0, 2).toUpperCase()
}

// Deterministic avatar color from username
const AVATAR_COLORS = [
  "bg-sky-500/20 text-sky-400",
  "bg-violet-500/20 text-violet-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-amber-500/20 text-amber-400",
  "bg-rose-500/20 text-rose-400",
  "bg-cyan-500/20 text-cyan-400",
]

function avatarColor(author: string): string {
  const idx =
    author.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

interface TweetCardProps {
  tweet: Tweet
}

export function TweetCard({ tweet }: TweetCardProps) {
  return (
    <Card className="flex flex-col transition-all hover:border-zinc-700">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          {/* Avatar + author */}
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(tweet.author)}`}
            >
              {avatarInitials(tweet.author)}
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-zinc-100">
                {tweet.author}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">@{tweet.author}</p>
            </div>
          </div>

          {/* Timestamp */}
          <span className="shrink-0 text-xs text-zinc-600">
            {formatDate(tweet.created_at)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm leading-relaxed text-zinc-300">{tweet.text}</p>
      </CardContent>
    </Card>
  )
}
