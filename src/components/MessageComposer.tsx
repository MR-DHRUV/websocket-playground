import {
  AlertCircle,
  BookmarkPlus,
  Check,
  CheckCircle2,
  FileCode,
  History,
  Minimize2,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react"
import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { PayloadTemplate } from "@/types/websocket"

interface MessageComposerProps {
  initialContent?: string
  isConnected: boolean
  onSendMessage: (payload: string) => boolean
  templates: PayloadTemplate[]
  onAddTemplate: (tpl: { name: string; payload: string; category?: "Custom" }) => void
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  initialContent = "",
  isConnected,
  onSendMessage,
  templates,
  onAddTemplate,
}) => {
  const [content, setContent] = useState<string>(
    initialContent ||
      JSON.stringify(
        {
          event: "message",
          text: "Hello WebSocket Server!",
          timestamp: Date.now(),
        },
        null,
        2,
      ),
  )
  const [mode, setMode] = useState<"json" | "text">("json")
  const [sentHistory, setSentHistory] = useState<string[]>([])
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent)
      try {
        JSON.parse(initialContent)
        setMode("json")
      } catch {
        setMode("text")
      }
    }
  }, [initialContent])

  // Validate JSON
  const jsonValidation = useMemo(() => {
    if (mode === "text") return { isValid: true, error: null }
    if (!content.trim()) return { isValid: true, error: null }
    try {
      JSON.parse(content)
      return { isValid: true, error: null }
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : "Invalid JSON syntax"
      return { isValid: false, error: err }
    }
  }, [content, mode])

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(content)
      setContent(JSON.stringify(parsed, null, 2))
    } catch {
      // ignore if invalid
    }
  }

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(content)
      setContent(JSON.stringify(parsed))
    } catch {
      // ignore if invalid
    }
  }

  const handleSend = () => {
    if (!content.trim()) return
    const success = onSendMessage(content)
    if (success) {
      setSentHistory((prev) => {
        const filtered = prev.filter((p) => p !== content)
        return [content, ...filtered].slice(0, 5)
      })
    }
  }

  const handleSaveAsTemplate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTemplateName.trim() || !content.trim()) return

    onAddTemplate({
      name: newTemplateName.trim(),
      payload: content,
      category: "Custom",
    })

    setSavedSuccess(true)
    setNewTemplateName("")
    setTimeout(() => {
      setSavedSuccess(false)
      setSavingTemplate(false)
    }, 1200)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/80 shadow-md flex flex-col h-full">
      <CardHeader className="py-3 px-4 border-b border-slate-800 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-sm font-semibold text-slate-200">Message Composer</CardTitle>
          <div className="flex items-center bg-slate-950 rounded-md p-0.5 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setMode("json")}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                mode === "json"
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              JSON
            </button>
            <button
              type="button"
              onClick={() => setMode("text")}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                mode === "text"
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Plain Text
            </button>
          </div>
        </div>

        {/* Validation indicator */}
        {mode === "json" && content.trim() && (
          <div className="flex items-center text-xs">
            {jsonValidation.isValid ? (
              <Badge
                variant="success"
                className="text-[10px] py-0 h-5 font-mono flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Valid JSON
              </Badge>
            ) : (
              <Badge
                variant="destructive"
                className="text-[10px] py-0 h-5 font-mono flex items-center gap-1 max-w-[200px] truncate"
                title={jsonValidation.error || "Invalid JSON"}
              >
                <AlertCircle className="w-3 h-3 text-rose-400" />
                Syntax Error
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 flex-1 flex flex-col space-y-2">
        {/* Templates bar */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="font-medium">Templates:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {templates.slice(0, 5).map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  setContent(tpl.payload)
                  try {
                    JSON.parse(tpl.payload)
                    setMode("json")
                  } catch {
                    setMode("text")
                  }
                }}
                className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                title={tpl.description || tpl.name}
              >
                {!tpl.isDefault && <span className="w-1 h-1 rounded-full bg-blue-400" />}
                {tpl.name}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setSavingTemplate(!savingTemplate)}
              className="px-2 py-0.5 rounded border border-dashed border-slate-700 hover:border-slate-500 text-[11px] text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              title="Save current payload as a template"
            >
              <BookmarkPlus className="w-3 h-3 text-blue-400" />
              Save
            </button>
          </div>
        </div>

        {/* Inline save template form */}
        {savingTemplate && (
          <form
            onSubmit={handleSaveAsTemplate}
            className="flex items-center gap-2 p-2 bg-slate-950/80 rounded-lg border border-slate-800"
          >
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Template name (e.g. My Ping Payload)"
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newTemplateName.trim() || !content.trim()}
              className="h-7 text-xs px-2.5 bg-blue-600 hover:bg-blue-500"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3 h-3 mr-1 text-emerald-400" /> Saved!
                </>
              ) : (
                "Save"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSavingTemplate(false)}
              className="h-7 text-xs px-2 text-slate-400"
            >
              Cancel
            </Button>
          </form>
        )}

        {/* Text Area */}
        <div className="flex-1 min-h-[160px] relative">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === "json" ? '{\n  "event": "test",\n  "data": {}\n}' : "Type message content..."
            }
            className="w-full h-full min-h-[170px] resize-y font-mono text-xs bg-slate-950/70 border-slate-800 focus:border-blue-500 text-slate-200"
          />
        </div>

        {/* Action bar under textarea */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5">
            {mode === "json" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFormat}
                  disabled={!jsonValidation.isValid}
                  className="h-7 text-xs px-2 text-slate-300 hover:text-white"
                  title="Format JSON (Indent 2 spaces)"
                >
                  <FileCode className="w-3.5 h-3.5 mr-1 text-blue-400" />
                  Format
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleMinify}
                  disabled={!jsonValidation.isValid}
                  className="h-7 text-xs px-2 text-slate-300 hover:text-white"
                  title="Minify JSON"
                >
                  <Minimize2 className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  Minify
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setContent("")}
              className="h-7 text-xs px-2 text-slate-400 hover:text-rose-400"
              title="Clear composer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              Ctrl+Enter to send
            </span>
            <Button
              type="button"
              onClick={handleSend}
              disabled={!isConnected || !content.trim()}
              className="h-8 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 text-xs shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </Button>
          </div>
        </div>

        {/* Recent sent history chips */}
        {sentHistory.length > 0 && (
          <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1.5 text-xs">
            <History className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="text-[10px] text-slate-500 font-medium">Recent:</span>
            <div className="flex flex-wrap gap-1 items-center flex-1 overflow-hidden">
              {sentHistory.map((item, idx) => {
                const preview = item.replace(/\s+/g, " ").slice(0, 30)
                return (
                  <button
                    key={`${preview}-${idx}`}
                    type="button"
                    onClick={() => setContent(item)}
                    className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60 truncate max-w-[140px]"
                    title={item}
                  >
                    {preview}...
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
