import {
  Activity,
  Clock,
  PlusCircle,
  Radio,
  RefreshCw,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { ConnectionStatus, PresetEndpoint } from "@/types/websocket"

interface ConnectionBarProps {
  url: string
  onUrlChange: (url: string) => void
  status: ConnectionStatus
  errorDetails: string | null
  uptimeSeconds: number
  stats: {
    sentCount: number
    receivedCount: number
    sentBytes: number
    receivedBytes: number
  }
  autoReconnect: boolean
  onToggleAutoReconnect: (val: boolean) => void
  onConnect: () => void
  onDisconnect: () => void
  presets: PresetEndpoint[]
  onSelectPreset: (url: string, defaultPayload?: string) => void
  onOpenPresetModal: () => void
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}m ${s < 10 ? "0" : ""}${s}s`
}

export const ConnectionBar: React.FC<ConnectionBarProps> = ({
  url,
  onUrlChange,
  status,
  errorDetails,
  uptimeSeconds,
  stats,
  autoReconnect,
  onToggleAutoReconnect,
  onConnect,
  onDisconnect,
  presets,
  onSelectPreset,
  onOpenPresetModal,
}) => {
  const isConnected = status === "CONNECTED"
  const isConnecting = status === "CONNECTING"

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isConnected && !isConnecting) {
      onConnect()
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/80 shadow-lg mb-4">
      <CardContent className="p-4 space-y-3">
        {/* Top row: Status, URL Input, Connect / Disconnect Action */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Status Indicator */}
          <div className="flex items-center gap-2 min-w-[140px]">
            <span className="relative flex h-3 w-3">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              {isConnecting && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isConnected
                    ? "bg-emerald-500 shadow-emerald-500/50 shadow-sm"
                    : isConnecting
                      ? "bg-amber-500"
                      : status === "ERROR"
                        ? "bg-rose-500"
                        : "bg-slate-600"
                }`}
              />
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-300">
              {status}
            </span>
          </div>

          {/* URL Input */}
          <div className="flex-1 relative flex items-center">
            <Radio className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <Input
              type="text"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isConnected || isConnecting}
              placeholder="ws://localhost:8080/ws or wss://echo.websocket.events"
              className="pl-9 pr-3 text-sm h-10 bg-slate-950/70 border-slate-700/80 focus:border-blue-500"
            />
          </div>

          {/* Connect / Disconnect Buttons */}
          <div className="flex items-center gap-2">
            {!isConnected && !isConnecting ? (
              <Button
                type="button"
                onClick={onConnect}
                className="h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-2 shadow-sm"
              >
                <Wifi className="w-4 h-4" />
                Connect
              </Button>
            ) : isConnecting ? (
              <Button
                type="button"
                disabled
                className="h-10 px-5 bg-amber-600/80 text-white font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                Connecting...
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                onClick={onDisconnect}
                className="h-10 px-5 flex items-center gap-2 bg-rose-600 hover:bg-rose-500 shadow-sm"
              >
                <WifiOff className="w-4 h-4" />
                Disconnect
              </Button>
            )}
          </div>
        </div>

        {/* Error message alert */}
        {errorDetails && (
          <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-md p-2 flex items-center gap-2">
            <span className="font-semibold">Connection Error:</span> {errorDetails}
          </div>
        )}

        {/* Bottom row: Presets list + Manage button, Auto-reconnect switch, Live stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-[280px]">
            <span className="text-slate-400 flex items-center gap-1 font-medium mr-1 text-[11px]">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Presets:
            </span>
            {presets.slice(0, 5).map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSelectPreset(preset.url, preset.defaultPayload)}
                className={`h-7 text-xs px-2.5 rounded-full border-slate-700 bg-slate-800/40 hover:bg-slate-750 text-slate-300 hover:text-white transition-all ${
                  url === preset.url
                    ? "border-blue-500/80 text-blue-400 bg-blue-950/40 font-medium"
                    : ""
                }`}
                title={preset.description || preset.url}
              >
                {!preset.isDefault && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5" />
                )}
                {preset.name}
              </Button>
            ))}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenPresetModal}
              className="h-7 text-xs px-2 text-slate-400 hover:text-white flex items-center gap-1 rounded-full border border-dashed border-slate-700/80 hover:border-slate-500"
              title="Add a custom endpoint preset or manage saved endpoints"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Save / Manage</span>
            </Button>
          </div>

          {/* Auto reconnect toggle & stats */}
          <div className="flex items-center gap-4 ml-auto">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-200 text-xs">
              <input
                type="checkbox"
                checked={autoReconnect}
                onChange={(e) => onToggleAutoReconnect(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Auto-reconnect</span>
            </label>

            {isConnected && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-800 font-mono text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Clock className="w-3 h-3" />
                  {formatDuration(uptimeSeconds)}
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-slate-500" />
                  Rx: {stats.receivedCount} | Tx: {stats.sentCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
