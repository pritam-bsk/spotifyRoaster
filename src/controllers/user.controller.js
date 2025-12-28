import { asyncHandler } from "../utils/asyncHandler.util.js";
import 'dotenv/config'
import { userDetails, fetchRecentTracks, fetchTopArtists, fetchTopTracks } from "../utils/spotify.util.js";

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

const buildRoaster = ({ topArtists, topTracks, recentTracks }) => {
    const mainstreamScore = topArtists.filter(artist => artist.popularity >= 70).length/topArtists.length;

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
    const data = await userDetails(accessToken);
    return res.json(data);
});

const topArtists = asyncHandler(async (req, res) => {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
        throw new Error({ status: 401, message: "Access token not found. Please login." });
    }
    const data = await fetchTopArtists(accessToken);
    return res.json(data);
});

const topTracks = asyncHandler(async (req, res) => {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
        throw new Error({ status: 401, message: "Access token not found. Please login." });
    }
    const data = await fetchTopTracks(accessToken);
    return res.json(data);
});

const mostRecentTracks = asyncHandler(async (req, res) => {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
        throw new Error({ status: 401, message: "Access token not found. Please login." });
    }
    const data = await fetchRecentTracks(accessToken);
    return res.json(data);
});

const getRoastJSON = asyncHandler(async (req, res) => {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
        throw new Error({ status: 401, message: "Access token not found. Please login." });
    }
    const topArtistsData = await fetchTopArtists(accessToken);
    const topTracksData = await fetchTopTracks(accessToken);
    const recentTracksData = await fetchRecentTracks(accessToken);

    const roastData = {
        topArtists: topArtistsData,
        topTracks: topTracksData,
        recentTracks: recentTracksData
    };

    const roastJSON = buildRoaster(roastData);

    return res.json(roastJSON);
});


export { userLogin, spotifyCallback, userMe, topArtists, topTracks, mostRecentTracks, getRoastJSON };