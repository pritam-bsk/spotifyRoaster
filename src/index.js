import express from 'express';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
    res.json({
        message: "Hello, World!",
        status: "success"
    });
})

const SCOPES = [
  "user-top-read",
  "user-read-recently-played",
  "user-read-email",
].join(" ");

app.get('/login', (req, res) => {
    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: SCOPES,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    });

    res.redirect(`https://accounts.spotify.com/authorize?${params}`);
})

app.get('/api/v1/spotify-callback', (req, res) => {
    console.log(req);
    return res.send("#########Callback received#########");
})

app.listen(PORT, () => {
    console.log(`Server is running on ${process.env.APP_URL}${PORT}`);
});