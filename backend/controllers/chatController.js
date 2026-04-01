import { Groq } from 'groq-sdk';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
dotenv.config();

// Groq SDK automatically picks up GROQ_API_KEY from env, 
// but we map it explicitly just in case you named it GROK_API_KEY in your .env
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || process.env.GROK_API_KEY || "dummy",
});

// @desc    Process chat message with RAG context
// @route   POST /api/chat
// @access  Public (or semi-private depending on implementation)
const handleChat = asyncHandler(async (req, res) => {
    const { messages, cartContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
        res.status(400);
        throw new Error("Missing or invalid messages array");
    }

    // --- RAG Context Assembly ---
    // 1. Fetch available products (limit to crucial fields to save context window)
    const products = await Product.find({ countInStock: { $gt: 0 } })
        .select('_id name brand category price countInStock specs')
        .limit(30); // Limiting to top 30 to avoid blowing up context, ideally we'd use vector search here for specific queries, but for a general store chat, global context works well.

    const catalogString = products.map(p => 
        `- ${p.name} (ID: ${p._id}) [${p.brand} ${p.category}]: PKR ${p.price}. In Stock: ${p.countInStock}. Specs: ${p.specs?.processor || ''} ${p.specs?.ram || ''}`
    ).join('\n');

    // 2. Format the user's cart (if provided)
    let cartString = "Cart is empty.";
    if (cartContext && cartContext.length > 0) {
        cartString = cartContext.map(item => `- ${item.name} (Qty: ${item.qty})`).join('\n');
    }

    // 3. Inject into System Prompt
    const systemPrompt = `You are GadgetPro AI, a highly professional and consultative shopkeeper for a premium electronics store.

CURRENT STORE INVENTORY:
${catalogString}

USER'S CURRENT CART:
${cartString}

STRICT CONVERSATIONAL RULES:
1. PERSONA: Act like a professional, high-end store assistant. Engage in a natural, two-way conversation. Do NOT dump long lists of products.
2. CONSULTATION: If a user says they want a laptop, phone, etc., DO NOT immediately list options. FIRST, ask clarifying questions (e.g., "What is your primary use case?", "Do you have a specific budget in mind?"). Understand their needs before recommending anything.
3. LINKS: Only provide markdown links (format: [Product Name](/product/ID)) when you are actively recommending a specific product after understanding their needs.
4. MANAGING CART (CRITICAL RULE): DO NOT add items preemptively! 
   - If you are ASKING the user if they want to buy a product, you MUST NOT append the Action tag.
   - WAIT for the user to say "Yes", "Buy it", "Add 2 of them", etc. ONLY THEN are you allowed to append \`[ACTION:ADD_CART_ID_QTY]\` (replacing ID with the actual product ID, and QTY with the exact number they want). Example: \`[ACTION:ADD_CART_66b1a..._2]\`.
   - If no specific quantity is asked, default to 1: \`[ACTION:ADD_CART_ID_1]\`.
   - If the user explicitly asks to remove an item from their cart, you MUST append \`[ACTION:REMOVE_CART_ID]\`.
5. CHECKOUT/PAYMENT (CRITICAL): You are NOT a cash register. Under NO circumstances should you ask for payment methods, process payments, or say "I will proceed with the payment". If the user is ready to buy their cart items, tell them to visit their cart and provide this exact link: [Click here to go to your Cart and Checkout](/cart).
6. FORMATTING: Keep your responses concise, easy to read, and elegantly formatted using markdown. Over-communicating overwhelms the customer. Treat them with premium service.`;

    // Overwrite or assemble final payload
    const payloadMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
    ];

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: payloadMessages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false, // Set to false to easily return a JSON response to the React frontend
            stop: null
        });

        res.json({
            role: "assistant",
            content: chatCompletion.choices[0]?.message?.content || ""
        });
    } catch (error) {
        console.error("Grok API Error Details:", error.response?.data || error.message || error);
        
        // Graceful fallback for network timeouts or API blocks
        res.status(200).json({
            role: "assistant",
            content: "I'm currently experiencing connectivity issues and cannot reach my AI brain. However, you can browse our catalogs for gaming machines, or check the 'Frequently Bought Together' section on any product page!"
        });
    }
});

export { handleChat };
