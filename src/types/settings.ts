 // All the TypeScript interfaces for AIDA
// An "interface" is just a description of what shape data should have
// TypeScript uses these to catch mistakes before they happen

export interface WidgetPosition {
  x: number
  y: number
}

export interface MonitorComponents {
  cpu: boolean
  gpu: boolean
  ram: boolean
  vram: boolean
  disk: boolean  
  temp: boolean
  network: boolean
  battery: boolean
}

export interface GlobalSettings {
  // Appearance
  transparency: number        // 0-100
  blurIntensity: number      // 0-100
  accentColor: string        // hex color e.g. "#6366f1"
  fontSize: 'small' | 'medium' | 'large'
  animationSpeed: 'fast' | 'normal' | 'slow'

  // Behavior
  autoHideMenu: boolean
  autoHideDelay: number      // seconds
  defaultMenuState: 'open' | 'closed'

  // AI
  aiProvider: 'gemini' | 'meta' | 'groq' | 'claude' | 'openai'
  geminiApiKey: string

  // System Monitor
  systemMonitorEnabled: boolean
  monitorComponents: MonitorComponents
  monitorPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

  // System
  autoStart: boolean

  // Widget
  widgetFontFamily: string
  widgetFontSize: number
  widgetPosition: WidgetPosition
}

// These are the DEFAULT values when AIDA runs for the first time
export const defaultSettings: GlobalSettings = {
  // Appearance
  transparency: 20,
  blurIntensity: 40,
  accentColor: '#6366f1',
  fontSize: 'medium',
  animationSpeed: 'normal',

  // Behavior
  autoHideMenu: true,
  autoHideDelay: 3,
  defaultMenuState: 'closed',

  // AI Default Settings
  aiProvider: 'openai',
  geminiApiKey: '',

  // System Monitor
  systemMonitorEnabled: true,
  monitorComponents: {
  cpu: true,
  gpu: true,
  ram: true,
  vram: false,
  disk: true,
  temp: false,
  network: false,
  battery: false,  
},
  monitorPosition: 'bottom-right',

  // System
  autoStart: false,

  // Widget
  widgetFontFamily: 'system-ui',
  widgetFontSize: 16,
  widgetPosition: { x: 20, y: 20 },
}
