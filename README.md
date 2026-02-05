# Spotify Roaster Backend
- [Demo: https://spotify-roaster-phi.vercel.app/](https://spotify-roaster-phi.vercel.app/)
- backend request 

## Backend Endpoints Expected

### Authentication Endpoints

**`GET /user/login`**
- Initiates Spotify OAuth flow
- Redirects to Spotify login page
- Sets authentication cookies after OAuth callback
- Finally redirects to frontend root (/)

**`GET /user/me`**
- Returns current authenticated user information
- Response format:
```json
{
  "id": "spotify_user_id",
  "display_name": "User Display Name",
  "email": "user@example.com",
  "image_url": "https://url-to-profile-image.jpg"
}
```

**`GET /user/logout`**
- Clears authentication cookies
- Response format:
```json
{
  "status": 200,
  "success": true,
  "message": "logged out successfully"
}
```

### Music Data Endpoints

**`GET /api/v1/top-tracks`**
- Returns user's top tracks
- Response format (array):
```json
[
  {
    "name": "Track Name",
    "id": "track_id",
    "artist": "Artist Name",
    "popularity": 75,
    "explicit": false,
    "album_img": "https://url-to-album-art.jpg",
    "time_ms": 180000
  }
]
```

**`GET /api/v1/top-artists`**
- Returns user's top artists
- Response format (array):
```json
[
  {
    "name": "Artist Name",
    "genres": ["genre1", "genre2"],
    "popularity": 85,
    "profile_img": "https://url-to-artist-image.jpg",
    "followers": 1000000
  }
]
```

**`GET /api/v1/recently-played`**
- Returns recently played tracks
- Response format (array):
```json
[
  {
    "name": "Track Name",
    "id": "track_id",
    "artist": "Artist Name",
    "played_at": "2024-01-15T10:30:00Z",
    "album_img": "https://url-to-album-art.jpg",
    "time_ms": 180000
  }
]
```

### Roasting Endpoint

**`POST /api/v1/generate-roast`**
- Generates an AI roast of user's music taste
- Requires: `authenticate` middleware (checks cookies)
- Requires: `roasterLimit` middleware (max 2 roasts per hour)
- Response format:
```json
{
  "status": 200,
  "success": true,
  "text": "Your roast text here..."
}
```

**Error Response (Rate Limit):**
```json
{
  "success": false,
  "error": "Roast limit hit. Reflect on your music choices."
}
```

**Error Response (Gemini Quota):**
```json
{
  "success": false,
  "error": "Gemini quota exceeded"
}
```