const fetchTopArtists = async (accessToken) => {
    const res = await fetch(
        "https://api.spotify.com/v1/me/top/artists?limit=20&time_range=medium_term",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!res.ok) throw new Error("Failed to fetch top artists");

    const data = await res.json();

    return data.items.map(a => ({
        name: a.name,
        genres: a.genres,
        popularity: a.popularity,
        profile_img: a.images[2]?.url || null,
        followers: a.followers.total,
    }));
};

const fetchTopTracks = async (accessToken) => {
    const res = await fetch(
        "https://api.spotify.com/v1/me/top/tracks?limit=20",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!res.ok) throw new Error("Failed to fetch top tracks");

    const data = await res.json();


    return data.items.map(t => ({
        name: t.name,
        id: t.id,
        artist: t.artists[0].name,
        popularity: t.popularity,
        explicit: t.explicit,
        album_img: t.album.images[2]?.url || null,
        time_ms: t.duration_ms,
    }));
};

const fetchRecentTracks = async (accessToken) => {
    const res = await fetch(
        "https://api.spotify.com/v1/me/player/recently-played?limit=30",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!res.ok) throw new Error("Failed to fetch recent tracks");

    const data = await res.json();

    return data.items.map(i => ({
        name: i.track.name,
        id: i.track.id,
        artist: i.track.artists[0].name,
        played_at: i.played_at,
        album_img: i.track.album.images[2]?.url || null,
        time_ms: i.track.duration_ms,
    }));
};

const userDetails = async (accessToken) => {
    const userRes = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!userRes.ok) throw new Error("Failed to fetch user data");
    const userData = await userRes.json();
    return {
        id: userData.id,
        display_name: userData.display_name,
        email: userData.email,
        image_url: userData.images?.[0]?.url || null
    };
}

export {
    userDetails,
    fetchTopArtists,
    fetchTopTracks,
    fetchRecentTracks,
};
