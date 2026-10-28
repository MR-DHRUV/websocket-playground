import {
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  ListTree,
  Maximize2,
  Minimize2,
} from "lucide-react"
import React, { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface JsonNodeProps {
  name?: string | number
  value: unknown
  depth?: number
  isLast?: boolean
  defaultExpandedDepth?: number
  forcedExpand?: boolean | null
}

const JsonNode: React.FC<JsonNodeProps> = ({
  name,
  value,
  depth = 0,
  isLast = true,
  defaultExpandedDepth = 2,
  forcedExpand = null,
}) => {
  const isObject = value !== null && typeof value === "object"
  const isArray = Array.isArray(value)

  const [expanded, setExpanded] = useState<boolean>(
    forcedExpand !== null ? forcedExpand : depth < defaultExpandedDepth,
  )
  const [copied, setCopied] = useState(false)

  React.useEffect(() => {
    if (forcedExpand !== null) {
      setExpanded(forcedExpand)
    }
  }, [forcedExpand])

  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const renderValue = (val: unknown) => {
    if (val === null) {
      return <span className="text-rose-400 italic">null</span>
    }
    if (val === undefined) {
      return <span className="text-slate-500 italic">undefined</span>
    }
    if (typeof val === "boolean") {
      return <span className="text-purple-400 font-semibold">{val ? "true" : "false"}</span>
    }
    if (typeof val === "number") {
      return <span className="text-amber-400">{val}</span>
    }
    if (typeof val === "string") {
      return <span className="text-emerald-300 break-all">&quot;{val}&quot;</span>
    }
    return <span>{String(val)}</span>
  }

  if (!isObject) {
    return (
      <div className="flex items-start py-0.5 hover:bg-slate-800/40 px-1.5 rounded transition-colors group">
        <div className="flex-1 font-mono text-xs leading-5">
          {name !== undefined && (
            <span className="text-sky-300 select-text mr-1">&quot;{name}&quot;:</span>
          )}
          {renderValue(value)}
          {!isLast && <span className="text-slate-500">,</span>}
        </div>
        <button
          type="button"
          onClick={(e) =>
            copyToClipboard(e, typeof value === "string" ? value : JSON.stringify(value))
          }
          title="Copy value"
          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-200 transition-opacity ml-2"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    )
  }

  const keys = Object.keys(value as object)
  const count = isArray ? (value as unknown[]).length : keys.length
  const bracketOpen = isArray ? "[" : "{"
  const bracketClose = isArray ? "]" : "}"

  return (
    <div className="font-mono text-xs">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setExpanded(!expanded)
          }
        }}
        className="flex items-center py-0.5 hover:bg-slate-800/50 px-1.5 rounded cursor-pointer select-none group transition-colors"
      >
        <span className="text-slate-400 mr-1 flex-shrink-0">
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
          )}
        </span>

        {name !== undefined && (
          <span className="text-sky-300 mr-1 font-medium select-text">&quot;{name}&quot;:</span>
        )}

        <span className="text-slate-400">{bracketOpen}</span>

        {!expanded ? (
          <span className="text-slate-500 text-[11px] mx-1">
            ... {count} {isArray ? (count === 1 ? "item" : "items") : count === 1 ? "key" : "keys"}{" "}
            ...
          </span>
        ) : count === 0 ? (
          <span className="text-slate-500 text-[11px] mx-1">empty</span>
        ) : null}

        {!expanded && (
          <span className="text-slate-400">
            {bracketClose}
            {!isLast && <span className="text-slate-500">,</span>}
          </span>
        )}

        <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
            {isArray ? `Array(${count})` : `Object(${count})`}
          </Badge>
          <button
            type="button"
            onClick={(e) => copyToClipboard(e, JSON.stringify(value, null, 2))}
            title="Copy branch JSON"
            className="p-0.5 text-slate-400 hover:text-slate-200"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {expanded && count > 0 && (
        <div className="pl-4 ml-1.5 border-l border-slate-700/60 my-0.5 space-y-0.5">
          {keys.map((key, index) => {
            const childValue = (value as Record<string, unknown>)[key]
            const childIsLast = index === keys.length - 1
            return (
              <JsonNode
                key={key}
                name={isArray ? undefined : key}
                value={childValue}
                depth={depth + 1}
                isLast={childIsLast}
                defaultExpandedDepth={defaultExpandedDepth}
                forcedExpand={forcedExpand}
              />
            )
          })}
        </div>
      )}

      {expanded && (
        <div className="pl-2 text-slate-400">
          {bracketClose}
          {!isLast && <span className="text-slate-500">,</span>}
        </div>
      )}
    </div>
  )
}

interface JsonViewerProps {
  data: string | unknown
  initialViewMode?: "parsed" | "raw"
  maxHeight?: string
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  initialViewMode = "parsed",
  maxHeight = "max-h-[500px]",
}) => {
  const [viewMode, setViewMode] = useState<"parsed" | "raw">(initialViewMode)
  const [forcedExpand, setForcedExpand] = useState<boolean | null>(null)
  const [copied, setCopied] = useState(false)

  // Parse if raw string
  const { parsed, isValidJson, prettyString } = useMemo(() => {
    if (typeof data === "string") {
      try {
        const obj = JSON.parse(data)
        return {
          parsed: obj,
          isValidJson: true,
          prettyString: JSON.stringify(obj, null, 2),
        }
      } catch {
        return {
          parsed: data,
          isValidJson: false,
          prettyString: data,
        }
      }
    } else {
      return {
        parsed: data,
        isValidJson: true,
        prettyString: JSON.stringify(data, null, 2),
      }
    }
  }, [data])

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/80 overflow-hidden text-slate-200">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-1.5">
          <Button
            type="button"
            size="sm"
            variant={viewMode === "parsed" ? "default" : "ghost"}
            className="h-7 text-xs px-2.5"
            onClick={() => setViewMode("parsed")}
            disabled={!isValidJson}
          >
            <ListTree className="w-3.5 h-3.5 mr-1" />
            Parsed Tree
          </Button>
          <Button
            type="button"
            size="sm"
            variant={viewMode === "raw" ? "default" : "ghost"}
            className="h-7 text-xs px-2.5"
            onClick={() => setViewMode("raw")}
          >
            <Code2 className="w-3.5 h-3.5 mr-1" />
            Raw Text
          </Button>

          {!isValidJson && (
            <Badge variant="secondary" className="text-[10px] bg-slate-800 text-slate-400">
              Plain Text
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          {viewMode === "parsed" && isValidJson && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 text-slate-400 hover:text-slate-200"
                onClick={() => setForcedExpand(true)}
                title="Expand All Nodes"
              >
                <Maximize2 className="w-3 h-3 mr-1" />
                Expand All
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 text-slate-400 hover:text-slate-200"
                onClick={() => setForcedExpand(false)}
                title="Collapse All Nodes"
              >
                <Minimize2 className="w-3 h-3 mr-1" />
                Collapse All
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2 text-slate-300 hover:text-slate-100"
            onClick={() => copyContent(prettyString)}
            title="Copy JSON"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div
        className={`p-3 overflow-auto ${maxHeight} text-slate-200 font-mono text-xs select-text`}
      >
        {viewMode === "parsed" && isValidJson ? (
          <JsonNode value={parsed} forcedExpand={forcedExpand} defaultExpandedDepth={2} />
        ) : (
          <pre className="whitespace-pre-wrap break-all text-slate-300 leading-relaxed font-mono">
            {prettyString}
          </pre>
        )}
      </div>
    </div>
  )
}
