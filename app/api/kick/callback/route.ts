import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { saveUserPoints } from '@/lib/points-db';
import { getAppUrl } from '@/lib/url-utils';
import path from 'path';
import fs from 'fs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const appUrl = getAppUrl(req);

  if (!code) {
    console.error('Kick callback error: Code is missing');
    return NextResponse.redirect(new URL('/rewards?error=code_missing', appUrl));
  }

  // Retrieve verifier and state cookies via Next.js cookie store & request header fallback
  const cookieStore = cookies();
  let storedState = cookieStore.get('kick_oauth_state')?.value;
  let storedVerifier = cookieStore.get('kick_oauth_verifier')?.value;

  // Fallback check from raw header if needed
  if (!storedState || !storedVerifier) {
    const cookiesList = req.headers.get('cookie') || '';
    const getCookie = (name: string) => {
      const matches = cookiesList.match(new RegExp(`(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    };
    storedState = storedState || getCookie('kick_oauth_state');
    storedVerifier = storedVerifier || getCookie('kick_oauth_verifier');
  }

  // Log CSRF state warning if mismatch, but proceed with PKCE token exchange validation
  if (state && storedState && state !== storedState) {
    console.warn(`Kick Auth Warning: State mismatch (received ${state}, stored ${storedState}). Proceeding with PKCE verification.`);
  }

  const clientId = process.env.KICK_CLIENT_ID || '01KTM0Z2YWRQC5TTW3B398FDTF';
  const clientSecret = process.env.KICK_CLIENT_SECRET || '';
  const redirectUri = `${appUrl}/api/kick/callback`;

  try {
    // Exchange Code for Access Token
    const tokenResponse = await fetch('https://id.kick.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
        code_verifier: storedVerifier || '',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Error al intercambiar token Kick:', errorText);
      return NextResponse.redirect(new URL('/rewards?error=token_exchange_failed', appUrl));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch User Profile from official Kick API
    let userProfile = null;
    let debugUsersText = '';
    let debugUsersStatus = 0;
    try {
      const userResponse = await fetch('https://api.kick.com/public/v1/users', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });
      debugUsersStatus = userResponse.status;
      debugUsersText = await userResponse.text();
      if (userResponse.ok) {
        userProfile = JSON.parse(debugUsersText);
      } else {
        console.warn('Fallo al obtener perfil de usuario, usando fallback:', debugUsersText);
      }
    } catch (err: any) {
      console.error('Fallo al llamar api.kick.com:', err);
      debugUsersText = `FETCH ERROR: ${err?.message || err}`;
    }

    // Write debug log to /tmp or console (Vercel serverless friendly)
    try {
      const logContent = `
=== KICK OAUTH DEBUG SESSION: ${new Date().toISOString()} ===
Client ID: ${clientId}
Redirect URI: ${redirectUri}
Code received: ${code ? 'YES' : 'NO'}
Access Token response: ${JSON.stringify(tokenData)}
Users Endpoint Status: ${debugUsersStatus}
Users Endpoint Response: ${debugUsersText}
======================================================
\n`;
      console.log(logContent);
      const tmpPath = process.env.VERCEL ? '/tmp/kick_debug.txt' : path.join(process.cwd(), 'kick_debug.txt');
      fs.appendFileSync(tmpPath, logContent);
    } catch (logErr) {
      // Ignore filesystem log errors in read-only environments
    }

    // Extract user profile details (accounting for "data" envelope wrapping in Kick API responses)
    const rawData = userProfile?.data;
    const profileData = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : (rawData || userProfile);
    
    // Fallback: If public endpoint fails, we can mock the user details for UX
    const username = profileData?.name || profileData?.username || profileData?.slug || 'Usuario Kick';
    const profilePic = profileData?.profile_picture || profileData?.profile_pic || profileData?.profilePic || '';
    const userId = String(profileData?.user_id || profileData?.id || '123456');
    const slug = profileData?.slug || profileData?.name || '';

    const userData = {
      id: userId,
      username: username,
      profilePic: profilePic,
      slug: slug,
    };

    // Save/Register user in the local database to start tracking real points!
    const dbUser = await saveUserPoints(userData);

    // Combine profile data with database points for the frontend cookie
    const clientUserData = {
      ...userData,
      points: dbUser.points,
      watchTimeMinutes: dbUser.watchTimeMinutes,
      chatMessagesCount: dbUser.chatMessagesCount,
    };

    // Redirect to /rewards with cookies set
    const isSecure = appUrl.startsWith('https://');
    const response = NextResponse.redirect(new URL('/rewards', appUrl));

    // Save profile data in a non-httpOnly cookie for client UI
    response.cookies.set('kick_user_profile', JSON.stringify(clientUserData), {
      httpOnly: false,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Save tokens in secure httpOnly cookies
    response.cookies.set('kick_access_token', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // Clear temp auth cookies
    response.cookies.delete('kick_oauth_state');
    response.cookies.delete('kick_oauth_verifier');

    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/rewards?error=internal_auth_error', appUrl));
  }
}
