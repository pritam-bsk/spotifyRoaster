import { asyncHandler } from "../utils/asyncHandler.util.js";

const refreshAccessToken = asyncHandler(async (refreshToken) => {
    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization":
                "Basic " +
                Buffer.from(
                    process.env.SPOTIFY_CLIENT_ID + ":" +
                    process.env.SPOTIFY_CLIENT_SECRET
                ).toString("base64"),
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        }),
    });

    if (!res.ok) throw new Error({ status: 500, message: "Failed to refresh token" });

    return res.json();
});


export const authenticateUser = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;
    if (!accessToken || !refreshToken) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Access token is missing",
        });
    }
    const test = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (test.status === 401) {
        const tokenData = await refreshAccessToken(refreshToken);
        const newAccessToken = tokenData.access_token;
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        };
        res.cookie("access_token", newAccessToken, options);
        req.accessToken = newAccessToken;
    } else {
        req.accessToken = accessToken;
        const user = await test.json();
        req.user = {
            id: user.id,
            display_name: user.display_name,
            email: user.email,
        };
    }
    next();
});