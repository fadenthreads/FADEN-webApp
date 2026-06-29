type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = { level, message, timestamp: new Date().toISOString(), ...meta };

  if (process.env.NODE_ENV === "production") {
    if (level === "error") console.error(JSON.stringify(entry));
    else if (level === "warn") console.warn(JSON.stringify(entry));
    else console.log(JSON.stringify(entry));
  } else {
    const prefix = `[${entry.timestamp}] ${level.toUpperCase()}`;
    const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    if (level === "error") console.error(`${prefix} ${message}${metaStr}`);
    else if (level === "warn") console.warn(`${prefix} ${message}${metaStr}`);
    else console.log(`${prefix} ${message}${metaStr}`);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};
