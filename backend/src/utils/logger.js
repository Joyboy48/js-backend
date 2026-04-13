import winston from "winston";

const { combine, timestamp, json, colorize, printf } = winston.format;

const consoleLogFormat = combine(
  colorize(),
  printf(({ level, message, timestamp }) => {
    return `${level}: ${message}`;
  })
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.Console({
      format: consoleLogFormat,
    }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

export default logger;
