import { electronAPI } from './index'

export type ElectronAPI = typeof electronAPI

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

