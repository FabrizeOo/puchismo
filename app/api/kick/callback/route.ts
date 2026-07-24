import { NextResponse } from 'next/server';
import { saveUserPoints } from '@/lib/points-db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Retrieve verifier and state cookies
  const cookiesList = req.headers.get('cookie') || '';
  const getCookie = (name: string) => {
    const matches = cookiesList.match(new RegExp(`(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  };

  const storedState = getCookie('kick_oauth_state');
  const storedVerifier = getCookie('kick_oauth_verifier');

  if (!code || !state || state !== storedState) {
    return NextResponse.json({ error: 'Fallo de verificación de state / CSRF' }, { status: 400 });
  }

  const clientId = process.env.KICK_CLIENT_ID || '01KTM0Z2YWRQC5TTW3B398FDTF';
  const clientSecret = process.env.KICK_CLIENT_SECRET || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
      return NextResponse.json({ error: 'Error intercambiando el código de autorización' }, { status: 400 });
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

    // Write everything to a debug log file in the project root
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
      require('fs').appendFileSync(require('path').join(process.cwd(), 'kick_debug.txt'), logContent);
    } catch (logErr) {
      console.error('Failed to write kick_debug.txt', logErr);
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
    const dbUser = saveUserPoints(userData);

    // Combine profile data with database points for the frontend cookie
    const clientUserData = {
      ...userData,
      points: dbUser.points,
      watchTimeMinutes: dbUser.watchTimeMinutes,
      chatMessagesCount: dbUser.chatMessagesCount,
    };

    // Redirect to /rewards with cookies set
    const redirectUrl = new URL('/rewards', appUrl);
    const response = NextResponse.redirect(redirectUrl.toString());

    // Save profile data in a non-httpOnly cookie for client UI
    response.cookies.set('kick_user_profile', JSON.stringify(clientUserData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Save tokens in secure httpOnly cookies
    response.cookies.set('kick_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
    return NextResponse.json({ error: 'Error interno en el servidor durante la autenticación' }, { status: 500 });
  }
}
