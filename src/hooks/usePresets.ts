import { useCallback, useEffect, useState } from "react"
import { DEFAULT_PAYLOAD_TEMPLATES, DEFAULT_PRESET_ENDPOINTS } from "@/data/presets"
import type { PayloadTemplate, PresetEndpoint } from "@/types/websocket"

const STORAGE_KEY_PRESETS = "ws_playground_presets_v1"
const STORAGE_KEY_TEMPLATES = "ws_playground_templates_v1"

export function usePresets() {
  const [presets, setPresets] = useState<PresetEndpoint[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRESETS)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_PRESET_ENDPOINTS
  })

  const [templates, setTemplates] = useState<PayloadTemplate[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TEMPLATES)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_PAYLOAD_TEMPLATES
  })

  // Sync presets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(presets))
    } catch (e) {
      console.error("Failed to save presets to localStorage", e)
    }
  }, [presets])

  // Sync templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates))
    } catch (e) {
      console.error("Failed to save templates to localStorage", e)
    }
  }, [templates])

  const addPreset = useCallback(
    (preset: { name: string; url: string; description?: string; defaultPayload?: string }) => {
      const newPreset: PresetEndpoint = {
        id: `custom-preset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: preset.name.trim(),
        url: preset.url.trim(),
        description: preset.description?.trim(),
        defaultPayload: preset.defaultPayload?.trim(),
        isDefault: false,
        createdAt: Date.now(),
      }

      setPresets((prev) => [newPreset, ...prev])
      return newPreset
    },
    [],
  )

  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const resetPresetsToDefault = useCallback(() => {
    setPresets(DEFAULT_PRESET_ENDPOINTS)
  }, [])

  const addTemplate = useCallback(
    (template: {
      name: string
      description?: string
      category?: "Echo / Test" | "JSON-RPC" | "PubSub / Events" | "Custom"
      payload: string
    }) => {
      const newTemplate: PayloadTemplate = {
        id: `custom-tpl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: template.name.trim(),
        description: template.description?.trim(),
        category: template.category || "Custom",
        payload: template.payload,
        isDefault: false,
      }

      setTemplates((prev) => [newTemplate, ...prev])
      return newTemplate
    },
    [],
  )

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const resetTemplatesToDefault = useCallback(() => {
    setTemplates(DEFAULT_PAYLOAD_TEMPLATES)
  }, [])

  return {
    presets,
    templates,
    addPreset,
    deletePreset,
    resetPresetsToDefault,
    addTemplate,
    deleteTemplate,
    resetTemplatesToDefault,
  }
}
