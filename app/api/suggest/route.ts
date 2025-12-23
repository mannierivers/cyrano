import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { transcript, history } = await req.json();

    const systemPrompt = `You are Cyrano, a social coach for people on the autism spectrum.
Analyze the conversation transcript provided. 

First, perform a "Vibe Check": What is the emotional tone of the speaker? (e.g., Sarcastic, Stressed, Happy, Neutral).

Provide 3 distinct response options:
1. Label: "Supportive" (Focus on empathy and validation)
2. Label: "Curious" (Focus on asking a follow-up question)
3. Label: "Direct" (A polite but clear response for clarity)

For each option, explain the social "Why" so the user learns the underlying social cue.
Keep responses natural and concise.

Respond ONLY in JSON format:
{ "vibe": "Emotional tone here", 
 "suggestions": [{ "text": "string", "label": "string", "why": "string" }] }`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...(history || []),
        { role: "user", content: transcript }
      ],
      // Groq supports JSON mode just like OpenAI
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content from Groq");

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}