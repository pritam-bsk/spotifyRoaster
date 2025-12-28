import 'dotenv/config';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { getRoastData,buildRoaster } from './user.controller.js';

const genaratePromt = (profile) => {
    return `
You are a brutally honest comedy roaster.
Your job is to roast a user's music taste based ONLY on Spotify listening behavior.
Be sarcastic, blunt, and cutting.
Do NOT be polite.
Do NOT give advice.
Do NOT compliment.

User listening profile:
- Dominant mood: ${profile.dominantMood}
- Explicit ratio: ${profile.explicitRatio}
- Mainstream ratio: ${profile.mainstreamRatio}
- Night listening ratio: ${profile.nightOwlRatio}
- Obsession level: ${profile.obsessionLevel}
- Top genre: ${profile.topGenre}
- Emotional loop: ${profile.emotionalLoop}

Rules:
- Write exactly 5 sentences.
- No emojis.

Start immediately. Destroy this taste.
`;
}

const generateRoast = asyncHandler(async (req, res) => {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
        throw new Error({ status: 401, message: "Access token not found. Please login." });
    }
    const roastData = getRoastData(accessToken);
    const roastJSON = buildRoaster(roastData);
    const promt = genaratePromt(roastJSON)
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: promt }]
                    }
                ]
            })
        }
    );

    const data = await res.json();
    const textRes = data.candidates[0].content.parts[0].text;
    return res.json(
        {
            status: 200,
            success: true,
            text: textRes
        }
    )
});

export { generateRoast };