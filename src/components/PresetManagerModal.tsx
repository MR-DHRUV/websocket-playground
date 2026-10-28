import { BookmarkPlus, Check, FileText, Link2, RotateCcw, Trash2, X } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { PresetEndpoint } from "@/types/websocket"

interface PresetManagerModalProps {
  isOpen: boolean
  onClose: () => void
  currentUrl: string
  currentPayload?: string
  presets: PresetEndpoint[]
  onAddPreset: (preset: {
    name: string
    url: string
    description?: string
    defaultPayload?: string
  }) => void
  onDeletePreset: (id: string) => void
  onResetDefaults: () => void
  onSelectPreset: (url: string, defaultPayload?: string) => void
}

export const PresetManagerModal: React.FC<PresetManagerModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  currentPayload,
  presets,
  onAddPreset,
  onDeletePreset,
  onResetDefaults,
  onSelectPreset,
}) => {
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create")
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [defaultPayload, setDefaultPayload] = useState("")
  const [successNotice, setSuccessNotice] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setUrl(currentUrl || "ws://localhost:8080")
      setDefaultPayload(currentPayload || "")
      setName("")
      setDescription("")
      setFormError(null)
      setSuccessNotice(false)
    }
  }, [isOpen, currentUrl, currentPayload])

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setFormError("Please enter a preset name.")
      return
    }
    if (!url.trim()) {
      setFormError("Please enter a WebSocket URL.")
      return
    }
    if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
      setFormError("WebSocket URL must start with ws:// or wss://")
      return
    }

    onAddPreset({
      name: name.trim(),
      url: url.trim(),
      description: description.trim() || undefined,
      defaultPayload: defaultPayload.trim() || undefined,
    })

    setSuccessNotice(true)
    setTimeout(() => {
      setSuccessNotice(false)
      setActiveTab("manage")
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <BookmarkPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Preset Endpoints</h2>
              <p className="text-xs text-slate-400">
                Save &amp; manage your favorite WebSocket endpoints locally
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`pb-2 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "create"
                ? "border-blue-500 text-blue-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            + Create New Preset
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manage")}
            className={`pb-2 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "manage"
                ? "border-blue-500 text-blue-400 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Saved Presets
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-slate-800">
              {presets.length}
            </Badge>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === "create" ? (
            <form onSubmit={handleSave} className="space-y-3.5">
              {formError && (
                <div className="p-2.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-md">
                  {formError}
                </div>
              )}

              {successNotice && (
                <div className="p-2.5 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 rounded-md flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Preset saved to local storage!
                </div>
              )}

              <div className="space-y-1">
                <label
                  htmlFor="preset-name"
                  className="text-xs font-medium text-slate-300 flex items-center gap-1.5"
                >
                  Preset Name <span className="text-rose-400">*</span>
                </label>
                <Input
                  id="preset-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Local Gateway, Staging Service, Echo Test"
                  className="bg-slate-950/80 border-slate-800 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="preset-url"
                  className="text-xs font-medium text-slate-300 flex items-center gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5 text-slate-400" />
                  WebSocket URL <span className="text-rose-400">*</span>
                </label>
                <Input
                  id="preset-url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="ws://localhost:8080/ws or wss://api.example.com/live"
                  className="bg-slate-950/80 border-slate-800 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="preset-description"
                  className="text-xs font-medium text-slate-300 flex items-center gap-1.5"
                >
                  Description <span className="text-slate-500 text-[10px]">(Optional)</span>
                </label>
                <Input
                  id="preset-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief note about this endpoint"
                  className="bg-slate-950/80 border-slate-800 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="preset-payload"
                  className="text-xs font-medium text-slate-300 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Default Initial Payload{" "}
                  <span className="text-slate-500 text-[10px]">(Optional JSON or text)</span>
                </label>
                <Textarea
                  id="preset-payload"
                  value={defaultPayload}
                  onChange={(e) => setDefaultPayload(e.target.value)}
                  placeholder='{\n  "action": "subscribe"\n}'
                  rows={3}
                  className="bg-slate-950/80 border-slate-800 font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4"
                >
                  Save to Local Storage
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>Stored Endpoints ({presets.length})</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onResetDefaults}
                  className="h-6 text-[11px] text-slate-400 hover:text-slate-200"
                  title="Reset list back to built-in presets"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset Defaults
                </Button>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-800/80 bg-slate-950/60 hover:border-slate-700/80 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-200 truncate">
                          {preset.name}
                        </span>
                        {preset.isDefault ? (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1.5 py-0 h-4 bg-slate-800 text-slate-400"
                          >
                            Built-in
                          </Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="text-[9px] px-1.5 py-0 h-4 bg-blue-900/30 text-blue-400 border-blue-800/40"
                          >
                            Custom
                          </Badge>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-blue-400/90 truncate mt-0.5">
                        {preset.url}
                      </div>
                      {preset.description && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {preset.description}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onSelectPreset(preset.url, preset.defaultPayload)
                          onClose()
                        }}
                        className="h-7 text-xs px-2.5 text-slate-300 hover:text-white"
                      >
                        Load
                      </Button>
                      {!preset.isDefault && (
                        <button
                          type="button"
                          onClick={() => onDeletePreset(preset.id)}
                          title="Delete custom preset"
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
