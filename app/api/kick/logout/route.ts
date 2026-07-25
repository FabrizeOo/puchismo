import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/url-utils';

export async function GET(req: Request) {
  const appUrl = getAppUrl(req);
  const response = NextResponse.redirect(new URL('/rewards', appUrl).toString());

  // Clear session cookies
  response.cookies.delete('kick_user_profile');
  response.cookies.delete('kick_access_token');

  return response;
}
