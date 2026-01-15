import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { transcript, mode } = await req.json();

    const systemPrompt = `
      IDENT_SYSTEM: SUBTX_INTELLIGENCE_ENGINE
      PROTOCOL: NEURAL_SOCIAL_SCAFFOLDING
      CONTEXT: ${mode.toUpperCase()}
      
      TASK: Decode social transmission (TX) for neurodivergent users.
      1. ANALYZE: Detect latent subtext, emotional velocity, and speaker intent.
      2. DIAGNOSE: Return a 2-3 word "Vibe Check" + Vibe_Color (red/orange/green/blue).
      3. STRATEGIZE: Provide 3 high-impact dialogue modules.
      
      STRICT JSON FORMAT:
      {
        "vibe": "Diagnostic string here",
        "vibe_color": "color_code",
        "suggestions": [
          { "text": "Direct response", "label": "Strategic Label", "why": "Rationale" }
        ]
      }
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `INPUT_STREAM: "${transcript}"` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6, // Slightly lower for more consistent "Professional" advice
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("NULL_STREAM");

    return NextResponse.json(JSON.parse(content));
  } catch (error: any) {
    console.error("SUBTX_API_ERROR:", error);
    return NextResponse.json({ error: "LINK_FAILURE" }, { status: 500 });
  }
}