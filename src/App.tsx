import { Activity, BookmarkCheck, Globe, ShieldCheck, Terminal } from "lucide-react"
import { useState } from "react"
import { ConnectionBar } from "@/components/ConnectionBar"
import { MessageComposer } from "@/components/MessageComposer"
import { MessageFeed } from "@/components/MessageFeed"
import { PresetManagerModal } from "@/components/PresetManagerModal"
import { usePresets } from "@/hooks/usePresets"
import { useWebSocketClient } from "@/hooks/useWebSocketClient"

export function App() {
  const [autoReconnect, setAutoReconnect] = useState(false)
  const [composerPayload, setComposerPayload] = useState<string>("")
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false)

  const { presets, templates, addPreset, deletePreset, resetPresetsToDefault, addTemplate } =
    usePresets()

  const {
    url,
    setUrl,
    status,
    errorDetails,
    messages,
    stats,
    uptimeSeconds,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  } = useWebSocketClient({
    autoReconnect,
    reconnectIntervalMs: 3000,
    maxReconnectAttempts: 5,
  })

  const handleSelectPreset = (presetUrl: string, defaultPayload?: string) => {
    setUrl(presetUrl)
    if (defaultPayload) {
      setComposerPayload(defaultPayload)
    }
  }

  const handleLoadIntoComposer = (content: string) => {
    setComposerPayload(content)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  WebSocket Playground
                </h1>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  Universal Client
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive real-time WebSocket debugging
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60">
              <BookmarkCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>LocalStorage Presets</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>WS &amp; WSS Protocol</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS / Secure Feeds</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 py-4 flex-1 flex flex-col">
        {/* Connection Bar */}
        <ConnectionBar
          url={url}
          onUrlChange={setUrl}
          status={status}
          errorDetails={errorDetails}
          uptimeSeconds={uptimeSeconds}
          stats={stats}
          autoReconnect={autoReconnect}
          onToggleAutoReconnect={setAutoReconnect}
          onConnect={() => connect()}
          onDisconnect={disconnect}
          presets={presets}
          onSelectPreset={handleSelectPreset}
          onOpenPresetModal={() => setIsPresetModalOpen(true)}
        />

        {/* Content Columns: Composer (Left) & Feed (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-start">
          {/* Left Column: Composer */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <MessageComposer
              initialContent={composerPayload}
              isConnected={status === "CONNECTED"}
              onSendMessage={sendMessage}
              templates={templates}
              onAddTemplate={addTemplate}
            />

            {/* Quick Tips card */}
            <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-3.5 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Playground Features</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-slate-300">Custom Presets:</strong> Click{" "}
                  <span className="text-blue-400">Save / Manage</span> above to bookmark your
                  WebSocket URLs and initial payloads in browser local storage.
                </li>
                <li>
                  <strong className="text-slate-300">Shortcut:</strong> Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[10px]">
                    Ctrl+Enter
                  </kbd>{" "}
                  to rapidly send messages from the composer.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Message Feed */}
          <div className="lg:col-span-7 flex flex-col">
            <MessageFeed
              messages={messages}
              onClear={clearMessages}
              onLoadIntoComposer={handleLoadIntoComposer}
            />
          </div>
        </div>
      </main>

      {/* Preset Manager Dialog */}
      <PresetManagerModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        currentUrl={url}
        currentPayload={composerPayload}
        presets={presets}
        onAddPreset={addPreset}
        onDeletePreset={deletePreset}
        onResetDefaults={resetPresetsToDefault}
        onSelectPreset={handleSelectPreset}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-3 text-center text-xs text-slate-500 font-mono">
        WebSocket Playground &bull; Universal Client &amp; Collapsible JSON Inspector
      </footer>
    </div>
  )
}

export default App
