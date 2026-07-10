import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window per IP
  message: {
    success: false,
    message: "Too many attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // stricter — for forgot-password specifically
  message: {
    success: false,
    message: "Too many requests. Please try again in an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
