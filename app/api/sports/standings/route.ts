import { NextResponse } from 'next/server';
import { getStandings } from '@/lib/api/football-data';

export async function GET() {
  try {
    const standings = await getStandings('WC');
    return NextResponse.json({ standings });
  } catch (error) {
    return NextResponse.json({ standings: [], error: 'API no disponible' }, { status: 200 });
  }
}
