import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const response = NextResponse.redirect(new URL('/rewards', appUrl).toString());

  // Clear session cookies
  response.cookies.delete('kick_user_profile');
  response.cookies.delete('kick_access_token');

  return response;
}
