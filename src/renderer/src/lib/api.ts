// Typed bridge to the Electron preload API exposed via contextBridge
import type { Api } from '../../../preload'

declare global {
  interface Window {
    api: Api
  }
}

export const api = window.api
