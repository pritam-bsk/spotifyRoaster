import { asyncHandler } from "../utils/asyncHandler.util.js";
import 'dotenv/config'
import { userDetails, fetchRecentTracks, fetchTopArtists, fetchTopTracks } from "../utils/spotify.util.js";
import { User } from "../models/user.model.js";

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
    if (!tokenRes.ok) {
        const error = new Error("Failed to generate token");
        error.status = tokenRes.status || 513;
        throw error;
    }
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

    const MOOD_KEYWORDS = {
        sad: [
            "sad", "cry", "lonely", "hurt", "pain", "tears", "broken", "heartbreak", "miss", "lost",
            "dard", "judai", "akela", "rota", "aansoo", "bewafa", "tanha", "yaadein", "adhura",
            "aashiqui", "dil toota", "gum", "zakhm",
            "kosto", "bedona", "dukho", "eka", "chokher jol", "bhanga", "mon kharap",
            "hariye", "biroho", "priyo", "bhalobasha nei"
        ],

        angry: [
            "rage", "hate", "fight", "kill", "angry", "mad", "fire", "revenge",
            "gussa", "nafrat", "ladayi", "badla", "junoon", "dushman", "tufaan",
            "rag", "ghrina", "jhogra", "protishodh", "agune", "bidroho"
        ],

        chill: [
            "lofi", "chill", "slow", "dream", "calm", "vibe", "soft", "ambient", "bye", "relax",
            "shanti", "thanda", "dheemi", "komol", "nishshobdo", "moner shanti", "halka",
            "sukoon", "shaant", "raahat", "thandak", "khamoshi", "dheere",
            "bishakto", "shanto", "niribilli", "ghum", "halka", "dhire", "niramish", "shital", "madhur",
            "komol", "mild", "soothing", "peaceful", "monkey", "easy"
        ],

        romantic: [
            "love", "romantic", "passion", "desire", "affection", "romance", "crush",
            "ishq", "mohabbat", "pyaar", "junoon", "dil", "saath", "mehboob", "janam",
            "bhalobasha", "prem", "valobasha", "moner manush", "tumi", "ami", "tune", "baarish", "senorita"
        ]
    };


    let moodScore = {
        sad: 0,
        angry: 0,
        chill: 0,
        romantic: 0,
    };

    recentTracks.forEach(r => {
        const name = r.name.toLowerCase();
        for (const mood in MOOD_KEYWORDS) {
            if (MOOD_KEYWORDS[mood].some(k => name.includes(k))) {
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
    if (!code) {
        const error = new Error("Authorization code not found in query parameters");
        error.status = 402;
        throw error;
    }    
    const tokenData = await generateToken(code);
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    };

    const topAritst = await fetchTopArtists(accessToken);
    const topTrack = await fetchTopTracks(accessToken);

    const userData = await userDetails(accessToken);
    const dbUser = await User.findOne({ spotify_user_id: userData.id })
    if (!dbUser) {
        await User.create({
            spotify_user_id: userData.id,
            email: userData.email,
            display_name: userData.display_name, //update url when call /user/me
            image_url: userData.image_url, //update url when call /user/me
            top_artist: topAritst[0]?.name || "", //update when call /top-artists
            top_track: topTrack[0]?.name || "", //update when call /top-tracks
        })
    }
    return res
        .cookie("access_token", accessToken, options)
        .cookie("refresh_token", refreshToken, options)
        .redirect(process.env.APP_URL);
})

const userMe = asyncHandler(async (req, res) => {
    const accessToken = req.accessToken || req.cookies.access_token;
    if (!accessToken) {
        const error = new Error("Access token not found. Please login.");
        error.status = 405;
        throw error;
    }
    const data = await userDetails(accessToken);
    return res.json(data);
});

const topArtists = asyncHandler(async (req, res) => {
    const accessToken = req.accessToken || req.cookies.access_token;
    if (!accessToken) {
        const error = new Error("Access token not found. Please login.");
        error.status = 406;
        throw error;
    }
    const data = await fetchTopArtists(accessToken);
    return res.json(data);
});

const topTracks = asyncHandler(async (req, res) => {
    const accessToken = req.accessToken || req.cookies.access_token;
    if (!accessToken) {
        const error = new Error("Access token not found. Please login.");
        error.status = 407;
        throw error;
    }
    const data = await fetchTopTracks(accessToken);
    return res.json(data);
});

const mostRecentTracks = asyncHandler(async (req, res) => {
    const accessToken = req.accessToken || req.cookies.access_token;
    if (!accessToken) {
        const error = new Error("Access token not found. Please login.");
        error.status = 408;
        throw error;
    }
    const data = await fetchRecentTracks(accessToken);
    return res.json(data);
});

const getRoastData = async (access_token) => {
    const topArtistsData = await fetchTopArtists(access_token);
    const topTracksData = await fetchTopTracks(access_token);
    const recentTracksData = await fetchRecentTracks(access_token);

    return {
        topArtists: topArtistsData,
        topTracks: topTracksData,
        recentTracks: recentTracksData
    };
}

const getRoastJSON = asyncHandler(async (req, res) => {
    const accessToken = req.accessToken || req.cookies.access_token;
    if (!accessToken) {
        const error = new Error("Access token not found. Please login.");
        error.status = 409;
        throw error;
    }

    try {
        const roastData = await getRoastData(accessToken);
        const roastJSON = buildRoaster(roastData);
        return res.json(roastJSON);
    } catch (err) {
        console.error("Error in getRoastJSON:", err);
        const error = new Error(err.message || "Failed to generate roast data");
        error.status = 500;
        throw error;
    }
});

const logout = asyncHandler((req, res) => {
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }
    return res
        .clearCookie("access_token", options)
        .clearCookie("refresh_token", options)
        .status(200)
        .json({
            status: 200,
            success: true,
            message: "logged out successfully"
        })
        .redirect(process.env.APP_URL);
})



export { logout, generateToken, getRoastData, buildRoaster, userLogin, spotifyCallback, userMe, topArtists, topTracks, mostRecentTracks, getRoastJSON };