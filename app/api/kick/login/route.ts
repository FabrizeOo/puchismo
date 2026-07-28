import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL('/api/kick/auth', req.url);
  return NextResponse.redirect(url);
}
