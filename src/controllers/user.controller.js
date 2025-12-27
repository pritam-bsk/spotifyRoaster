import { asyncHandler } from "../utils/asyncHandler.util.js";
import 'dotenv/config'

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
    tokenData = await tokenRes.json();
    res.send(tokenData);
})

export { userLogin, spotifyCallback };