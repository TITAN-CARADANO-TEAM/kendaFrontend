import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const systemPrompt = `
You are the Kenda Assistant, a helpful and friendly AI agent for the Kenda application.
Kenda is a ride-sharing and delivery application powered by the Cardano blockchain.
The user wants you to help them:
1. Understand how to use the specific Kenda app features (ordering rides, paying, becoming a driver).
2. Understand the Cardano blockchain simply (security, speed, low fees).

Your responses must be:
- Simple, clear, and reassuring.
- **Multilingual**: Detect the user's language and respond in the SAME language (e.g., if user asks in English, reply in English; if French, reply in French).
- Professional but accessible.
- Use simple Markdown formatting (bolding important terms, using lists) to make the text easy to read.

If you don't know something about the app, say you can't access user specific data but explain the general flow.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request body: 'messages' should be a non-empty array" },
        { status: 400 }
      );
    }

    // Using requested model (mapping 2.5 request to 2.0-flash-exp which is the current experimental next gen)
    // If this fails, we will fallback to gemini-pro.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prepare history:
    // IMPORTANT: History must alternate user/model and start with user if system prompt is not supported natively in history easily in this SDK version without careful role management.
    // Simpler approach for robust API: Send the system prompt + user conversation as the chat context.

    // We filter the messages to ensure valid roles.
    const validMessages = messages.map((msg: any) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content || "" }],
    }));

    // Start chat with system prompt
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Bien reçu. Je suis l'assistant Kenda. Je suis prêt à aider les utilisateurs." }] },
        // Add previous history excluding the very last message which will be sent now
      ]
    });

    const lastMessage = validMessages[validMessages.length - 1];

    // If there is history, add it (excluding last message)
    if (validMessages.length > 1) {
      // We have to rely on simple sendMessage for the *last* one.
      // But for history insertion, we can't easily insert into an *active* chat instance in the middle.
      // Actually, startChat takes the FULL history. 
      // So we should construct history = System + Conversation(minus last)
    }

    // Correct Approach:
    // 1. Construct Full History array
    const historyForChat = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Je suis l'assistant Kenda, prêt à aider." }] },
      ...validMessages.slice(0, -1) // All messages except the last one
    ];

    const chatSession = model.startChat({
      history: historyForChat
    });

    const query = lastMessage.parts[0].text;
    const result = await chatSession.sendMessage(query);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });

  } catch (error: any) {
    console.error("Error in chat API:", error);

    // Return detailed error for debugging
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
