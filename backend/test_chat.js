import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: "https://api.x.ai/v1",
});

async function main() {
    try {
        console.log("Trying Chat Completion with openai SDK...");
        const completion = await openai.chat.completions.create({
            model: "grok-beta", 
            messages: [{ role: 'user', content: "Hello!" }],
        });
        console.log("Success SDK:", completion.choices[0].message.content);
    } catch (e) {
        console.error("Error SDK:", e.response?.data || e.message);
    }

    try {
        console.log("\nTrying direct fetch to /v1/responses...");
        const response = await fetch("https://api.x.ai/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROK_API_KEY}`
            },
            body: JSON.stringify({
                model: "grok-4.20-reasoning",
                input: "Hello!"
            })
        });
        const data = await response.text();
        console.log("Response /v1/responses:", data);
    } catch (e) {
        console.error("Error direct fetch:", e.message);
    }
}

main();
