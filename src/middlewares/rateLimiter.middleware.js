import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 100 requests per windowMs
    message: 'Too many login attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false, 
});