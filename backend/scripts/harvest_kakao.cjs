// backend/scripts/harvest_kakao.cjs
// 실행: node --env-file=.env backend/scripts/harvest_kakao.cjs

const fs = require('fs/promises');

// ===== 설정 =====
const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;
if (!KAKAO_KEY) {
  console.error('❌ backend/.env 에 KAKAO_REST_API_KEY가 없습니다.');
  process.exit(1);
}

const CENTER_ADDRESS = process.env.CENTER_ADDRESS || '서울 서대문구 창천동 57-18';
const RADIUS_M = Number(process.env.RADIUS_M || 1200);
const TARGET_PER_CATEGORY = Number(process.env.TARGET_PER_CATEGORY || 30);

const CATEGORIES = [
  { key: 'restaurant', supa: 'restaurant', kakaoGroup: 'FD6' }, // 음식점
  { key: 'cafe',       supa: 'cafe',       kakaoGroup: 'CE7' }, // 카페
  { key: 'culture',    supa: 'culture',    kakaoGroup: 'CT1' }, // 문화시설
  { key: 'experience', supa: 'experience', kakaoGroup: null     } // 키워드 검색
];

const EXPERIENCE_KEYWORDS = [
  '공방','원데이클래스','원데이 클래스','도예','가죽공방',
  '캔들 클래스','플라워 레슨','액티비티','목공방'
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
// Postgres text[] 리터럴
const pgArray = (arr) => '{' + (arr || []).map(s => `"${String(s).replace(/"/g, '\\"')}"`).join(',') + '}';
// CSV (간단 버전)
function toCsv(rows, headers) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = headers.map(esc).join(',');
  const lines = rows.map(r => headers.map(h => esc(r[h])).join(','));
  return [head, ...lines].join('\n');
}

// ===== Kakao API =====
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

// ===== 메인 =====
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

      for (const p of places) {
        allRows.push({
          id: '', // DB default
          name: p.name,
          category: cat.supa,
          description: '',
          address: p.address,
          latitude: p.lat.toFixed(8),
          longitude: p.lng.toFixed(8),
          operating_hours: '{}',         // 보강 단계에서 채움
          price_range: '',
          images: pgArray([]),
          reservation_link: p.place_url, // 카카오 상세
          rating: 0,
          review_count: 0,
          is_active: true,
          created_at: '',
          updated_at: ''
        });
      }
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