import { NextResponse } from 'next/server';
import { checkIsStreamLive } from '@/lib/kick';

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
    const isLive = await checkIsStreamLive(slug);
    return NextResponse.json({ chatroomId, channelId, slug, isLive });
  }

  return NextResponse.json({ chatroomId: null, channelId: null, slug, isLive: false });
}
