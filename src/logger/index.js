import { createLogger, format, transports } from "winston";
// import { combine, timestamp, printf, errors } from "winston-format";

const myFormat = format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        myFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: "combined.log" }),
        new transports.File({ filename: "error.log", level: "error" }),
    ],
});

export default logger;
