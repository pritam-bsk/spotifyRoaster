import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const generateRoastLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 2,
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req) => {
        if (req.spotifyUser?.id) {
            return `spotify:${req.spotifyUser.id}`;
        }
        return ipKeyGenerator(req);
    },

    message: {
        success: false,
        error: "Roast limit hit. Reflect on your music choices."
    }
});
