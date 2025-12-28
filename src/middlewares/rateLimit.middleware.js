import rateLimit from "express-rate-limit";
import app from '../app.js';

app.set("trust proxy", 1);
const generateRoastLimiter = rateLimit({
    windowMs: 60 * 60 * 1000 * 24,
    max: 2,
    message: {
        success: false,
        error: "Too many roasts. Even the AI needs a break."
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
    if (req.user?.id) {
      return `spotify:${req.user.id}`;
    }
    return req.ip;
  },
});
export { generateRoastLimiter };