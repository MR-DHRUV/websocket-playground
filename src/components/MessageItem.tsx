import { AlertTriangle, ArrowDownLeft, ArrowRightCircle, ArrowUpRight, Info } from "lucide-react"
import type React from "react"
import { JsonViewer } from "@/components/JsonViewer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { WebSocketMessage } from "@/types/websocket"

interface MessageItemProps {
  message: WebSocketMessage
  onLoadIntoComposer?: (content: string) => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

function formatTimestamp(date: Date): string {
  const pad = (n: number, s = 2) => String(n).padStart(s, "0")
  const h = pad(date.getHours())
  const m = pad(date.getMinutes())
  const s = pad(date.getSeconds())
  const ms = pad(date.getMilliseconds(), 3)
  return `${h}:${m}:${s}.${ms}`
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onLoadIntoComposer }) => {
  const getBadge = () => {
    switch (message.direction) {
      case "incoming":
        return (
          <Badge
            variant="success"
            className="flex items-center gap-1 font-mono text-[11px] font-medium"
          >
            <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
            RX (Received)
          </Badge>
        )
      case "outgoing":
        return (
          <Badge
            variant="default"
            className="flex items-center gap-1 font-mono text-[11px] font-medium bg-blue-600/20 text-blue-400 border-blue-500/30"
          >
            <ArrowUpRight className="w-3 h-3 text-blue-400" />
            TX (Sent)
          </Badge>
        )
      case "error":
        return (
          <Badge
            variant="destructive"
            className="flex items-center gap-1 font-mono text-[11px] font-medium"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            ERROR
          </Badge>
        )
      default:
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 font-mono text-[11px] font-medium bg-slate-800 text-slate-300 border-slate-700"
          >
            <Info className="w-3 h-3 text-sky-400" />
            SYSTEM
          </Badge>
        )
    }
  }

  const isSystemOrError = message.direction === "system" || message.direction === "error"

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        message.direction === "incoming"
          ? "border-emerald-900/30 bg-emerald-950/10 hover:border-emerald-800/50"
          : message.direction === "outgoing"
            ? "border-blue-900/30 bg-blue-950/10 hover:border-blue-800/50"
            : message.direction === "error"
              ? "border-rose-900/30 bg-rose-950/15"
              : "border-slate-800/60 bg-slate-900/40"
      }`}
    >
      {/* Message top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/60 text-xs">
        <div className="flex items-center gap-2">
          {getBadge()}
          <span className="font-mono text-slate-400 text-[11px]">
            {formatTimestamp(message.timestamp)}
          </span>
          <span className="font-mono text-slate-500 text-[10px] bg-slate-800/60 px-1.5 py-0.5 rounded">
            {formatBytes(message.sizeBytes)}
          </span>
          {message.isJson && (
            <span className="font-mono text-[10px] text-purple-300 bg-purple-950/50 border border-purple-800/40 px-1.5 py-0.5 rounded">
              JSON
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onLoadIntoComposer && !isSystemOrError && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onLoadIntoComposer(message.content)}
              className="h-6 px-2 text-[11px] text-slate-400 hover:text-slate-100"
              title="Load message into message composer"
            >
              <ArrowRightCircle className="w-3 h-3 mr-1" />
              Use in Composer
            </Button>
          )}
        </div>
      </div>

      {/* Message Body */}
      {isSystemOrError ? (
        <div
          className={`font-mono text-xs ${
            message.direction === "error" ? "text-rose-400" : "text-slate-300"
          }`}
        >
          {message.content}
        </div>
      ) : (
        <JsonViewer
          data={message.content}
          initialViewMode={message.isJson ? "parsed" : "raw"}
          maxHeight="max-h-[380px]"
        />
      )}
    </div>
  )
}
