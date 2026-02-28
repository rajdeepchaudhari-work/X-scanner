"use client"

import { useState, useEffect } from "react"
import { BookOpen, ExternalLink, ChevronDown, ChevronRight, AlertCircle, Copy, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// ─── Types (minimal OpenAPI 3.x shape) ───────────────────────────────────────

interface OASchema {
  type?: string
  properties?: Record<string, OASchema>
  items?: OASchema
  $ref?: string
  description?: string
  minimum?: number
  maximum?: number
  default?: unknown
}

interface OAOperation {
  summary?: string
  description?: string
  tags?: string[]
  requestBody?: {
    content?: { "application/json"?: { schema?: OASchema } }
    required?: boolean
  }
  parameters?: Array<{
    name: string
    in: string
    required?: boolean
    description?: string
    schema?: OASchema
  }>
  responses?: Record<string, { description: string }>
}

interface OASpec {
  info: { title: string; version: string; description?: string }
  paths: Record<string, Record<string, OAOperation>>
  components?: { schemas?: Record<string, OASchema> }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const METHOD_STYLE: Record<string, string> = {
  get: "border-sky-700 bg-sky-900/50 text-sky-300",
  post: "border-emerald-700 bg-emerald-900/50 text-emerald-300",
  put: "border-amber-700 bg-amber-900/50 text-amber-300",
  delete: "border-red-700 bg-red-900/50 text-red-300",
  patch: "border-violet-700 bg-violet-900/50 text-violet-300",
}

function MethodBadge({ method }: { method: string }) {
  const cls =
    METHOD_STYLE[method.toLowerCase()] ??
    "border-zinc-700 bg-zinc-800 text-zinc-300"
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide ${cls}`}
    >
      {method.toUpperCase()}
    </span>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-700 hover:text-zinc-300"
      title="Copy"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-400" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  )
}

function SchemaView({ schema, schemas }: { schema: OASchema; schemas?: Record<string, OASchema> }) {
  if (!schema) return null

  // Resolve $ref
  if (schema.$ref && schemas) {
    const refName = schema.$ref.split("/").pop()!
    const resolved = schemas[refName]
    if (resolved) return <SchemaView schema={resolved} schemas={schemas} />
  }

  if (schema.properties) {
    return (
      <div className="space-y-1">
        {Object.entries(schema.properties).map(([key, val]) => (
          <div key={key} className="flex items-start gap-2 text-xs">
            <code className="font-mono text-sky-400">{key}</code>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-500">{val.type ?? "any"}</span>
            {val.description && (
              <span className="text-zinc-600">— {val.description}</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  return <span className="text-xs text-zinc-500">{schema.type ?? "any"}</span>
}

function EndpointRow({
  path,
  method,
  op,
  schemas,
}: {
  path: string
  method: string
  op: OAOperation
  schemas?: Record<string, OASchema>
}) {
  const [open, setOpen] = useState(false)
  const curlCmd = `curl -X ${method.toUpperCase()} ${API_BASE}${path}`

  return (
    <div className="border-b border-zinc-800/80 last:border-0">
      {/* Row header — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-800/30"
      >
        <MethodBadge method={method} />
        <code className="flex-1 truncate font-mono text-sm text-zinc-200">
          {path}
        </code>
        {op.summary && (
          <span className="hidden shrink-0 text-xs text-zinc-500 sm:block">
            {op.summary}
          </span>
        )}
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
        )}
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="space-y-4 border-t border-zinc-800/80 bg-zinc-900/60 px-4 py-4">
          {/* Description */}
          {op.description && (
            <p className="text-sm text-zinc-400">{op.description}</p>
          )}

          {/* Tags */}
          {op.tags && op.tags.length > 0 && (
            <div className="flex gap-1.5">
              {op.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs capitalize">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {/* Query/path parameters */}
          {op.parameters && op.parameters.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Parameters
              </p>
              <div className="space-y-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
                {op.parameters.map((p) => (
                  <div key={p.name} className="flex items-start gap-2 text-xs">
                    <code className="font-mono text-amber-400">{p.name}</code>
                    <Badge variant="outline" className="text-[9px]">
                      {p.in}
                    </Badge>
                    {p.required && (
                      <Badge variant="destructive" className="text-[9px]">
                        required
                      </Badge>
                    )}
                    {p.description && (
                      <span className="text-zinc-500">— {p.description}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request body */}
          {op.requestBody?.content?.["application/json"]?.schema && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Request Body
              </p>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
                <SchemaView
                  schema={op.requestBody.content["application/json"].schema}
                  schemas={schemas}
                />
              </div>
            </div>
          )}

          {/* Responses */}
          {op.responses && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Responses
              </p>
              <div className="space-y-1 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
                {Object.entries(op.responses).map(([code, res]) => (
                  <div key={code} className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-mono font-bold ${
                        code.startsWith("2")
                          ? "text-emerald-400"
                          : code.startsWith("4")
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {code}
                    </span>
                    <span className="text-zinc-500">{res.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* cURL snippet */}
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              cURL
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
              <code className="flex-1 truncate font-mono text-xs text-zinc-400">
                {curlCmd}
              </code>
              <CopyButton text={curlCmd} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function APIDocsPage() {
  const [spec, setSpec] = useState<OASpec | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/openapi.json`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setSpec(await res.json())
      } catch {
        setError(
          "Could not load OpenAPI spec — make sure the backend is running at " +
            API_BASE
        )
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Group endpoints by first tag
  const grouped: Record<
    string,
    Array<{ path: string; method: string; op: OAOperation }>
  > = {}

  if (spec) {
    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, op] of Object.entries(methods)) {
        const tag = op.tags?.[0] ?? "other"
        if (!grouped[tag]) grouped[tag] = []
        grouped[tag].push({ path, method, op })
      }
    }
  }

  const schemas = spec?.components?.schemas

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-100">
            <BookOpen className="h-6 w-6 text-amber-400" />
            API Reference
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Live from{" "}
            <code className="font-mono text-xs text-zinc-400">
              {API_BASE}/openapi.json
            </code>
          </p>
        </div>

        <a
          href={`${API_BASE}/docs`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Swagger UI
        </a>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-zinc-800" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Spec */}
      {spec && (
        <div className="space-y-5">
          {/* Info banner */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                {spec.info.title}
              </p>
              <p className="text-xs text-zinc-500">
                v{spec.info.version}
                {spec.info.description ? ` · ${spec.info.description}` : ""}
              </p>
            </div>
            <code className="font-mono text-xs text-zinc-600">{API_BASE}</code>
          </div>

          {/* Endpoint groups */}
          {Object.entries(grouped).map(([tag, endpoints]) => (
            <Card key={tag} className="overflow-hidden">
              <CardHeader className="border-b border-zinc-800 py-3">
                <CardTitle className="flex items-center gap-2 text-sm capitalize">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  {tag}
                  <span className="ml-auto font-normal text-zinc-600">
                    {endpoints.length} endpoint{endpoints.length !== 1 ? "s" : ""}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {endpoints.map(({ path, method, op }) => (
                  <EndpointRow
                    key={`${method}:${path}`}
                    path={path}
                    method={method}
                    op={op}
                    schemas={schemas}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
