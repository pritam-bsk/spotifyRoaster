import 'dotenv/config'

console.log(process.env.GEMINI_API_KEY);

const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: "how to use AI" }]
                }
            ]
        })
    }
);
const data = await resp.json();
console.log(data);