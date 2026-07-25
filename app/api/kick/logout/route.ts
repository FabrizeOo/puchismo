import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/url-utils';

export async function GET(req: Request) {
  const appUrl = getAppUrl(req);
  const response = NextResponse.redirect(new URL('/rewards', appUrl).toString());

  response.cookies.set('kick_user_profile', '', { expires: new Date(0), path: '/' });
  response.cookies.set('kick_access_token', '', { expires: new Date(0), path: '/' });

  return response;
}

export async function POST(req: Request) {
  const response = NextResponse.json({ success: true, message: 'Sesión cerrada correctamente' });

  response.cookies.set('kick_user_profile', '', { expires: new Date(0), path: '/' });
  response.cookies.set('kick_access_token', '', { expires: new Date(0), path: '/' });

  return response;
}
