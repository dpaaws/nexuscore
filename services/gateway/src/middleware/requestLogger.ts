import { Request, Response, NextFunction } from "express"
import { logger } from "../lib/logger"

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()

  res.on("finish", () => {
    logger.info("request", {
      method:     req.method,
      path:       req.path,
      status:     res.statusCode,
      ms:         Date.now() - start,
      requestId:  req.ctx?.requestId,
      keyOwner:   req.ctx?.apiKey.owner,
    })
  })

  next()
}
