import { Router } from "express"

const router = Router()

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "nexuscore-gateway", ts: new Date().toISOString() })
})

export default router
