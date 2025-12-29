import { asyncHandler } from "../utils/asyncHandler.util.js";
import { User } from "../models/user.model.js";

export const exportAllUser = asyncHandler(async (req, res) => {
    const accessToken = req.accessToken || req.cookies.access_token;
    if (!accessToken) {
        const error = new Error("Access token not found. Please login.");
        error.status = 401;
        throw error;
    }

    const users = await User.find({});
    return res.json({
        status: 200,
        success: true,
        data: users
    });
})