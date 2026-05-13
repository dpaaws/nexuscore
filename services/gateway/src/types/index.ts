export interface ApiKey {
  id: string
  owner: string
  rateLimit: number   // requests per minute
  createdAt: number
}

export interface RequestContext {
  apiKey: ApiKey
  requestId: string
  startedAt: number
}

declare global {
  namespace Express {
    interface Request {
      ctx?: RequestContext
    }
  }
}
