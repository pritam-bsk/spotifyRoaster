import { asyncHandler } from "../utils/asyncHandler.util.js"; 

export const authenticateUser = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Access token is missing",
        });
    }
    req.accessToken = accessToken;
    next();
});