import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { transcript, history } = await req.json();

    const systemPrompt = `You are Cyrano, a social coach for people on the autism spectrum.
Analyze the conversation transcript provided. 

Provide 3 distinct response options:
1. Label: "Supportive" (Focus on empathy and validation)
2. Label: "Curious" (Focus on asking a follow-up question to keep the conversation going)
3. Label: "Direct" (A polite but clear response for clarity)

For each option, explain the social "Why" so the user learns the underlying social cue.
Keep responses natural and concise.

Respond ONLY in JSON:
{ "suggestions": [{ "text": "string", "label": "string", "why": "string" }] }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Cyrano, a social coach for people on the autism spectrum. 
          Analyze the transcript and provide 3 appropriate response options.
          Respond ONLY in JSON: { "suggestions": [{ "text": "", "label": "", "why": "" }] }`
        },
        ...(history || []),
        { role: "user", content: transcript }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content from OpenAI");

    const data = JSON.parse(content);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}