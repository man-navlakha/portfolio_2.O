import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is missing' }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Puck" // High-quality, warm, conversational voice
              }
            }
          }
        }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini TTS Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const base64Audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error('No audio data received from Gemini TTS');
    }

    // Return the base64 audio to the client
    return NextResponse.json({ audioBase64: base64Audio });
    
  } catch (error) {
    console.error('TTS generation failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
