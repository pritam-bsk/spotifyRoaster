import { asyncHandler } from "../utils/asyncHandler.util.js";
import { User } from "../models/user.model.js";

export const exportAllUser = asyncHandler(async (req, res) => {
    const users = await User.find({});
    return res.json({
        status: 200,
        success: true,
        data: users
    });
})