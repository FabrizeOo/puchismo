import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { verifyAdminSessionToken, SESSION_COOKIE_NAME } from '@/lib/admin-auth';
import { recordPageView, recordEvent, classifyReferrerSource } from '@/lib/analytics-db';

// Firmas comunes de bots, crawlers y scrapers
const BOT_REGEX = /bot|spider|crawl|slurp|googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|whatsapp|telegrambot|twitterbot|discordbot|applebot|curl|wget|python|headlesschrome/i;

function parseUserAgent(ua: string) {
  let device: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  let browser = 'Otro';
  let os = 'Otro';

  if (!ua) return { device, browser, os, isBot: false };

  const isBot = BOT_REGEX.test(ua);

  // Device
  if (/ipad|tablet|playbook|silk/i.test(ua)) {
    device = 'tablet';
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(ua)) {
    device = 'mobile';
  }

  // OS
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/cros/i.test(ua)) os = 'ChromeOS';

  // Browser
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/samsungbrowser/i.test(ua)) browser = 'Samsung';

  return { device, browser, os, isBot };
}

export async function POST(req: Request) {
  try {
    // 1. Limitar tamaño del payload a 10KB
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 10240) {
      return new NextResponse(null, { status: 413 });
    }

    // 2. Respetar Do Not Track (DNT) y Global Privacy Control (GPC)
    const dnt = req.headers.get('dnt');
    const secGpc = req.headers.get('sec-gpc');
    if (dnt === '1' || secGpc === '1') {
      return new NextResponse(null, { status: 204 });
    }

    // 3. Ignorar visitas de administradores autenticados
    const cookieHeader = req.headers.get('cookie') || '';
    const adminSessionMatch = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
    if (adminSessionMatch && verifyAdminSessionToken(adminSessionMatch[1])) {
      return new NextResponse(null, { status: 204 });
    }

    // 4. Rate limiting por IP (máx 120 eventos por minuto)
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`trk_${ip}`, 120, 60 * 1000);
    if (!rateLimit.success) {
      return new NextResponse(null, { status: 204 }); // Responder 204 silencioso para no generar spam de errores
    }

    // 5. Filtrar Bots y Crawlers según User-Agent
    const ua = req.headers.get('user-agent') || '';
    const { device, browser, os, isBot } = parseUserAgent(ua);
    if (isBot) {
      return new NextResponse(null, { status: 204 });
    }

    // 6. Obtener país aproximado de las cabeceras del CDN / Vercel (sin almacenar la IP)
    const country =
      req.headers.get('x-vercel-ip-country') ||
      req.headers.get('cf-ipcountry') ||
      req.headers.get('cloudfront-viewer-country') ||
      'Desconocido';

    // 7. Parsear y validar el payload
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return new NextResponse(null, { status: 400 });
    }

    const type = body.type === 'click' ? 'click' : 'pageview';
    const visitorId = typeof body.vid === 'string' ? body.vid.slice(0, 64) : 'anon';
    const sessionId = typeof body.sid === 'string' ? body.sid.slice(0, 64) : 'anon';
    const path = typeof body.path === 'string' ? body.path.slice(0, 250) : '/';
    const rawReferrer = typeof body.ref === 'string' ? body.ref.slice(0, 500) : '';

    if (type === 'pageview') {
      const referrerSource = classifyReferrerSource(rawReferrer);
      const utm = body.utm && typeof body.utm === 'object' ? body.utm : {};

      await recordPageView({
        visitorId,
        sessionId,
        path,
        referrer: rawReferrer,
        referrerSource,
        utmSource: typeof utm.source === 'string' ? utm.source.slice(0, 80) : '',
        utmMedium: typeof utm.medium === 'string' ? utm.medium.slice(0, 80) : '',
        utmCampaign: typeof utm.campaign === 'string' ? utm.campaign.slice(0, 80) : '',
        utmTerm: typeof utm.term === 'string' ? utm.term.slice(0, 80) : '',
        utmContent: typeof utm.content === 'string' ? utm.content.slice(0, 80) : '',
        device,
        browser,
        os,
        country,
      });
    } else if (type === 'click') {
      const buttonName = typeof body.name === 'string' ? body.name.slice(0, 100) : 'unknown-button';

      await recordEvent({
        eventName: 'click',
        buttonName,
        visitorId,
        sessionId,
        path,
        device,
        referrer: rawReferrer,
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(null, { status: 204 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
