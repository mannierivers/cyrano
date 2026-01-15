import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { transcript, mode } = await req.json();

    const systemPrompt = `You are the Cyrano Neural Interface. 
Context: ${mode}.
Analyze the stream and return:
1. Vibe: Technical diagnostic (e.g., "Sarcasm Detected: 85% Intensity").
2. Vibe_Color: 'red', 'orange', 'green', 'blue'.
3. 3 Strategic Responses: Sleek, high-impact phrasing.
Respond ONLY in JSON.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this: "${transcript}"` }
      ],
      response_format: { type: "json_object" }, // Forces Groq to output JSON
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    console.log("AI Raw Output:", content); // Check your terminal to see this!

    if (!content) throw new Error("AI returned nothing");

    // Robust parsing
    const parsedData = JSON.parse(content);
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ 
      vibe: "Error 😵‍💫", 
      vibe_color: "red", 
      suggestions: [{ text: "Check your terminal for errors.", label: "System", why: "Something went wrong" }] 
    });
  }
}