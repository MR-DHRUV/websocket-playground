import type { PayloadTemplate, PresetEndpoint } from "@/types/websocket"

export const DEFAULT_PRESET_ENDPOINTS: PresetEndpoint[] = [
  {
    id: "default-echo-events",
    name: "WebSocket Echo Server",
    url: "wss://echo.websocket.events",
    description: "Public echo service for testing live bidirectional WebSocket data",
    defaultPayload: JSON.stringify(
      {
        event: "greeting",
        message: "Hello from WebSocket Playground!",
        timestamp: Date.now(),
      },
      null,
      2,
    ),
    isDefault: true,
  },
  {
    id: "default-postman-echo",
    name: "Postman Echo",
    url: "wss://ws.postman-echo.com/raw",
    description: "Postman raw WebSocket test server",
    defaultPayload: JSON.stringify(
      {
        test: "echo",
        client: "WebSocket Playground",
        active: true,
      },
      null,
      2,
    ),
    isDefault: true,
  }
]

export const DEFAULT_PAYLOAD_TEMPLATES: PayloadTemplate[] = [
  {
    id: "tpl-json-echo",
    name: "JSON Echo Object",
    description: "Sample structured JSON message with nested fields",
    category: "Echo / Test",
    payload: JSON.stringify(
      {
        event: "message",
        sender: "client-agent",
        content: "Hello WebSocket server!",
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0",
          tags: ["test", "demo", "playground"],
        },
      },
      null,
      2,
    ),
    isDefault: true,
  },
  {
    id: "tpl-jsonrpc-request",
    name: "JSON-RPC 2.0 Request",
    description: "Standard JSON-RPC 2.0 call with method & parameters",
    category: "JSON-RPC",
    payload: JSON.stringify(
      {
        jsonrpc: "2.0",
        id: 1,
        method: "ping",
        params: {
          clientTime: Date.now(),
        },
      },
      null,
      2,
    ),
    isDefault: true,
  },
  {
    id: "tpl-pubsub-subscribe",
    name: "PubSub Subscribe",
    description: "Subscription payload for event / message channels",
    category: "PubSub / Events",
    payload: JSON.stringify(
      {
        action: "subscribe",
        topics: ["notifications", "live_feed"],
        filter: {
          includeMeta: true,
        },
      },
      null,
      2,
    ),
    isDefault: true,
  },
  {
    id: "tpl-telemetry",
    name: "Telemetry / Sensor Data",
    description: "Simulated device telemetry data",
    category: "PubSub / Events",
    payload: JSON.stringify(
      {
        device_id: "node-alpha-42",
        status: "HEALTHY",
        metrics: {
          temperature_c: 24.8,
          humidity_pct: 48.2,
          battery_level: 0.94,
        },
        readings: [102, 104, 99, 105],
      },
      null,
      2,
    ),
    isDefault: true,
  },
  {
    id: "tpl-plain-ping",
    name: "Plain Text Ping",
    description: "Simple non-JSON text message",
    category: "Echo / Test",
    payload: "ping",
    isDefault: true,
  },
]
