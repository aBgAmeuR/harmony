export interface ApiConfig {
  app: AppConfig
  proxyUrls: string[]
  proxyAuthSecret: string
}

interface AppConfig {
  name: string
  version: string
  contactInfo: string
}
