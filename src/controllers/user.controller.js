import { asyncHandler } from "../utils/asyncHandler.util.js";
import 'dotenv/config'

const generateToken = async (code) => {
    const tokenRes = await fetch(
        "https://accounts.spotify.com/api/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization":
                    "Basic " +
                    Buffer.from(
                        process.env.SPOTIFY_CLIENT_ID +
                        ":" +
                        process.env.SPOTIFY_CLIENT_SECRET
                    ).toString("base64"),
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
            }),
        }
    );
    if (!tokenRes.ok) throw new Error({ status: 500, message: "failed to fetch access token" })
    const tokenData = await tokenRes.json();
    return tokenData;
}

const userLogin = asyncHandler(async (req, res) => {
    const SCOPES = [
        "user-top-read",
        "user-read-recently-played",
        "user-read-email",
    ].join(" ");
    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: SCOPES,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    });

    res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

const spotifyCallback = asyncHandler(async (req, res) => {
    const code = req.query.code;
    if (!code) throw new Error({ status: 400, message: "Authorization code not found in query parameters" })
    const tokenData = await generateToken(code);
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    };
    return res
        .cookie("access_token", accessToken, options)
        .cookie("refresh_token", refreshToken, options)
        .redirect(process.env.APP_URL + '/home');
})

const userMe = asyncHandler(async (req, res) => {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
        throw new Error({ status: 401, message: "Access token not found. Please login." });
    }
    const userRes = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!userRes.ok) throw new Error({ status: 500, message: "failed to fetch user data" })
    const userData = await userRes.json();
    return res.status(200).json({
        success: true,
        data: userData,
    });
});

const topArtists = asyncHandler(async (req, res) => {
    const response = await fetch(
        "https://api.spotify.com/v1/me/top/artists?limit=10&time_range=medium_term",
        {
            headers: {
                Authorization: `Bearer ${req.accessToken}`,
            },
        }
    );
    if (!response.ok) throw new Error({ status: 500, message: "failed to fetch top artists" })
    const data = await response.json();
    return res.status(200).json({
        success: true,
        data: data.items,
    });
});

const topTracks = asyncHandler(async (req, res) => {
    const response = await fetch(
        "https://api.spotify.com/v1/me/top/tracks?limit=10",
        {
            headers: {
                Authorization: `Bearer ${req.accessToken}`,
            },
        }
    );
    if (!response.ok) throw new Error({ status: 500, message: "failed to fetch top artists" })
    const data = await response.json();
    return res.status(200).json({
        success: true,
        data: data.items,
    });
});

const mostRecentTracks = asyncHandler(async (req, res) => {
    const response = await fetch(
        "https://api.spotify.com/v1/me/player/recently-played?limit=20",
        {
            headers: {
                Authorization: `Bearer ${req.accessToken}`,
            },
        }
    );
    if (!response.ok) throw new Error({ status: 500, message: "failed to fetch top artists" })
    const data = await response.json();
    return res.status(200).json({
        success: true,
        data: data.items,
    });
});
export { userLogin, spotifyCallback, userMe, topArtists, topTracks, mostRecentTracks };