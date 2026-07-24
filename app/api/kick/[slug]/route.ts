import { NextResponse } from 'next/server';

// IDs conocidos (hardcoded para evitar bloqueos de Kick al server)
const KNOWN_CHANNELS: Record<string, { chatroomId: number; channelId: number }> = {
  bepucho: { chatroomId: 5258420, channelId: 5282958 },
};

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug.toLowerCase();

  // Si tenemos el ID hardcodeado, intentamos verificar si está live
  if (KNOWN_CHANNELS[slug]) {
    const { chatroomId, channelId } = KNOWN_CHANNELS[slug];

    // Intentar obtener si está en vivo (puede fallar por CORS/bot, no crítico)
    let isLive = false;
    try {
      const res = await fetch(`https://kick.com/api/v2/channels/${slug}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
          Referer: 'https://kick.com/',
        },
        next: { revalidate: 60 }, // 1 min para el estado live
      });
      if (res.ok) {
        const data = await res.json();
        isLive = !!data.livestream;
      }
    } catch { /* silencioso */ }

    return NextResponse.json({ chatroomId, channelId, slug, isLive });
  }

  return NextResponse.json({ chatroomId: null, channelId: null, slug, isLive: false });
}
