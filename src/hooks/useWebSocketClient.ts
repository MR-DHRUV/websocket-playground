import { useCallback, useEffect, useRef, useState } from "react"
import type { ConnectionStatus, WebSocketMessage } from "@/types/websocket"

export interface WebSocketOptions {
  autoReconnect?: boolean
  reconnectIntervalMs?: number
  maxReconnectAttempts?: number
  heartbeatIntervalSec?: number
  heartbeatMessage?: string
}

type TimeoutId = ReturnType<typeof setTimeout>

export function useWebSocketClient(options: WebSocketOptions = {}) {
  const {
    autoReconnect = false,
    reconnectIntervalMs = 3000,
    maxReconnectAttempts = 5,
    heartbeatIntervalSec = 0,
    heartbeatMessage = JSON.stringify({ type: "ping" }),
  } = options

  const [url, setUrl] = useState<string>("wss://echo.websocket.events")
  const [status, setStatus] = useState<ConnectionStatus>("DISCONNECTED")
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const [connectedTime, setConnectedTime] = useState<number | null>(null)
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(0)
  const [stats, setStats] = useState({
    sentCount: 0,
    receivedCount: 0,
    sentBytes: 0,
    receivedBytes: 0,
  })

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectCountRef = useRef<number>(0)
  const reconnectTimeoutRef = useRef<TimeoutId | null>(null)
  const heartbeatTimerRef = useRef<TimeoutId | null>(null)
  const manualDisconnectRef = useRef<boolean>(false)
  const sendMessageRef = useRef<(payload: string, isHeartbeat?: boolean) => boolean>(() => false)

  // Track connection uptime
  useEffect(() => {
    let interval: TimeoutId | null = null
    if (status === "CONNECTED" && connectedTime) {
      interval = setInterval(() => {
        setUptimeSeconds(Math.floor((Date.now() - connectedTime) / 1000))
      }, 1000)
    } else {
      setUptimeSeconds(0)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [status, connectedTime])

  // Setup heartbeat if enabled
  useEffect(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current)
      heartbeatTimerRef.current = null
    }

    if (status === "CONNECTED" && heartbeatIntervalSec > 0 && wsRef.current) {
      heartbeatTimerRef.current = setInterval(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          sendMessageRef.current(heartbeatMessage, true)
        }
      }, heartbeatIntervalSec * 1000)
    }

    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current)
        heartbeatTimerRef.current = null
      }
    }
  }, [status, heartbeatIntervalSec, heartbeatMessage])

  const addMessage = useCallback(
    (direction: "incoming" | "outgoing" | "system" | "error", content: string) => {
      let isJson = false
      let parsedJson: unknown
      try {
        parsedJson = JSON.parse(content)
        if (typeof parsedJson === "object" && parsedJson !== null) {
          isJson = true
        }
      } catch {
        isJson = false
      }

      const sizeBytes = new Blob([content]).size
      const newMsg: WebSocketMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        direction,
        timestamp: new Date(),
        content,
        isJson,
        parsedJson,
        sizeBytes,
      }

      setMessages((prev) => [...prev, newMsg])
      return newMsg
    },
    [],
  )

  const connect = useCallback(
    (targetUrl?: string) => {
      const connectUrl = (targetUrl || url).trim()
      if (!connectUrl) {
        setErrorDetails("WebSocket URL cannot be empty")
        return
      }

      if (!connectUrl.startsWith("ws://") && !connectUrl.startsWith("wss://")) {
        setErrorDetails("URL must start with ws:// or wss://")
        return
      }

      // Close any previous connection
      if (wsRef.current) {
        manualDisconnectRef.current = true
        wsRef.current.close()
        wsRef.current = null
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      manualDisconnectRef.current = false
      setErrorDetails(null)
      setStatus("CONNECTING")

      addMessage("system", `Connecting to ${connectUrl}...`)

      try {
        const socket = new WebSocket(connectUrl)
        wsRef.current = socket

        socket.onopen = () => {
          setStatus("CONNECTED")
          setErrorDetails(null)
          setConnectedTime(Date.now())
          reconnectCountRef.current = 0
          addMessage("system", `Connected to ${connectUrl}`)
        }

        socket.onmessage = (event: MessageEvent) => {
          const textData = typeof event.data === "string" ? event.data : "[Binary data received]"
          const byteSize = new Blob([textData]).size

          setStats((prev) => ({
            ...prev,
            receivedCount: prev.receivedCount + 1,
            receivedBytes: prev.receivedBytes + byteSize,
          }))

          addMessage("incoming", textData)
        }

        socket.onerror = () => {
          const err = "WebSocket connection error occurred"
          setErrorDetails(err)
          addMessage("error", err)
        }

        socket.onclose = (event: CloseEvent) => {
          const reason = event.reason ? ` - ${event.reason}` : ""
          const wasClean = event.wasClean ? "gracefully" : "abnormally"
          const msg = `Connection closed ${wasClean} (code: ${event.code}${reason})`

          setStatus("DISCONNECTED")
          setConnectedTime(null)
          addMessage("system", msg)

          // Handle auto-reconnect if not disconnected manually
          if (!manualDisconnectRef.current && autoReconnect) {
            if (reconnectCountRef.current < maxReconnectAttempts) {
              reconnectCountRef.current += 1
              const delay = reconnectIntervalMs
              addMessage(
                "system",
                `Auto-reconnecting in ${delay / 1000}s (Attempt ${reconnectCountRef.current}/${maxReconnectAttempts})...`,
              )

              reconnectTimeoutRef.current = setTimeout(() => {
                connect(connectUrl)
              }, delay)
            } else {
              addMessage(
                "error",
                `Max reconnect attempts (${maxReconnectAttempts}) reached. Stopped reconnecting.`,
              )
            }
          }
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        setStatus("ERROR")
        setErrorDetails(errorMsg)
        addMessage("error", `Failed to initiate WebSocket: ${errorMsg}`)
      }
    },
    [url, autoReconnect, reconnectIntervalMs, maxReconnectAttempts, addMessage],
  )

  const disconnect = useCallback(() => {
    manualDisconnectRef.current = true
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected")
      wsRef.current = null
    }
    setStatus("DISCONNECTED")
    setConnectedTime(null)
  }, [])

  const sendMessage = useCallback(
    (payload: string, _isHeartbeat = false): boolean => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setErrorDetails("Cannot send message: WebSocket is not open")
        addMessage("error", "Failed to send: WebSocket is not connected")
        return false
      }

      try {
        wsRef.current.send(payload)
        const byteSize = new Blob([payload]).size

        setStats((prev) => ({
          ...prev,
          sentCount: prev.sentCount + 1,
          sentBytes: prev.sentBytes + byteSize,
        }))

        addMessage("outgoing", payload)
        return true
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        setErrorDetails(`Send error: ${errorMsg}`)
        addMessage("error", `Failed to send message: ${errorMsg}`)
        return false
      }
    },
    [addMessage],
  )
  sendMessageRef.current = sendMessage

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      manualDisconnectRef.current = true
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  return {
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
  }
}
