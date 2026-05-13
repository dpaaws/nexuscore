import { Request, Response, NextFunction } from "express"
import { randomUUID } from "crypto"
import { logger } from "../lib/logger"
import type { ApiKey, RequestContext } from "../types"

// In production this would hit Redis or a DB.
// Kept in-memory here to stay dependency-light for the demo.
const VALID_KEYS: Record<string, ApiKey> = {
  "nexus-dev-key-001": {
    id: "key_001", owner: "dev", rateLimit: 120, createdAt: Date.now(),
  },
  "nexus-prod-key-002": {
    id: "key_002", owner: "prod", rateLimit: 600, createdAt: Date.now(),
  },
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const raw = req.headers["x-api-key"]
  const key = Array.isArray(raw) ? raw[0] : raw

  if (!key || !VALID_KEYS[key]) {
    logger.warn("auth.rejected", { ip: req.ip, path: req.path })
    res.status(401).json({ error: "UNAUTHORIZED", message: "Valid X-Api-Key required" })
    return
  }

  req.ctx = {
    apiKey:    VALID_KEYS[key],
    requestId: randomUUID(),
    startedAt: Date.now(),
  }

  next()
}
