import 'dotenv/config';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { getRoastData, buildRoaster } from './user.controller.js';

const genaratePromt = async (profile) => {
    return `
You are a brutally honest comedy roaster.
Your job is to roast a user's music taste based on Spotify listening behavior.
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
- Use simple language.
- Use contractions.
- Use slang.
- Use humor.
- Use cultural references.
- Make it sound like a stand-up comedy roast.

Generate the roast now.
`;
};

const callGemini = async (model, prompt) => {
    return await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ]
            })
        }
    )
}

const generateRoast = asyncHandler(async (req, res) => {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
        throw new Error({ status: 401, message: "Access token not found. Please login." });
    }
    const roastData = await getRoastData(accessToken);
    const roastJSON = buildRoaster(roastData);
    const prompt = genaratePromt(roastJSON)
    const resp = await callGemini("gemini-2.5-flash", prompt);
    if (!resp.ok) {
        const error = new Error("Failed to generate roast");
        error.status = 500;
        throw error;
    }

    let data = await resp.json();
    if (data.error) {
        const resp2 = await callGemini("gemini-2.5-pro", prompt);
        if (!resp2.ok) {
            const error = new Error("Failed to generate roast");
            error.status = 500;
            throw error;
        }
        data = await resp2.json();
    }
    if (data.error) {
        const error = new Error(data.error.message || "Failed to generate roast");
        error.status = data.error.code || 500;
        throw error;
    }
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