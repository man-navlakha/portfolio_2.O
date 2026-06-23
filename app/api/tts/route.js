import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const url = `https://tts-production-57ce.up.railway.app/tts/live?text=${encodeURIComponent(text)}&voice=af_heart&lang_code=a`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Kokoro TTS Error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    console.error('Kokoro TTS generation failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
