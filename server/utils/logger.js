// Minimal logger abstraction, so we can later swap in Winston/Pino
// without touching application code everywhere.

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (!meta) return base;
  return `${base} ${typeof meta === "string" ? meta : JSON.stringify(meta)}`;
};

const logger = {
  info(message, meta) {
    console.log(formatMessage("info", message, meta));
  },
  warn(message, meta) {
    console.warn(formatMessage("warn", message, meta));
  },
  error(message, meta) {
    console.error(formatMessage("error", message, meta));
  },
};

module.exports = logger;

