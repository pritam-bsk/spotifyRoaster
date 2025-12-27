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

const spotifyCallback = asyncHandler((req,res)=>{
    console.log(`####### callback #########`);
    res.send(`####### callback #########`)
})

export { userLogin, spotifyCallback };