import { Router, Request, Response } from "express"
import { z } from "zod"
import { logger } from "../lib/logger"

const router = Router()

const ProxyBody = z.object({
  target:  z.string().url(),
  method:  z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("GET"),
  payload: z.record(z.unknown()).optional(),
})

// Minimal proxy endpoint — forwards requests to an upstream target.
// In a real gateway you'd stream the response body instead of buffering.
router.post("/proxy", async (req: Request, res: Response) => {
  const parsed = ProxyBody.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", details: parsed.error.flatten() })
    return
  }

  const { target, method, payload } = parsed.data

  try {
    const upstream = await fetch(target, {
      method,
      headers: {
        "Content-Type":    "application/json",
        "X-Forwarded-By": "nexuscore-gateway",
        "X-Request-ID":   req.ctx?.requestId ?? "",
      },
      body: payload ? JSON.stringify(payload) : undefined,
    })

    const body = await upstream.json().catch(() => ({}))
    res.status(upstream.status).json(body)
  } catch (err: any) {
    logger.error("proxy.failed", { error: err.message, target })
    res.status(502).json({ error: "BAD_GATEWAY", message: err.message })
  }
})

export default router
