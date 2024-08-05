import logger from "../logger/index.js";
import ApiError from "../utils/ApiError.js";

const rateLimit = {};
const rateLimiter = (req, res, next) => {
    const ip = req.ip;
    const currentTime = Date.now();

    if (!rateLimit[ip]) {
        rateLimit[ip] = { count: 1, startTime: currentTime };
    } else {
        rateLimit[ip].count++;
    }
    if (currentTime - rateLimit[ip].startTime > 180000) {
        // Reset count every 3 minute
        rateLimit[ip].count = 1;
        rateLimit[ip].startTime = currentTime;
    }

    if (rateLimit[ip].count > 100) {
        // Limit to 100 requests per minute
        throw new ApiError(
            429,
            "Too many requests. Please try again later.",
            "rateLimiter"
        );
    }
    logger.info("rate limiter");
    next();
};

const inputSaniziter = (req, res, next) => {
    const regEx = /<\/?[^>]+(>|$)/g;
    const sanitizeString = (str) => {
        return str.replace(regEx, "");
    };

    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === "string") {
                req.body[key] = sanitizeString(req.body[key]);
            }
        }
    }
    logger.info("inputSaniziter");
    next();
};

const logRequest = (req, res, next) => {
    const date = new Date().toISOString();
    logger.info(`${req.method} - ${req.url} - ${req.ip}`);
    next();
};

export { rateLimiter, inputSaniziter, logRequest };
