// artistcoach 공개 사이트 만들기 (설치할 것 없음, 노드만 있으면 된다)
//
//   node 만들기.js      → 결과/ 폴더에 완성된 사이트가 생긴다
//
// 읽는 것   자료/공고.json (조사 봇이 내보낸 확인된 공고)   색.json (색 두 개)   원본/ (아이콘 등 그대로 복사)
// 만드는 것  결과/index.html · notice/<번호>/index.html · about · 404 · sitemap · robots · 스타일 · 로고
//
// 시험용 환경변수  SITE_DATA=공고.json 경로   SITE_OUT=결과를 만들 폴더
// 규칙: 마감일과 원문 링크가 확인된 공고만 올린다. 요약·지원내용은 기관 원문 기준(위아츠 문장은 쓰지 않는다).

const fs = require('fs');
const path = require('path');

const 뿌리 = __dirname;
const 결과 = process.env.SITE_OUT || path.join(뿌리, '결과');
fs.rmSync(결과, { recursive: true, force: true });   // 예전에 만든 페이지(내려간 공고)가 남지 않게 매번 비우고 시작
const 자료경로 = process.env.SITE_DATA || path.join(뿌리, '자료', '공고.json');
const 주소 = 'https://artistcoach.kr';
const 인스타 = 'https://instagram.com/artistcoach_0gam';
const 기준 = (process.env.SITE_BASE || '').replace(/\/$/, '');   // 예: /artistcoach-site  (도메인을 연결하면 비운다)
const 길 = (p) => 기준 + p;

const 읽기 = (파일) => fs.readFileSync(path.join(뿌리, 파일), 'utf8');
const 쓰기 = (상대경로, 내용) => {
  const 파일 = path.join(결과, 상대경로);
  fs.mkdirSync(path.dirname(파일), { recursive: true });
  fs.writeFileSync(파일, 내용);
};
const 막기 = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ───────── 색: bg 와 brand 두 값에서 나머지를 계산한다 ─────────
const 숫자 = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const 글자 = (v) => '#' + v.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('').toUpperCase();
const 섞기 = (a, b, t) => { const x = 숫자(a), y = 숫자(b); return 글자(x.map((v, i) => v * (1 - t) + y[i] * t)); };
const 밝기 = (h) => { const c = 숫자(h).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const 대비 = (a, b) => { const x = 밝기(a), y = 밝기(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const 색설정 = JSON.parse(읽기('색.json'));
const { bg, 면, ink, sub, brand } = 색설정;
const 흰 = '#FFFFFF';
const 브랜드글 = 대비(ink, brand) >= 대비(흰, brand) ? ink : 흰;           // 단추 글씨: 더 잘 읽히는 쪽
let 깊음 = brand;                                                          // 링크 글씨: 흰 카드 위에서 4.5 이상 읽힐 때까지 어둡게
for (let t = 0; 대비(깊음, 흰) < 4.5 && t < 1; t += 0.04) 깊음 = 섞기(brand, ink, t);
const 연함 = 섞기(brand, 흰, 0.62);
const 아주연함 = 섞기(brand, 흰, 0.88);
const 바탕투명 = `rgba(${숫자(bg).join(',')},.92)`;
const 선 = 섞기(ink, bg, 0.88);

// ───────── 로고 (SVG, 선 굵기 52 하나) ─────────
const 로고SVG = (갓색 = brand, 먹 = ink, 수염 = 흰) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024"><title>아티스트 코치</title><g stroke-linejoin="round" stroke-linecap="round"><circle cx="512" cy="566" r="282" fill="none" stroke="${먹}" stroke-width="52"/><path d="M362 488 L446 538 M662 488 L578 538" fill="none" stroke="${먹}" stroke-width="52"/><g fill="${먹}" stroke="${먹}" stroke-width="104"><circle cx="512" cy="716" r="92"/><circle cx="352" cy="782" r="100"/><circle cx="672" cy="782" r="100"/><circle cx="512" cy="852" r="112"/></g><g fill="${수염}"><circle cx="512" cy="716" r="92"/><circle cx="352" cy="782" r="100"/><circle cx="672" cy="782" r="100"/><circle cx="512" cy="852" r="112"/></g><ellipse cx="512" cy="304" rx="402" ry="56" fill="${갓색}"/><path d="M396 52 Q512 38 628 52 L660 300 L364 300 Z" fill="${갓색}" stroke="${갓색}" stroke-width="10"/></g></svg>`;

// ───────── 날짜 ─────────
const 오늘 = new Date(); 오늘.setHours(0, 0, 0, 0);
const 오늘글 = `${오늘.getFullYear()}-${String(오늘.getMonth() + 1).padStart(2, '0')}-${String(오늘.getDate()).padStart(2, '0')}`;
const 남은날 = (d) => Math.round((new Date(d + 'T00:00:00') - 오늘) / 86400000);
const 요일 = ['일', '월', '화', '수', '목', '금', '토'];
const 날짜짧게 = (d) => { const x = new Date(d + 'T00:00:00'); return `${x.getMonth() + 1}월 ${x.getDate()}일 (${요일[x.getDay()]})`; };
const 마감글 = (d) => { const x = new Date(d + 'T00:00:00'); return `~ ${x.getMonth() + 1}월 ${x.getDate()}일<i> (${요일[x.getDay()]})</i>`; };
const 딱지글 = (d) => (d === '상시' ? '상시 접수' : 남은날(d) === 0 ? '오늘 마감' : `D-${남은날(d)}`);
const 급함 = (d) => d !== '상시' && 남은날(d) <= 3;

// ───────── 자료 ─────────
const 모음 = JSON.parse(fs.readFileSync(path.join(뿌리, '자료', '모음사이트.json'), 'utf8'));
const 호스트 = (u) => { try { return new URL(u).host.toLowerCase(); } catch (e) { return ''; } };
// 영감 규칙(2026-10-01): 위아츠·모모365·아트누리 같은 모음 사이트로 연결하거나 그 이름을 출처로 보이면 안 된다.
// 진짜 원문(기관 공고 페이지) 링크가 있는 공고만 올린다.
const 모음인가 = (x) => 모음.호스트.some((h) => 호스트(x.link).includes(h)) || 모음.이름.some((n) => (x.org || '').includes(n));
const 살아있는 = JSON.parse(fs.readFileSync(자료경로, 'utf8'))
  .filter((x) => x.deadline === '상시' || 남은날(x.deadline) >= 0);
const 가림 = 살아있는.filter(모음인가);
// 지역 칸에 모음 사이트 이름이 잘못 들어온 경우는 지역 없음으로 본다
살아있는.forEach((x) => { if (모음.이름.some((n) => (x.region || '').includes(n)) || /^모음/.test(x.region || '')) x.region = ''; });
const 공고 = 살아있는.filter((x) => !모음인가(x))
  .sort((a, b) => (a.deadline === '상시') - (b.deadline === '상시') || a.deadline.localeCompare(b.deadline));
const 상시수 = 공고.filter((x) => x.deadline === '상시').length;
// 인스타 카드뉴스 중 인기 있는 것 (조사 봇이 자료/추천.json 과 자료/추천/ 이미지를 내보낸다. 없으면 배너를 그리지 않는다)
const 추천경로 = process.env.SITE_REC || path.join(뿌리, '자료', '추천.json');
const 추천폴더 = process.env.SITE_RECIMG || path.join(뿌리, '자료', '추천');
const 추천 = (() => {
  if (!fs.existsSync(추천경로)) return [];
  try {
    return JSON.parse(fs.readFileSync(추천경로, 'utf8'))
      .map((r) => ({ ...r, 공고: 공고.find((x) => x.id === r.id) }))
      .filter((r) => r.공고 && r.image && /^[\w.\-가-힣 ]+$/.test(r.image) && fs.existsSync(path.join(추천폴더, r.image)))
      .sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 8);
  } catch (e) { console.log('추천.json 을 읽지 못해 배너를 건너뜁니다: ' + e.message); return []; }
})();
const 곧마감 = 공고.filter((x) => x.deadline !== '상시' && 남은날(x.deadline) <= 7);

// ───────── 스타일 ─────────
const 스타일 = `
:root{--bg:${bg};--면:${면};--ink:${ink};--sub:${sub};--브랜드:${brand};--브랜드글:${브랜드글};--깊음:${깊음};--연함:${연함};--아주연함:${아주연함};--선:${선};--바탕투명:${바탕투명}}
*{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:Pretendard,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic","맑은 고딕",system-ui,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;word-break:keep-all}
a{color:inherit}
:focus-visible{outline:3px solid var(--브랜드);outline-offset:2px;border-radius:6px}
.틀{max-width:980px;margin:0 auto;padding:0 18px}
mark{background:linear-gradient(transparent 58%,var(--연함) 58%);color:inherit}
i{font-style:normal}

.머리{position:sticky;top:0;z-index:30;background:var(--바탕투명);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid var(--선)}
.머리 .틀{display:flex;align-items:center;gap:22px;height:56px}
.로고줄{display:flex;align-items:center;gap:9px;text-decoration:none;margin-right:auto}
.로고줄 img{display:block;width:36px;height:36px}
.글자로고{font-weight:900;font-size:18.5px;letter-spacing:-.03em;white-space:nowrap}
.글자로고 mark{padding:0 7px;border-radius:8px;margin-left:2px;background:var(--연함)}
.머리 nav{display:flex;gap:20px}
.머리 nav a{text-decoration:none;font-size:14.5px;font-weight:600;color:var(--sub)}
.머리 nav a:hover,.머리 nav a[aria-current]{color:var(--ink)}

.영웅{padding:26px 0 14px}
.윗글{display:inline-block;font-size:12.5px;font-weight:800;padding:5px 12px;border-radius:999px;background:var(--브랜드);color:var(--브랜드글);margin:0 0 12px}
.영웅 h1{font-size:clamp(28px,6vw,44px);line-height:1.22;margin:0 0 10px;font-weight:900;letter-spacing:-.045em}
.영웅 .설명{font-size:15px;color:var(--sub);margin:0 0 16px;max-width:560px}
.검색줄{display:flex;gap:10px;max-width:560px}
.검색줄 input{flex:1;min-width:0;font:inherit;font-size:16px;padding:14px 18px;border:1.5px solid var(--ink);border-radius:16px;background:var(--면);color:var(--ink)}
.검색줄 input::placeholder{color:var(--sub)}
.수치{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;font-size:13px;color:var(--sub)}
.수치 span{background:var(--면);border:1px solid var(--선);border-radius:999px;padding:4px 12px}
.수치 b{color:var(--ink);font-weight:800}

.추천{margin:18px 0 8px}
.추천 .칸{position:relative;border-radius:22px;overflow:hidden;background:var(--면);border:1px solid var(--선)}
.추천 .줄{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
.추천 .줄::-webkit-scrollbar{display:none}
.추천 .장{flex:0 0 100%;scroll-snap-align:start;display:grid;grid-template-columns:minmax(0,260px) 1fr;gap:22px;align-items:center;padding:16px;text-decoration:none;color:inherit}
.추천 .장 img{width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;border-radius:14px;display:block;background:var(--연함)}
.추천 .장 .글{min-width:0;display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.추천 .장 h3{margin:0;font-size:19px;line-height:1.35;letter-spacing:-.03em;font-weight:900;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.추천 .장 .곳{font-size:13px;color:var(--sub)}
.추천 .장 .가기{margin-top:2px;font-weight:800;color:var(--깊음);font-size:14.5px}
.추천 .점줄{display:flex;gap:7px;justify-content:center;padding:0 0 12px}
.추천 .점{width:8px;height:8px;border-radius:999px;border:0;padding:0;background:var(--선);cursor:pointer}
.추천 .점[aria-current="true"]{background:var(--브랜드);width:22px}
.추천 .인스타{display:inline-block;font-size:12px;font-weight:800;color:var(--깊음);background:var(--연함);border-radius:999px;padding:3px 10px}
@media (max-width:560px){.추천 .장{grid-template-columns:minmax(0,40%) 1fr;gap:12px;padding:12px}.추천 .장 h3{font-size:16px;-webkit-line-clamp:4}}

.곧마감{margin:14px 0 6px}
.제목줄{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:8px}
.제목줄 h2{font-size:18px;margin:0;letter-spacing:-.03em;font-weight:900}
.글단추{font:inherit;font-size:13.5px;font-weight:800;color:var(--깊음);background:none;border:0;padding:4px 0;cursor:pointer}
.띠목록{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x proximity;padding:2px 2px 10px;margin:0 -18px;padding-left:18px;padding-right:18px;scrollbar-width:thin}
.미니{flex:none;width:236px;scroll-snap-align:start;background:var(--면);border:1px solid var(--선);border-radius:16px;padding:12px 14px;text-decoration:none;display:flex;flex-direction:column;gap:6px}
.미니:hover{border-color:var(--연함);box-shadow:0 5px 0 var(--아주연함)}
.미니 b{font-size:14.5px;line-height:1.42;font-weight:800;letter-spacing:-.02em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.미니 small{font-size:12.5px;color:var(--sub)}
.미니 .혜택{margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

.도구{position:sticky;top:56px;z-index:20;background:var(--바탕투명);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:10px 0 9px;border-bottom:1px solid var(--선)}
.칩줄{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.칩줄::-webkit-scrollbar{display:none}
.칩{flex:none;font:inherit;font-size:14px;font-weight:600;padding:8px 15px;border:1px solid var(--선);border-radius:999px;background:var(--면);color:var(--ink);cursor:pointer}
.칩[aria-pressed=true]{background:var(--브랜드);color:var(--브랜드글);border-color:var(--브랜드);font-weight:800}
.거름{padding-top:10px}
.거름 .칩{font-size:13.5px;padding:7px 13px}
.선택줄{display:flex;gap:8px;margin-top:8px}
.선택줄 select{flex:1;min-width:0;font:inherit;font-size:14.5px;padding:10px 12px;border:1px solid var(--선);border-radius:12px;background:var(--면);color:var(--ink)}
.개수줄{display:flex;align-items:center;justify-content:space-between;margin:14px 0 10px}
.개수{font-size:13.5px;color:var(--sub)}
.보기바꿈{display:flex;border:1px solid var(--선);border-radius:10px;overflow:hidden;background:var(--면)}
.보기바꿈 button{font:inherit;font-size:13px;font-weight:700;padding:6px 13px;border:0;background:transparent;color:var(--sub);cursor:pointer}
.보기바꿈 button[aria-pressed=true]{background:var(--ink);color:var(--bg)}

.목록{display:grid;grid-template-columns:1fr;gap:10px}
@media(min-width:900px){.목록{grid-template-columns:1fr 1fr}}
.카드{display:block;background:var(--면);border:1px solid var(--선);border-radius:18px;padding:16px 18px;text-decoration:none;transition:transform .12s,box-shadow .12s}
.카드:hover{transform:translateY(-1px);box-shadow:0 5px 0 var(--아주연함);border-color:var(--연함)}
.카드[hidden]{display:none!important}
.위{display:flex;align-items:center;gap:8px;margin-bottom:9px;flex-wrap:wrap}
.디{display:inline-block;font-size:12.5px;font-weight:800;padding:3px 11px;border-radius:999px;background:var(--연함);color:var(--깊음);white-space:nowrap}
.디.급{background:var(--브랜드);color:var(--브랜드글)}
.마감일{font-size:13px;color:var(--sub)}
.카드 h3{font-size:17px;line-height:1.45;margin:0 0 7px;font-weight:800;letter-spacing:-.02em}
.곳{font-size:13.5px;color:var(--sub)}
.혜택{margin-top:8px;font-size:13.5px;font-weight:700;color:var(--깊음);line-height:1.45}
.라벨{display:inline-block;font-size:11px;font-weight:800;padding:1px 7px;border-radius:6px;background:var(--아주연함);color:var(--깊음);margin-right:6px;vertical-align:1px}
/* 간단(한 줄) 보기: 카드보다 절반쯤 낮아서 스크롤이 크게 줄어든다 */
.목록.간단 .카드{display:flex;align-items:flex-start;gap:12px;padding:11px 14px;border-radius:14px}
.목록.간단 .본{flex:1;min-width:0}
.목록.간단 .위{flex:none;flex-direction:column;align-items:flex-start;gap:3px;width:78px;margin:0}
.목록.간단 .마감일 i{display:none}
.목록.간단 .마감일{font-size:12px}
.목록.간단 .카드 h3{font-size:15.5px;margin:0 0 2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.목록.간단 .곳{font-size:12.5px}
.목록.간단 .혜택{margin-top:4px;font-size:12.5px}
.더보기{display:block;margin:18px auto 0;font:inherit;font-size:15px;font-weight:800;padding:13px 28px;border:1.5px solid var(--ink);border-radius:14px;background:transparent;color:var(--ink);cursor:pointer}
.없음{text-align:center;color:var(--sub);padding:46px 0}
.맨위{position:fixed;right:16px;bottom:18px;z-index:40;width:46px;height:46px;border-radius:50%;border:0;background:var(--ink);color:var(--bg);font-size:20px;line-height:1;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.25);opacity:0;pointer-events:none;transition:opacity .2s}
.맨위.보임{opacity:1;pointer-events:auto}

.단추{display:inline-block;font:inherit;font-size:15px;font-weight:800;padding:13px 22px;border-radius:14px;text-decoration:none;border:0;cursor:pointer}
.단추.주{background:var(--브랜드);color:var(--브랜드글)}
.단추.준비{background:rgba(255,255,255,.14);color:inherit;cursor:default}

.상세{padding:22px 0 8px;max-width:720px}
.뒤로{display:inline-block;font-size:14px;font-weight:700;color:var(--sub);text-decoration:none;margin-bottom:14px}
.뒤로:hover{color:var(--ink)}
.상세 h1{font-size:clamp(24px,5vw,34px);line-height:1.35;margin:6px 0 18px;font-weight:900;letter-spacing:-.04em}
.정보{margin:0 0 20px;background:var(--면);border:1px solid var(--선);border-radius:18px;padding:6px 18px}
.정보 div{display:flex;gap:14px;padding:12px 0;border-bottom:1px solid var(--선)}
.정보 div:last-child{border-bottom:0}
.정보 dt{flex:none;width:76px;font-size:13.5px;color:var(--sub);font-weight:600}
.정보 dd{margin:0;font-size:15px;font-weight:600}
.정보 .혜택행 dd{color:var(--깊음);font-weight:800;font-size:16px}
.출처줄{font-size:13.5px;color:var(--sub);margin:-6px 2px 18px;line-height:1.7}
.출처줄 b{color:var(--ink)}
.요약{font-size:16px;line-height:1.75;margin:0 0 24px;padding:16px 18px;border-left:4px solid var(--브랜드);background:var(--아주연함);border-radius:0 14px 14px 0}
.요약.없음글{color:var(--sub);background:transparent;border-left-color:var(--선)}
.원문단추{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;font-size:17px;padding:17px 20px;border-radius:16px}
.안내{font-size:13.5px;color:var(--sub);margin:12px 2px 0}
.일반글{max-width:680px;padding:30px 0 10px}
.일반글 h1{font-size:clamp(26px,5vw,36px);letter-spacing:-.04em;margin:0 0 14px;font-weight:900}
.일반글 p{font-size:16px;line-height:1.8}
.일반글 .단추{margin-top:10px}

.바닥{margin-top:52px;border-top:1px solid var(--선);padding:26px 0 40px;font-size:13px;color:var(--sub);line-height:1.8}
.바닥 a{color:var(--sub)}
`;

// ───────── 공통 틀 ─────────
const 틀 = ({ 제목, 설명, 경로, 본문, 현재 = '', 스크립트 = '', 색인 = true }) => `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${막기(제목)}</title>
<meta name="description" content="${막기(설명)}">
<meta name="theme-color" content="${brand}">
${색인 ? '' : '<meta name="robots" content="noindex">'}
<link rel="canonical" href="${주소}${경로}">
<link rel="icon" href="${길('/logo.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${길('/icon-180.png')}">
<link rel="manifest" href="${길('/manifest.webmanifest')}">
<meta property="og:type" content="website">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="아티스트 코치">
<meta property="og:title" content="${막기(제목)}">
<meta property="og:description" content="${막기(설명)}">
<meta property="og:url" content="${주소}${경로}">
<meta property="og:image" content="${주소}/icon-512.png">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="${길('/style.css')}">
</head>
<body>
<header class="머리"><div class="틀">
  <a class="로고줄" href="${길('/')}"><img src="${길('/logo.svg')}" alt="" width="36" height="36"><span class="글자로고">아티스트<mark>코치</mark></span></a>
  <nav><a href="${길('/')}"${현재 === '공고' ? ' aria-current="page"' : ''}>공고</a><a href="${길('/about/')}"${현재 === '소개' ? ' aria-current="page"' : ''}>소개</a></nav>
</div></header>
<main class="틀">
${본문}
</main>
<footer class="틀 바닥">
  <div><b>아티스트 코치</b> · artistcoach.kr · <a href="${인스타}" target="_blank" rel="noopener">인스타그램 @artistcoach_0gam</a></div>
  <div>공고 정보는 각 기관의 원문을 기준으로 정리합니다. 지원 전에는 꼭 원문 공고에서 조건과 마감을 다시 확인해 주세요.</div>
</footer>
${스크립트}
</body>
</html>
`;

// ───────── 카드 · 미니 ─────────
const 곳글 = (x) => [x.org, x.region, x.target && x.target + ' 대상'].filter(Boolean).map(막기).join(' · ');
const 혜택줄 = (x) => (x.benefit ? `<div class="혜택"><span class="라벨">지원</span>${막기(x.benefit)}</div>` : '');
const 카드 = (x) => `<a class="카드" href="${길(`/notice/${x.id}/`)}" data-cat="${막기(x.cat)}" data-region="${막기(x.region)}" data-target="${막기(x.target)}" data-deadline="${x.deadline}" data-text="${막기((x.title + ' ' + x.org + ' ' + (x.benefit || '')).toLowerCase())}">
  <div class="위"><span class="디${급함(x.deadline) ? ' 급' : ''}" data-d="${x.deadline}">${딱지글(x.deadline)}</span>${x.deadline === '상시' ? '' : `<span class="마감일">${마감글(x.deadline)}</span>`}</div>
  <div class="본"><h3>${막기(x.title)}</h3><div class="곳">${곳글(x)}</div>${혜택줄(x)}</div>
</a>`;
const 미니 = (x) => `<a class="미니" href="${길(`/notice/${x.id}/`)}" data-deadline="${x.deadline}"><span class="디${급함(x.deadline) ? ' 급' : ''}" style="align-self:flex-start" data-d="${x.deadline}">${딱지글(x.deadline)}</span><b>${막기(x.title)}</b><small>${막기(x.org)}${x.region ? ' · ' + 막기(x.region) : ''}</small>${혜택줄(x)}</a>`;

// ───────── 첫 화면 ─────────
const 분류목록 = [...new Set(공고.map((x) => x.cat).filter(Boolean))];
const 기간목록 = [['', '전체'], ['0', '오늘 마감'], ['3', '3일 이내'], ['7', '7일 이내'], ['30', '30일 이내'], ['상시', '상시 접수']];

const 첫화면스크립트 = `<script>
(function(){
  var 오늘=new Date();오늘.setHours(0,0,0,0);
  var 남은=function(d){return Math.round((new Date(d+'T00:00:00')-오늘)/86400000)};
  var 칸=document.getElementById('목록'), 카드들=[].slice.call(칸.children);
  var 쪽=20, 상태={글:'',분류:'',권역:'',대상:'',기간:'',보임:쪽,보기:'간단'};
  try{상태.보기=localStorage.getItem('보기')==='카드'?'카드':'간단'}catch(e){}
  // 오래된 빌드여도 마감 지난 공고는 숨기고, 딱지는 오늘 기준으로 다시 쓴다
  function 딱지고치기(c){
    var d=c.dataset.deadline;
    if(d!=='상시'&&남은(d)<0){c.remove();return false}
    var b=c.querySelector('.디');
    if(d!=='상시'){var n=남은(d);b.textContent=n===0?'오늘 마감':'D-'+n;b.classList.toggle('급',n<=3)}
    return true;
  }
  카드들=카드들.filter(딱지고치기);
  [].slice.call(document.querySelectorAll('.미니')).forEach(딱지고치기);
  function 채우기(id,키,이름){
    var 값=[];카드들.forEach(function(c){var v=c.dataset[키];if(v&&값.indexOf(v)<0)값.push(v)});
    값.sort(function(a,b){return a==='전국'?-1:b==='전국'?1:a.localeCompare(b,'ko')});
    var el=document.getElementById(id);값.forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=v;el.appendChild(o)});
    el.onchange=function(){상태[이름]=el.value;상태.보임=쪽;그리기()};
  }
  채우기('권역','region','권역');채우기('대상','target','대상');
  document.getElementById('검색').addEventListener('input',function(e){상태.글=e.target.value.trim().toLowerCase();상태.보임=쪽;그리기()});
  function 칩묶음(선택자,키){
    var 칩들=[].slice.call(document.querySelectorAll(선택자));
    칩들.forEach(function(b){b.onclick=function(){
      상태[키]=b.dataset.v;상태.보임=쪽;
      칩들.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});그리기()}});
    return 칩들;
  }
  var 기간칩=칩묶음('#기간줄 .칩','기간'); 칩묶음('#분류줄 .칩','분류');
  [].forEach.call(document.querySelectorAll('.보기바꿈 button'),function(b){b.onclick=function(){
    상태.보기=b.dataset.v;try{localStorage.setItem('보기',상태.보기)}catch(e){}그리기()}});
  var 곧전체=document.getElementById('곧전체');
  if(곧전체)곧전체.onclick=function(){
    기간칩.forEach(function(x){x.setAttribute('aria-pressed',x.dataset.v==='7'?'true':'false')});
    상태.기간='7';상태.보임=쪽;그리기();document.getElementById('개수줄').scrollIntoView({behavior:'smooth',block:'start'})};
  document.getElementById('더보기').onclick=function(){상태.보임+=쪽;그리기()};
  function 기간맞음(c){
    var v=상태.기간;if(!v)return true;
    var d=c.dataset.deadline;if(v==='상시')return d==='상시';if(d==='상시')return false;
    var n=남은(d);return v==='0'?n===0:n<=+v;
  }
  function 그리기(){
    var 맞음=카드들.filter(function(c){
      return (!상태.분류||c.dataset.cat===상태.분류)&&(!상태.권역||c.dataset.region===상태.권역)&&(!상태.대상||c.dataset.target===상태.대상)&&기간맞음(c)&&(!상태.글||c.dataset.text.indexOf(상태.글)>=0)});
    카드들.forEach(function(c){c.hidden=true});
    맞음.forEach(function(c,i){c.hidden=i>=상태.보임});
    칸.className='목록 '+상태.보기;
    [].forEach.call(document.querySelectorAll('.보기바꿈 button'),function(b){b.setAttribute('aria-pressed',b.dataset.v===상태.보기?'true':'false')});
    document.getElementById('개수').textContent='공고 '+맞음.length+'건';
    document.getElementById('없음').hidden=맞음.length>0;
    var 남음=맞음.length-상태.보임;
    document.getElementById('더보기').hidden=남음<=0;
    document.getElementById('더보기').textContent='더 보기 (남은 '+남음+'건)';
  }
  var 맨위=document.getElementById('맨위');
  addEventListener('scroll',function(){맨위.classList.toggle('보임',scrollY>700)},{passive:true});
  맨위.onclick=function(){scrollTo({top:0,behavior:'smooth'})};
  그리기();
})();
</script>`;

const 첫화면본문 = `
<section class="영웅">
  <span class="윗글">오늘의 지원사업</span>
  <h1>오늘 마감 공고,<br><mark>코치가 먼저</mark> 챙겼어요.</h1>
  <p class="설명">전국 기관의 지원사업 공고를 마감이 가까운 순서로 모았어요. 공고마다 기관의 원문 링크로 연결돼요.</p>
  <div class="검색줄"><input id="검색" type="search" placeholder="사업명이나 기관으로 찾기" autocomplete="off" aria-label="공고 검색"></div>
  <div class="수치"><span><b>${공고.length}</b>건의 공고</span><span><b>${상시수}</b>건 상시 접수</span><span>${오늘.getMonth() + 1}월 ${오늘.getDate()}일 기준</span></div>
</section>
${추천.length ? `<section class="추천" aria-label="인기 카드뉴스" aria-roledescription="carousel">
  <div class="제목줄"><h2>카드뉴스로 먼저 보기</h2></div>
  <div class="칸"><div class="줄" id="추천줄" tabindex="0">${추천.map((r, i) => `<a class="장" href="${길(`/notice/${r.공고.id}/`)}" aria-label="${i + 1} / ${추천.length}">
    <img src="${길('/추천/' + encodeURI(r.image))}" alt="${막기(r.공고.title)} 카드뉴스" width="540" height="540" ${i ? 'loading="lazy"' : ''}>
    <div class="글"><span class="인스타">인스타 인기 카드뉴스</span><span class="디${급함(r.공고.deadline) ? ' 급' : ''}">${딱지글(r.공고.deadline)}</span><h3>${막기(r.공고.title)}</h3><div class="곳">${곳글(r.공고)}</div><span class="가기">공고 보러 가기 →</span></div>
  </a>`).join('')}</div>
  ${추천.length > 1 ? `<div class="점줄">${추천.map((_, i) => `<button class="점" type="button" aria-label="${i + 1}번째 카드뉴스" aria-current="${i === 0}"></button>`).join('')}</div>` : ''}</div>
</section>
<script>
(function(){
  var 줄=document.getElementById('추천줄');if(!줄)return;
  var 점=[].slice.call(document.querySelectorAll('.추천 .점')),n=점.length,i=0,멈춤=false,움직임줄임=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function 표시(k){i=k;점.forEach(function(d,j){d.setAttribute('aria-current',String(j===k))})}
  function 가기(k){줄.scrollTo({left:줄.clientWidth*k,behavior:움직임줄임?"auto":"smooth"});표시(k)}
  줄.addEventListener('scroll',function(){var k=Math.round(줄.scrollLeft/Math.max(1,줄.clientWidth));if(k!==i)표시(k)},{passive:true});
  점.forEach(function(d,j){d.onclick=function(){가기(j)}});
  ['mouseenter','focusin','touchstart','pointerdown'].forEach(function(e){줄.parentNode.addEventListener(e,function(){멈춤=true},{passive:true})});
  ['mouseleave','focusout'].forEach(function(e){줄.parentNode.addEventListener(e,function(){멈춤=false})});
  if(n>1&&!움직임줄임)setInterval(function(){if(멈춤||document.hidden)return;가기((i+1)%n)},5000);
})();
</script>` : ''}
${곧마감.length ? `<section class="곧마감" aria-label="곧 마감되는 공고">
  <div class="제목줄"><h2>곧 마감돼요</h2><button class="글단추" id="곧전체" type="button">7일 이내 ${곧마감.length}건 모두 보기 →</button></div>
  <div class="띠목록">${곧마감.slice(0, 12).map(미니).join('')}</div>
</section>` : ''}
<div class="도구"><div class="칩줄" id="기간줄">${기간목록.map(([v, 이름], i) => `<button class="칩" data-v="${v}" aria-pressed="${i === 0}">${이름}</button>`).join('')}</div></div>
<div class="거름">
  <div class="칩줄" id="분류줄"><button class="칩" data-v="" aria-pressed="true">모든 종류</button>${분류목록.map((c) => `<button class="칩" data-v="${막기(c)}" aria-pressed="false">${막기(c)}</button>`).join('')}</div>
  <div class="선택줄"><select id="권역" aria-label="지역"><option value="">지역 전체</option></select><select id="대상" aria-label="지원 대상"><option value="">대상 전체</option></select></div>
</div>
<div class="개수줄" id="개수줄"><span class="개수" id="개수"></span><div class="보기바꿈" role="group" aria-label="보기 방식"><button type="button" data-v="간단" aria-pressed="true">목록</button><button type="button" data-v="카드" aria-pressed="false">카드</button></div></div>
<div class="목록 간단" id="목록">
${공고.map(카드).join('\n')}
</div>
<p class="없음" id="없음" hidden>조건에 맞는 공고가 없어요.</p>
<button class="더보기" id="더보기" hidden>더 보기</button>
<button class="맨위" id="맨위" type="button" aria-label="맨 위로">↑</button>`;

쓰기('index.html', 틀({
  제목: '아티스트 코치 · 예술인을 위한 지원사업 공고',
  설명: `전국 예술 지원사업 공고 ${공고.length}건을 마감 임박 순으로. 원문 링크와 함께 한곳에서 확인하세요.`,
  경로: '/', 본문: 첫화면본문, 현재: '공고', 스크립트: 첫화면스크립트,
}));

// ───────── 공고 한 건마다 한 페이지 ─────────
공고.forEach((x) => {
  const 정보 = [
    x.benefit && ['지원 내용', 막기(x.benefit), '혜택행'],
    ['기관', 막기(x.org)],
    x.region && ['지역', 막기(x.region)],
    x.target && ['지원 대상', 막기(x.target)],
    ['마감', x.deadline === '상시' ? '상시 접수' : 날짜짧게(x.deadline)],
    x.posted && ['게시일', 날짜짧게(x.posted)],
  ].filter(Boolean);
  const 본문 = `<article class="상세">
  <a class="뒤로" href="${길('/')}">← 공고 목록</a>
  <div class="위"><span class="디${급함(x.deadline) ? ' 급' : ''}" data-d="${x.deadline}" id="딱지">${딱지글(x.deadline)}</span></div>
  <h1>${막기(x.title)}</h1>
  <dl class="정보">${정보.map(([이름, 값, 클래스]) => `<div${클래스 ? ` class="${클래스}"` : ''}><dt>${이름}</dt><dd>${값}</dd></div>`).join('')}</dl>
  <p class="출처줄"><span class="라벨">원문</span><b>${막기(x.org)}</b>의 공고 · ${막기(호스트(x.link))}<br>${x.summary || x.benefit ? '요약과 지원내용은 이 원문을 읽고 정리했어요.' : '이 공고의 요약은 원문을 읽고 정리하는 중이에요.'}</p>
  ${x.summary ? `<p class="요약">${막기(x.summary)}</p>` : `<p class="요약 없음글">요약을 준비하고 있어요. 자세한 내용은 원문에서 확인해 주세요.</p>`}
  <a class="단추 주 원문단추" href="${막기(x.link)}" target="_blank" rel="noopener noreferrer">원문 보러 가기 <span aria-hidden="true">→</span></a>
  <p class="안내">지원 조건, 금액, 마감 시각은 바뀔 수 있어요. 지원 전에 꼭 원문 공고에서 다시 확인해 주세요.</p>
</article>
<script>(function(){var b=document.getElementById('딱지'),d=b.dataset.d;if(d==='상시')return;var o=new Date();o.setHours(0,0,0,0);var n=Math.round((new Date(d+'T00:00:00')-o)/86400000);b.textContent=n<0?'마감됨':n===0?'오늘 마감':'D-'+n;b.classList.toggle('급',n<=3)})();</script>`;
  쓰기(`notice/${x.id}/index.html`, 틀({
    제목: `${x.title} · 아티스트 코치`,
    설명: `${x.org} · ${x.deadline === '상시' ? '상시 접수' : 날짜짧게(x.deadline) + ' 마감'} · ${x.benefit || x.summary || x.title}`.slice(0, 150),
    경로: `/notice/${x.id}/`, 본문,
  }));
});

// ───────── 소개 · 404 ─────────
쓰기('about/index.html', 틀({
  제목: '소개 · 아티스트 코치', 설명: '예술인을 위한 지원사업 공고를 한곳에 모읍니다.', 경로: '/about/', 현재: '소개',
  본문: `<section class="일반글">
  <span class="윗글">아티스트 코치</span>
  <h1>예술인을 위한 지원사업,<br><mark>놓치지 않게</mark>.</h1>
  <p>전국 기관에 흩어진 지원사업 공고를 한곳에 모읍니다. 마감이 가까운 순서로 보여 드리고, 모든 공고에는 기관의 원문 링크를 함께 답니다.</p>
  <p>조건이나 금액은 바뀔 수 있어서, 지원하기 전에는 꼭 원문을 다시 확인해 주세요.</p>
  <a class="단추 주" href="${인스타}" target="_blank" rel="noopener">인스타그램에서 매일 소식 보기</a>
</section>`,
}));
쓰기('404.html', 틀({
  제목: '페이지를 찾을 수 없어요 · 아티스트 코치', 설명: '페이지를 찾을 수 없어요.', 경로: '/404.html', 색인: false,
  본문: `<section class="일반글"><h1>찾는 페이지가 없어요.</h1><p>공고가 마감돼 내려갔거나 주소가 바뀌었을 수 있어요.</p><a class="단추 주" href="${길('/')}">공고 목록으로 가기</a></section>`,
}));

// ───────── 스타일 · 로고 · 아이콘 · 검색엔진용 파일 ─────────
쓰기('style.css', 스타일.trim() + '\n');
쓰기('logo.svg', 로고SVG());
쓰기('logo-mono.svg', 로고SVG(ink));
쓰기('manifest.webmanifest', JSON.stringify({
  name: '아티스트 코치', short_name: '아티스트 코치', lang: 'ko', start_url: 길('/') + (기준 ? '' : ''), display: 'standalone',
  background_color: bg, theme_color: brand,
  icons: [{ src: 길('/icon-192.png'), sizes: '192x192', type: 'image/png' }, { src: 길('/icon-512.png'), sizes: '512x512', type: 'image/png' }],
}, null, 2));
쓰기('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${주소}/sitemap.xml\n`);
쓰기('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  ['/', '/about/', ...공고.map((x) => `/notice/${x.id}/`)].map((u) => `  <url><loc>${주소}${u}</loc><lastmod>${오늘글}</lastmod></url>`).join('\n') + `\n</urlset>\n`);

if (추천.length) {
  추천.forEach((r) => { fs.mkdirSync(path.join(결과, '추천'), { recursive: true }); fs.copyFileSync(path.join(추천폴더, r.image), path.join(결과, '추천', r.image)); });
  console.log(`  추천 배너  ${추천.length}장`);
}
const 원본 = path.join(뿌리, '원본');
if (fs.existsSync(원본)) fs.readdirSync(원본).forEach((f) => fs.copyFileSync(path.join(원본, f), path.join(결과, f)));

const 요약수 = 공고.filter((x) => x.summary).length, 혜택수 = 공고.filter((x) => x.benefit).length;
console.log(`\n  사이트를 만들었습니다 → ${결과}`);
console.log(`  색       ${색설정.이름}  (브랜드 ${brand}, 단추 글씨 ${브랜드글 === ink ? '갈색' : '흰색'} ${대비(브랜드글, brand).toFixed(1)}, 링크 ${깊음} ${대비(깊음, 흰).toFixed(1)})`);
console.log(`  원문이 아니라 뺀 공고  ${가림.length}건 (모음 사이트 링크·기관명). 원문 링크로 바뀌면 저절로 올라간다`);
console.log(`  공고     ${공고.length}건 (상시 ${상시수}건, 7일 이내 ${곧마감.length}건)  ·  요약 ${요약수}건  ·  지원내용 ${혜택수}건  ·  기준일 ${오늘글}\n`);
