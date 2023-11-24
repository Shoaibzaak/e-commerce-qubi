const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.colorize({ all: true })
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `app-combined.log`.
    // - Write all logs error (and below) to `app-error.log`.
    //
    new transports.File({ filename: "app-error.log", level: "error" }),
    new transports.File({ filename: "app-combined.log" }),
  ],
});

module.exports = logger;
