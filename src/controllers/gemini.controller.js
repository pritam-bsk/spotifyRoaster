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

// const generateRoast = asyncHandler(async (req, res) => {
//     const accessToken = req.accessToken || req.cookies.access_token;
//     if (!accessToken) {
//         const error = new Error("Access token not found. Please login.");
//         error.status = 401;
//         throw error;
//     }
//     const roastData = await getRoastData(accessToken);
//     const roastJSON = buildRoaster(roastData);
//     const promt = genaratePromt(roastJSON)

//     const models = [
//         "gemini-2.5-flash",
//         "gemini-2.5-pro",
//         "gemini-2.5-flash-lite",
//         "gemini-2.0-flash",
//         "gemini-2.0-flash-001",
//         "gemini-2.0-flash-lite-001"
//     ];
//     let resp;
//     for (const model of models) {
//         try {
//             console.log(`Trying model: ${model}`);
//             resp = await callGemini(model, promt);

//             if (!resp.ok) {
//                 const errText = await resp.text();
//                 console.error(`Model ${model} failed:`, errText);
//                 continue;
//             }

//             break;
//         } catch (err) {
//             console.error(`Model ${model} crashed:`, err.message);
//         }
//     }
//     if (!resp || !resp.ok) {
//         throw new Error({ status: 500, message: "Failed to generate roast" });
//     }


//     const data = await resp.json();
//     const textRes = data.candidates[0].content.parts[0].text;
//     return res.json(
//         {
//             status: 200,
//             success: true,
//             text: textRes
//         }
//     )
// });

const generateRoast = asyncHandler(async (req, res) => {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
        throw new Error({ status: 401, message: "Access token not found. Please login." });
    }
    const roastData = await getRoastData(accessToken);
    const roastJSON = buildRoaster(roastData);
    const prompt = genaratePromt(roastJSON)
    const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
    );

    const data = await resp.json();
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