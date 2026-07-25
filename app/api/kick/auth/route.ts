import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getAppUrl } from '@/lib/url-utils';

function base64url(buffer: Buffer) {
  return buffer.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function GET(req: Request) {
  const clientId = process.env.KICK_CLIENT_ID || '01KTM0Z2YWRQC5TTW3B398FDTF';
  const appUrl = getAppUrl(req);
  const redirectUri = `${appUrl}/api/kick/callback`;

  // PKCE: Generate Code Verifier and Code Challenge
  const codeVerifier = crypto.randomBytes(32).toString('hex'); // 64 characters
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  const codeChallenge = base64url(hash);
  
  // CSRF Protection: Generate State
  const state = crypto.randomBytes(16).toString('hex');

  // Scopes matching the ones registered in Kick Developer dashboard
  const scopes = 'user:read channel:read channel:rewards:read';

  // Construct authorization URL
  const authUrl = new URL('https://id.kick.com/oauth/authorize');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', scopes);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('code_challenge_method', 'S256');

  const isSecure = appUrl.startsWith('https://');

  const response = NextResponse.redirect(authUrl.toString());

  // Store PKCE verifier and state on the returned response cookies for Vercel Serverless Functions
  response.cookies.set('kick_oauth_verifier', codeVerifier, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  response.cookies.set('kick_oauth_state', state, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  // Also set on next/headers cookieStore for compatibility
  try {
    const cookieStore = cookies();
    cookieStore.set('kick_oauth_verifier', codeVerifier, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 10,
      path: '/',
    });
    cookieStore.set('kick_oauth_state', state, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 10,
      path: '/',
    });
  } catch (e) {}

  return response;
}
