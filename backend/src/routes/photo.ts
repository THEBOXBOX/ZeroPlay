import { Router } from 'express';

const router = Router();
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY!;
if (!GOOGLE_KEY) {
  // 서버 부팅 시점에서 키 없으면 바로 알림
  console.warn('[photo] GOOGLE_MAPS_API_KEY not set. /api/photo will fail.');
}

router.get('/photo', async (req, res) => {
  const ref = String(req.query.ref || '');
  if (!ref) return res.status(400).send('missing ref');

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/photo');
    url.searchParams.set('maxwidth', '1280');
    url.searchParams.set('photo_reference', ref);
    url.searchParams.set('key', GOOGLE_KEY);

    // follow로 최종 리소스까지 따라감
    const upstream = await fetch(url, { redirect: 'follow' });

    if (!upstream.ok) {
      // 구글 에러 메시지 전달(가능하면)
      const msg = await upstream.text().catch(() => '');
      return res.status(502).send(msg || 'google photo error');
    }

    // Content-Type/Cache 등 헤더 반영 (가능한 범위)
    const ctype = upstream.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', ctype);
    const cacheControl = upstream.headers.get('cache-control');
    if (cacheControl) res.setHeader('Cache-Control', cacheControl);

    // ✅ TS 안전: body 스트림 대신 arrayBuffer로 받아서 전송
    const buf = Buffer.from(await upstream.arrayBuffer());
    return res.end(buf);
  } catch (err) {
    console.error('[photo] proxy error', err);
    return res.status(500).send('proxy error');
  }
});

export default router;