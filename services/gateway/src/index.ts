import express from "express"
import { authMiddleware }    from "./middleware/auth"
import { rateLimitMiddleware } from "./middleware/rateLimit"
import { requestLogger }     from "./middleware/requestLogger"
import healthRouter          from "./routes/health"
import proxyRouter           from "./routes/proxy"
import { logger }            from "./lib/logger"

const app  = express()
const PORT = parseInt(process.env.PORT ?? "3000", 10)

app.use(express.json())
app.use(requestLogger)

// Public routes — no auth needed
app.use("/", healthRouter)

// Protected routes
app.use(authMiddleware)
app.use(rateLimitMiddleware())
app.use("/api/v1", proxyRouter)

app.use((_req, res) => {
  res.status(404).json({ error: "NOT_FOUND" })
})

app.listen(PORT, () => {
  logger.info("gateway.started", { port: PORT })
})

export default app
