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
    const mainstreamScore = topArtists.length == 0 ? 0 : topArtists.filter(artist => artist.popularity >= 70).length / topArtists.length;
    const geners = {};
    topArtists.forEach(artist => {
        artist.genres.forEach(genre => {
            if (geners[genre]) {
                geners[genre]++;
            } else {
                geners[genre] = 1;
            }
        });
    });
    const [topGenre, obsessionLevel] = Object.entries(geners).sort((a, b) => b[1] - a[1])[0] || ["", 0];

    const explicitRatio = topTracks.length === 0 ? 0 : topTracks.filter(t => t.explicit).length / topTracks.length;

    const nightOwlRatio =
        recentTracks.length === 0
            ? 0
            : recentTracks.filter(r => {
                const h = new Date(r.played_at).getHours();
                return h >= 22 || h <= 4;
            }).length / recentTracks.length;

    const recentArtistCounts = {};
    recentTracks.forEach(r => {
        recentArtistCounts[r.artist] =
            (recentArtistCounts[r.artist] || 0) + 1;
    });

    const maxRepeatArtist =
        Object.entries(recentArtistCounts).sort((a, b) => b[1] - a[1])[0];

    const emotionalLoop = maxRepeatArtist && maxRepeatArtist[1] >= 3;

    const moodKeywords = {
        sad: ["sad", "cry", "lonely", "hurt", "pain", "heart"],
        angry: ["rage", "hate", "fight", "kill"],
        chill: ["lofi", "chill", "slow", "dream"],
    };

    let moodScore = {
        sad: 0,
        angry: 0,
        chill: 0,
    };

    recentTracks.forEach(r => {
        const name = r.track.toLowerCase();
        for (const mood in moodKeywords) {
            if (moodKeywords[mood].some(k => name.includes(k))) {
                moodScore[mood]++;
            }
        }
    });
    const dominantMood = Object.entries(moodScore).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";

    return {
        mainstreamRatio: mainstreamScore,
        explicitRatio: explicitRatio,
        topGenre: topGenre || "unknown",
        obsessionLevel: obsessionLevel || 0,
        dominantMood,
        nightOwlRatio,
        emotionalLoop,
    };
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
    if (!code) throw new Error({ status: 400, message: "Authorization code not found" })
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