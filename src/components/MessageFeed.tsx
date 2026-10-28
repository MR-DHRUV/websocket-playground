import {
  ArrowUpDown,
  Download,
  Lock,
  Radio,
  Search,
  SlidersHorizontal,
  Trash2,
  Unlock,
} from "lucide-react"
import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { MessageItem } from "@/components/MessageItem"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { MessageDirection, WebSocketMessage } from "@/types/websocket"

interface MessageFeedProps {
  messages: WebSocketMessage[]
  onClear: () => void
  onLoadIntoComposer?: (content: string) => void
}

export const MessageFeed: React.FC<MessageFeedProps> = ({
  messages,
  onClear,
  onLoadIntoComposer,
}) => {
  const [filterDirection, setFilterDirection] = useState<"all" | MessageDirection>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"newest-first" | "oldest-first">("oldest-first")
  const [autoScroll, setAutoScroll] = useState<boolean>(true)

  const feedContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when messages change if autoScroll is enabled
  useEffect(() => {
    if (messages.length > 0 && autoScroll && feedContainerRef.current) {
      if (sortOrder === "oldest-first") {
        feedContainerRef.current.scrollTop = feedContainerRef.current.scrollHeight
      } else {
        feedContainerRef.current.scrollTop = 0
      }
    }
  }, [messages, autoScroll, sortOrder])

  // Count by direction
  const counts = useMemo(() => {
    let rx = 0
    let tx = 0
    let sys = 0
    for (const m of messages) {
      if (m.direction === "incoming") rx++
      else if (m.direction === "outgoing") tx++
      else sys++
    }
    return { all: messages.length, rx, tx, sys }
  }, [messages])

  // Filter and sort messages
  const filteredMessages = useMemo(() => {
    let list = messages

    if (filterDirection !== "all") {
      if (filterDirection === "system") {
        list = list.filter((m) => m.direction === "system" || m.direction === "error")
      } else {
        list = list.filter((m) => m.direction === filterDirection)
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((m) => m.content.toLowerCase().includes(q))
    }

    if (sortOrder === "newest-first") {
      return [...list].reverse()
    }

    return list
  }, [messages, filterDirection, searchQuery, sortOrder])

  const exportLogs = () => {
    const exportData = messages.map((m) => ({
      id: m.id,
      direction: m.direction,
      timestamp: m.timestamp.toISOString(),
      content: m.isJson ? m.parsedJson : m.content,
      sizeBytes: m.sizeBytes,
    }))

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `websocket-log-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="border-slate-800 bg-slate-900/80 shadow-md flex flex-col h-full">
      {/* Top Header & Filters */}
      <CardHeader className="py-3 px-4 border-b border-slate-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              Message Stream
            </CardTitle>
            <Badge variant="secondary" className="font-mono text-xs px-2 py-0">
              {messages.length} total
            </Badge>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              className={`h-7 text-xs px-2 ${
                autoScroll
                  ? "border-emerald-700/60 text-emerald-400 bg-emerald-950/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title={autoScroll ? "Pause auto-scroll" : "Enable auto-scroll"}
            >
              {autoScroll ? (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Auto-scroll ON
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 mr-1" />
                  Auto-scroll OFF
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setSortOrder(sortOrder === "oldest-first" ? "newest-first" : "oldest-first")
              }
              className="h-7 text-xs px-2 text-slate-300 hover:text-white"
              title="Toggle sort order (Newest first / Oldest first)"
            >
              <ArrowUpDown className="w-3 h-3 mr-1" />
              {sortOrder === "oldest-first" ? "Chronological" : "Newest Top"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={messages.length === 0}
              onClick={exportLogs}
              className="h-7 text-xs px-2 text-slate-300 hover:text-white"
              title="Export all logs as JSON file"
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={messages.length === 0}
              onClick={onClear}
              className="h-7 text-xs px-2 text-slate-400 hover:text-rose-400"
              title="Clear all messages"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 text-xs">
          {/* Direction filters */}
          <div className="flex items-center gap-1 bg-slate-950 rounded-md p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setFilterDirection("all")}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                filterDirection === "all"
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All
              <span className="text-[10px] opacity-80">({counts.all})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterDirection("incoming")}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                filterDirection === "incoming"
                  ? "bg-emerald-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Received
              <span className="text-[10px] opacity-80">({counts.rx})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterDirection("outgoing")}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                filterDirection === "outgoing"
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sent
              <span className="text-[10px] opacity-80">({counts.tx})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterDirection("system")}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                filterDirection === "system"
                  ? "bg-slate-700 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              System
              <span className="text-[10px] opacity-80">({counts.sys})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter messages..."
              className="h-8 pl-8 text-xs bg-slate-950/80 border-slate-800 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Message List */}
      <CardContent className="p-3 flex-1 overflow-hidden flex flex-col">
        <div
          ref={feedContainerRef}
          className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[calc(100vh-360px)] min-h-[350px]"
        >
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
              <SlidersHorizontal className="w-10 h-10 mb-3 text-slate-600 opacity-60" />
              <p className="text-sm font-medium text-slate-400">No messages to display</p>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">
                {messages.length === 0
                  ? "Connect to a WebSocket server above and send a message or wait for incoming market data."
                  : "No messages match your active filter or search query."}
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <MessageItem key={msg.id} message={msg} onLoadIntoComposer={onLoadIntoComposer} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
