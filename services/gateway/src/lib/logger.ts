import chalk from "chalk"

type Level = "info" | "warn" | "error" | "debug"

function log(level: Level, msg: string, meta?: Record<string, unknown>) {
  const ts     = new Date().toISOString()
  const prefix = {
    info:  chalk.blue("[INFO]"),
    warn:  chalk.yellow("[WARN]"),
    error: chalk.red("[ERROR]"),
    debug: chalk.gray("[DEBUG]"),
  }[level]

  const line = JSON.stringify({ ts, level, msg, ...meta })
  if (level === "error") {
    process.stderr.write(prefix + " " + line + "\n")
  } else {
    process.stdout.write(prefix + " " + line + "\n")
  }
}

export const logger = {
  info:  (msg: string, meta?: Record<string, unknown>) => log("info",  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => log("warn",  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),
}
