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

    const userRes = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const user = await userRes.json();
    const options = {
        httpOnly: true,
        secure: true
    };
    return res
        .cookie("access_token", accessToken, options)
        .cookie("refresh_token", refreshToken, options)
        .json({
            message: "OAuth success",
            spotify_user_id: user.id,
            display_name: user.display_name,
        });
})

export { userLogin, spotifyCallback };