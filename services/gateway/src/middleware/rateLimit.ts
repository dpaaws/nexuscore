import { Request, Response, NextFunction } from "express"
import { logger } from "../lib/logger"

// Sliding window in-memory store: Map<apiKeyId, timestamp[]>
// For multi-instance deployments, swap this with a Redis sorted set.
const windows = new Map<string, number[]>()

export function rateLimitMiddleware(windowMs = 60_000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ctx = req.ctx
    if (!ctx) { next(); return }

    const { id, rateLimit } = ctx.apiKey
    const now    = Date.now()
    const cutoff = now - windowMs

    const hits = (windows.get(id) ?? []).filter(t => t > cutoff)
    hits.push(now)
    windows.set(id, hits)

    const remaining = Math.max(0, rateLimit - hits.length)

    res.setHeader("X-RateLimit-Limit",     rateLimit)
    res.setHeader("X-RateLimit-Remaining", remaining)
    res.setHeader("X-RateLimit-Reset",     Math.ceil((now + windowMs) / 1000))

    if (hits.length > rateLimit) {
      logger.warn("ratelimit.exceeded", { keyId: id, hits: hits.length })
      res.status(429).json({ error: "RATE_LIMITED", retryAfter: Math.ceil(windowMs / 1000) })
      return
    }

    next()
  }
}
