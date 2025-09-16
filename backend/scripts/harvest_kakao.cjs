// backend/scripts/harvest_kakao.cjs
// 실행: node --env-file=.env backend/scripts/harvest_kakao.cjs

const fs = require('fs/promises');

/* =========================
 * 환경변수
 * ========================= */
const KAKAO_KEY  = process.env.KAKAO_REST_API_KEY;
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY; // === [ADDED] 구글 Places 보강용 키

if (!KAKAO_KEY) {
  console.error('❌ backend/.env 에 KAKAO_REST_API_KEY가 없습니다.');
  process.exit(1);
}

const CENTER_ADDRESS       = process.env.CENTER_ADDRESS || '서울 서대문구 창천동 57-18';
const RADIUS_M             = Number(process.env.RADIUS_M || 1200);
const TARGET_PER_CATEGORY  = Number(process.env.TARGET_PER_CATEGORY || 30);

/* =========================
 * 수집 대상 카테고리
 * ========================= */
const CATEGORIES = [
  { key: 'restaurant', supa: 'restaurant', kakaoGroup: 'FD6' }, // 음식점
  { key: 'cafe',       supa: 'cafe',       kakaoGroup: 'CE7' }, // 카페
  { key: 'culture',    supa: 'culture',    kakaoGroup: 'CT1' }, // 문화시설
  { key: 'experience', supa: 'experience', kakaoGroup: null     } // 키워드 검색
];

// 체험 키워드
const EXPERIENCE_KEYWORDS = [
  '공방','원데이클래스','원데이 클래스','도예','가죽공방',
  '캔들 클래스','플라워 레슨','액티비티','목공방'
];

/* =========================
 * 유틸
 * ========================= */
const sleep   = (ms) => new Promise(r => setTimeout(r, ms));
const pgArray = (arr) => '{' + (arr || []).map(s => `"${String(s).replace(/"/g, '\\"')}"`).join(',') + '}';

function toCsv(rows, headers) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = headers.map(esc).join(',');
  const lines = rows.map(r => headers.map(h => esc(r[h])).join(','));
  return [head, ...lines].join('\n');
}

/* =========================
 * Kakao API
 * ========================= */
async function geocodeByKakaoAddress(addr) {
  const url = new URL('https://dapi.kakao.com/v2/local/search/address.json');
  url.searchParams.set('query', addr);
  const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_KEY}` }});
  if (!res.ok) throw new Error(`Kakao geocode failed (${res.status})`);
  const data = await res.json();
  const doc = data.documents && data.documents[0];
  if (!doc) throw new Error('No geocode result');
  return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) };
}

async function kakaoSearchCategory({ lat, lng, code }) {
  const list = [];
  for (let page = 1; page <= 15 && list.length < TARGET_PER_CATEGORY; page++) {
    const url = new URL('https://dapi.kakao.com/v2/local/search/category.json');
    url.searchParams.set('category_group_code', code);
    url.searchParams.set('x', String(lng));
    url.searchParams.set('y', String(lat));
    url.searchParams.set('radius', String(RADIUS_M)); // 최대 20000
    url.searchParams.set('page', String(page));
    url.searchParams.set('size', '15');

    const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_KEY}` }});
    if (!res.ok) throw new Error(`Kakao category search failed (${res.status})`);
    const data = await res.json();

    for (const d of (data.documents || [])) {
      list.push({
        kakao_id: d.id,
        name: d.place_name,
        address: d.road_address_name || d.address_name || '',
        lat: parseFloat(d.y),
        lng: parseFloat(d.x),
        place_url: d.place_url,
        category_name: d.category_name || ''
      });
      if (list.length >= TARGET_PER_CATEGORY) break;
    }

    if (data.meta && data.meta.is_end) break;
    await sleep(120);
  }
  return Array.from(new Map(list.map(i => [i.kakao_id, i])).values()).slice(0, TARGET_PER_CATEGORY);
}

async function kakaoSearchExperience({ lat, lng }) {
  const list = [];
  let kwIdx = 0;
  for (let tries = 0; tries < 60 && list.length < TARGET_PER_CATEGORY; tries++) {
    const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
    url.searchParams.set('query', EXPERIENCE_KEYWORDS[kwIdx % EXPERIENCE_KEYWORDS.length]);
    kwIdx++;
    url.searchParams.set('x', String(lng));
    url.searchParams.set('y', String(lat));
    url.searchParams.set('radius', String(RADIUS_M));
    url.searchParams.set('page', '1');
    url.searchParams.set('size', '15');

    const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_KEY}` }});
    if (!res.ok) throw new Error(`Kakao keyword search failed (${res.status})`);
    const data = await res.json();

    for (const d of (data.documents || [])) {
      list.push({
        kakao_id: d.id,
        name: d.place_name,
        address: d.road_address_name || d.address_name || '',
        lat: parseFloat(d.y),
        lng: parseFloat(d.x),
        place_url: d.place_url,
        category_name: d.category_name || ''
      });
      if (list.length >= TARGET_PER_CATEGORY) break;
    }
    await sleep(120);
  }
  return Array.from(new Map(list.map(i => [i.kakao_id, i])).values()).slice(0, TARGET_PER_CATEGORY);
}

/* =========================
 * Google Places 보강
 * ========================= */
// === [ADDED] 요일 텍스트 → JSONB
function weekdayTextToJson(weekdayText = []) {
  const map = { mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday' };
  const out = {};
  for (const [k, eng] of Object.entries(map)) {
    const line = weekdayText.find(t => t.startsWith(eng));
    out[k] = line ? line.split(': ').slice(1).join(': ') : '';
  }
  return out;
}

// === [ADDED] price_level(0~4) → 문자열
function priceLevelToKRW(level) {
  const L = { 0:'무료/매우저렴', 1:'₩~₩₩(저렴)', 2:'₩₩(보통)', 3:'₩₩₩(비쌈)', 4:'₩₩₩₩(매우비쌈)' };
  return (level ?? null) in L ? L[level] : '';
}

// === [CHANGED] findplace 실패시 보조(Text Search) + 한국어/지역 바이어스 + 상세 로그
async function googleFindAndDetails(name, address, bias) {
  if (!GOOGLE_KEY) return null;

  const readJson = async (res) => {
    const j = await res.json().catch(() => ({}));
    if (j.status && j.status !== 'OK') {
      console.log('[GoogleAPI]', j.status, j.error_message || '');
    }
    return j;
  };

  const input = `${name} ${address}`.trim();

  // 1) Find Place (ko/KR + locationbias)
  const fp = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  fp.searchParams.set('input', input);
  fp.searchParams.set('inputtype', 'textquery');
  fp.searchParams.set('fields', 'place_id');
  fp.searchParams.set('language', 'ko');
  fp.searchParams.set('region', 'KR');
  if (bias) fp.searchParams.set('locationbias', `point:${bias.lat},${bias.lng}`);
  fp.searchParams.set('key', GOOGLE_KEY);

  let res = await fetch(fp);
  if (!res.ok) { console.log('[GoogleAPI] findplace http', res.status); return null; }
  let data = await readJson(res);
  let placeId = data.candidates?.[0]?.place_id;

  // 1-보) 이름만 / 주소만 재시도
  if (!placeId) {
    const altInputs = [name, address].filter(Boolean);
    for (const inp of altInputs) {
      const fp2 = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
      fp2.searchParams.set('input', inp);
      fp2.searchParams.set('inputtype', 'textquery');
      fp2.searchParams.set('fields', 'place_id');
      fp2.searchParams.set('language', 'ko');
      fp2.searchParams.set('region', 'KR');
      if (bias) fp2.searchParams.set('locationbias', `point:${bias.lat},${bias.lng}`);
      fp2.searchParams.set('key', GOOGLE_KEY);
      const r2 = await fetch(fp2);
      if (!r2.ok) continue;
      const d2 = await readJson(r2);
      if (d2.candidates?.[0]?.place_id) { placeId = d2.candidates[0].place_id; break; }
      await sleep(80);
    }
  }

  // 1-보2) Text Search (query + location + radius)
  if (!placeId && bias) {
    const ts = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    ts.searchParams.set('query', input);
    ts.searchParams.set('location', `${bias.lat},${bias.lng}`);
    ts.searchParams.set('radius', '1500');
    ts.searchParams.set('language', 'ko');
    ts.searchParams.set('region', 'KR');
    ts.searchParams.set('key', GOOGLE_KEY);
    const r3 = await fetch(ts);
    if (r3.ok) {
      const d3 = await readJson(r3);
      placeId = d3.results?.[0]?.place_id || null;
    }
  }

  if (!placeId) {
    console.log('NO MATCH:', name, '|', address); // === [ADDED] 어디서 매칭 실패하는지 추적
    return null;
  }

  // 2) Details
  const det = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  det.searchParams.set('place_id', placeId);
  det.searchParams.set('fields', 'rating,user_ratings_total,opening_hours/weekday_text,price_level,photos,website');
  det.searchParams.set('language', 'ko');
  det.searchParams.set('region', 'KR');
  det.searchParams.set('key', GOOGLE_KEY);

  res = await fetch(det);
  if (!res.ok) { console.log('[GoogleAPI] details http', res.status); return null; }
  data = await readJson(res);
  const r = data.result || {};

  const photoRefs = (r.photos || []).slice(0, 3).map(p => p.photo_reference);

  // === [CHANGED] 개발/발표 편의상 직접 URL 저장 (키 노출 위험; 배포 시 프록시로 전환 권장)
  const imageUrls = photoRefs.map(ref =>
    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1280&photo_reference=${ref}&key=${GOOGLE_KEY}`
  );

  return {
    rating: r.rating ?? 0,
    review_count: r.user_ratings_total ?? 0,
    price_range: priceLevelToKRW(r.price_level),
    hours_json: weekdayTextToJson(r.opening_hours?.weekday_text || []),
    website: r.website || '',
    images: imageUrls
  };
}

/* =========================
 * 메인
 * ========================= */
(async () => {
  try {
    console.log('▶ 중심 주소 지오코딩:', CENTER_ADDRESS);
    const center = await geocodeByKakaoAddress(CENTER_ADDRESS);
    console.log('   →', center);

    const allRows = [];

    for (const cat of CATEGORIES) {
      console.log(`\n[${cat.key}] 수집 (반경 ${RADIUS_M}m)…`);
      const places = cat.kakaoGroup
        ? await kakaoSearchCategory({ lat: center.lat, lng: center.lng, code: cat.kakaoGroup })
        : await kakaoSearchExperience({ lat: center.lat, lng: center.lng });

      console.log(`  → ${places.length}개`);

      // === [ADDED] 보강 성공/실패 카운트 로그
      let enriched = 0, missed = 0;

      for (const p of places) {
        // === [CHANGED] 구글 보강 호출 (ko/KR + textsearch fallback + 로그)
        let g = null;
        try {
          g = await googleFindAndDetails(p.name, p.address, { lat: center.lat, lng: center.lng });
        } catch (_) {}
        await sleep(120); // rate 조절

        if (g) enriched++; else missed++;

        allRows.push({
          id: '', // DB default
          name: p.name,
          category: cat.supa,
          description: '',
          address: p.address,
          latitude: p.lat.toFixed(8),
          longitude: p.lng.toFixed(8),
          operating_hours: JSON.stringify(g?.hours_json || {}), // JSONB
          price_range: g?.price_range || '',
          images: pgArray(g?.images || []),                     // text[]
          reservation_link: g?.website || p.place_url,
          rating: g?.rating ?? 0,
          review_count: g?.review_count ?? 0,
          is_active: true,
          created_at: '',
          updated_at: ''
        });
      }

      console.log(`  → 구글 보강 성공 ${enriched} · 실패 ${missed} (GOOGLE_KEY ${GOOGLE_KEY ? '있음' : '없음'})`);
    }

    const headers = [
      'id','name','category','description','address',
      'latitude','longitude','operating_hours','price_range',
      'images','reservation_link','rating','review_count',
      'is_active','created_at','updated_at'
    ];
    const csv = toCsv(allRows, headers);
    const filename = `local_spots_kakao_${Date.now()}.csv`;
    await fs.writeFile(filename, csv, 'utf8');

    console.log(`\n✅ 완료: ${filename}`);
    console.log(`총 ${allRows.length}행`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();