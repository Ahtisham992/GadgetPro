import dotenv from 'dotenv';
dotenv.config();

async function getModels() {
    try {
        const response = await fetch('https://api.x.ai/v1/models', {
            headers: { 'Authorization': `Bearer ${process.env.GROK_API_KEY}` }
        });
        const data = await response.json();
        console.log("AVAILABLE MODELS:", data.data?.map(m => m.id));
    } catch (e) {
        console.error("Failed to fetch models: ", e);
    }
}

getModels();
