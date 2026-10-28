export type ConnectionStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "ERROR"

export type MessageDirection = "incoming" | "outgoing" | "system" | "error"

export interface WebSocketMessage {
  id: string
  direction: MessageDirection
  timestamp: Date
  content: string
  isJson: boolean
  parsedJson?: unknown
  sizeBytes: number
}

export interface PresetEndpoint {
  id: string
  name: string
  url: string
  description?: string
  defaultPayload?: string
  isDefault?: boolean
  createdAt?: number
}

export interface PayloadTemplate {
  id: string
  name: string
  description?: string
  category: "Echo / Test" | "JSON-RPC" | "PubSub / Events" | "Custom"
  payload: string
  isDefault?: boolean
}
