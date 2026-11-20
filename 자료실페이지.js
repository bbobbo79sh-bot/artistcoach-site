// 무료 자료실(/resources/)과, 메인 화면의 자료 배너·공고 상세의 '관련 자료' 조각, 자료별 읽기 페이지를 만든다.
// 자료/자료실.json 의 '사용'이 true 이거나 검수용(staging) 빌드일 때만 켜진다.
// 자료는 모두 웹에서 바로 읽는다(PDF 내려받기 없음, 2026-10-08 영감 결정).
//   자료/자료실/글/<id>.md  → /resources/<id>/   (글이 없는 자료는 검수용에서만 '곧 올라와요'로 보이고, 정식 사이트에서는 숨는다)

const fs = require('fs');
const path = require('path');

module.exports = ({ 설정, 검수용, 뿌리, 결과, 틀, 길, 막기, 쓰기, 광고칸 = () => '', 가이드 = [] }) => {
  const 전체자료 = Array.isArray(설정.자료) ? 설정.자료.filter((g) => !g.보관) : [];   // 보관: true 인 자료는 어디에도 보이지 않는다
  const 켜짐 = !!(설정.사용 || 검수용) && 전체자료.length > 0;
  if (!켜짐) return { 켜짐: false, 경로목록: [], 띠: '', 관련: () => '' };
  const { 변환, 광고넣기, 복사스크립트 } = require('./마크다운.js')({ 막기, 길 });

  // 글 안에 넣는 그림: 자료/자료실/그림/ 의 이미지를 /resources/img/ 로 옮긴다 (글에서는 ![설명](파일이름))
  const 그림폴더 = path.join(뿌리, '자료', '자료실', '그림');
  if (fs.existsSync(그림폴더)) {
    fs.mkdirSync(path.join(결과, 'resources', 'img'), { recursive: true });
    fs.readdirSync(그림폴더).filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f))
      .forEach((f) => fs.copyFileSync(path.join(그림폴더, f), path.join(결과, 'resources', 'img', f)));
  }

  const 글경로 = (g) => path.join(뿌리, '자료', '자료실', '글', `${g.id}.md`);
  const 글 = {};   // id → { 제목, 요약, 본문 }
  전체자료.forEach((g) => {
    if (/^[A-Za-z0-9_-]+$/.test(g.id) && fs.existsSync(글경로(g))) {
      const r = 변환(fs.readFileSync(글경로(g), 'utf8'), { 카드: true });
      if (r.제목 && r.본문.length > 300) 글[g.id] = r;   // 너무 짧은 글은 웹 페이지로 올리지 않는다
      // 접수 기간이 있는 안내글(자료실.json 의 '마감': 'YYYY-MM-DD'): 맨 위에 접수 중/접수 종료 띠를 붙인다. 사이트는 매일 아침 새로 만들어지므로 마감 다음 날부터 '접수 종료'로 바뀐다.
      if (글[g.id] && /^\d{4}-\d{2}-\d{2}$/.test(g.마감 || '')) {
        const 지금 = new Date(); const 오늘글 = `${지금.getFullYear()}-${String(지금.getMonth() + 1).padStart(2, '0')}-${String(지금.getDate()).padStart(2, '0')}`;
        const 끝남 = 오늘글 > g.마감;
        const 띠 = 끝남
          ? `<p style="background:var(--연함);border:1px solid var(--선);border-radius:12px;padding:10px 14px;font-weight:900;margin:0 0 16px">접수가 끝났어요 (공연단체 접수 마감 ${g.마감.slice(5, 7).replace(/^0/, '')}월 ${g.마감.slice(8).replace(/^0/, '')}일). 이 글은 참고용으로 남겨 둬요. 다음 공모는 공식 공고를 확인하세요.</p>`
          : `<p style="background:var(--연함);border:1px solid var(--선);border-radius:12px;padding:10px 14px;font-weight:900;margin:0 0 16px">지금 접수 중이에요 · 공연단체 접수 ${g.마감.slice(5, 7).replace(/^0/, '')}월 ${g.마감.slice(8).replace(/^0/, '')}일 17:00까지 (예정)</p>`;
        글[g.id].본문 = 띠 + 글[g.id].본문;
      }
    }
  });
  // 직접 입력·계산하는 도구 페이지: 자료/자료실/도구/<id>.html (본문 조각 + 인라인 스크립트, 외부 라이브러리·서버 전송 없음).
  // 안전 검사에 걸리면(외부 주소·네트워크·저장소 사용 등) 페이지를 만들지 않고 알린다.
  const 금지 = /\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|eval|importScripts|localStorage|sessionStorage|indexedDB)\b|document\s*\.\s*cookie|new\s+Function|<iframe|<link|@import|\b(?:src|href|action|formaction)\s*=\s*["']?\s*(?:https?:)?\/\/|url\(\s*["']?\s*(?:https?:)?\/\//i;
  const 도구 = {};
  전체자료.forEach((g) => {
    const p = path.join(뿌리, '자료', '자료실', '도구', `${g.id}.html`);
    if (!/^[A-Za-z0-9_-]+$/.test(g.id) || !fs.existsSync(p)) return;
    const t = fs.readFileSync(p, 'utf8');
    const 걸림 = t.match(금지);
    if (t.length > 200000 || 걸림) { console.log(`도구 페이지 건너뜀(${g.id}): ${걸림 ? '안전 검사에 걸림 → ' + 걸림[0] : '200KB 초과'}`); return; }
    도구[g.id] = t;
  });
  const 글주소 = (g) => 길(`/resources/${g.id}/`);
  // 정식 사이트에서는 글이 준비된 자료만 보인다(준비 중인 자료는 검수용에서만 '곧 올라와요'로 보임)
  const 자료목록 = 검수용 ? 전체자료 : 전체자료.filter((g) => g.승인 !== false && (글[g.id] || 도구[g.id]));
  if (!자료목록.length) return { 켜짐: false, 경로목록: [], 띠: '', 관련: () => '' };

  const 단추 = (g, 작게) => {
    const 작 = 작게 ? ' 작은단추' : '';
    return (글[g.id] || 도구[g.id]) ? `<a class="단추 주${작}" href="${글주소(g)}">${도구[g.id] ? '써 보기' : '읽어 보기'}</a>` : `<span class="단추 준비${작}">곧 올라와요</span>`;
  };
  const 카드 = (g) => `<div class="자료카드"><div class="자료몸"><b>${막기(g.이름)} <u class="무료꼬리">무료</u></b><span>${막기(g.한줄)}</span><small>${막기(g.언제)}</small></div><div class="자료단추">${단추(g)}</div></div>`;

  // ── 코치 노트(글)와 도구함(도구·양식·모음) ───────────────────────────────
  // 자료/자료실.json 의 각 자료에 '종류'(글|도구)·'탭'·'주제'·'날짜' 를 적는다. 코치 노트 글(.md)은 '노트' 목록에 적고 파일은 자료/가이드/ 에 둔다.
  const 분 = (html) => Math.max(1, Math.round(String(html).replace(/<[^>]+>/g, '').length / 500));   // 한글 글은 1분에 500자쯤 읽는다고 본다
  const 날짜글 = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || '') ? `${d.slice(5, 7)}.${d.slice(8, 10)}` : '');

  const 노트목록 = [];
  (Array.isArray(설정.노트) ? 설정.노트 : []).forEach((n) => {
    if (!/^[A-Za-z0-9_-]+$/.test(n.id || '')) return;
    const f = path.join(뿌리, '자료', '가이드', n.파일 || '');
    if (!fs.existsSync(f)) return;
    const r = 변환(fs.readFileSync(f, 'utf8'));
    if (!r.제목 || r.본문.length < 400) return;   // 너무 짧은 글은 올리지 않는다
    노트목록.push({ ...n, ...r });
  });

  const 보이는 = 자료목록.filter((g) => g.승인 !== false && (글[g.id] || 도구[g.id]));
  const 항목 = [];
  보이는.forEach((g) => {
    const 종류 = g.종류 || (도구[g.id] ? '도구' : '글');
    항목.push({ id: g.id, 이름: g.이름, 한줄: g.한줄, 종류, 탭: g.탭 || (종류 === '도구' ? '모음' : '쓰는 법'), 주제: g.주제 || '', 날짜: g.날짜 || '', 주소: 글주소(g), 분: 글[g.id] ? 분(글[g.id].본문) : 0 });
  });
  노트목록.forEach((n) => 항목.push({ id: n.id, 이름: n.제목, 한줄: n.요약, 종류: '글', 탭: n.탭 || '쓰는 법', 주제: n.주제 || '', 날짜: n.날짜 || '', 주소: 길(`/notes/${n.id}/`), 분: 분(n.본문) }));
  항목.forEach((x, i) => { x.순서 = i; });
  const 글항목 = 항목.filter((x) => x.종류 === '글').sort((a, b) => (b.날짜 || '').localeCompare(a.날짜 || '') || a.순서 - b.순서);   // 코치 노트는 새 글이 위
  const 도구항목 = 항목.filter((x) => x.종류 === '도구');                                                                              // 도구함은 쓰는 순서(자료실.json 순서) 그대로
  if (!항목.length) return { 켜짐: false, 경로목록: [], 띠: '', 관련: () => '' };

  const 줄 = (x) => `<a class="글줄" href="${x.주소}" data-탭="${막기(x.탭)}" data-주제="${막기(x.주제)}"><span class="글표${x.종류 === '도구' ? ' 도구표' : ''}">${x.종류 === '도구' ? '도구' : '글'}</span><span class="글줄몸"><b>${막기(x.이름)}</b><span>${막기(x.한줄)}</span><small>${x.종류 === '도구' ? 막기(x.탭) + ' · 바로 쓰기' : [날짜글(x.날짜), x.분 ? `${x.분}분 읽기` : ''].filter(Boolean).join(' · ')}</small></span></a>`;

  const 처음이면 = (Array.isArray(설정.처음이면) ? 설정.처음이면 : []).map((id) => 항목.find((x) => x.id === id)).filter(Boolean);
  const 처음상자 = 처음이면.length >= 2 ? `<div class="처음이면"><b>처음이면 이 순서로</b><ol>${처음이면.map((x) => `<li><a href="${x.주소}">${막기(x.이름)}</a></li>`).join('')}</ol></div>` : '';

  const 거름스크립트 = `<script>
(function(){
  var 탭='',주제='',줄들=[].slice.call(document.querySelectorAll('.글줄')),없음=document.getElementById('목록없음');
  function 그리기(){
    var n=0;
    줄들.forEach(function(a){var ok=(!탭||a.getAttribute('data-탭')===탭)&&(!주제||a.getAttribute('data-주제')===주제);a.hidden=!ok;if(ok)n++});
    if(없음)없음.hidden=n>0;
    [].forEach.call(document.querySelectorAll('[data-그룹]'),function(b){var 지금=b.getAttribute('data-그룹')==='탭'?탭:주제;b.setAttribute('aria-pressed',String(지금===b.getAttribute('data-값')))});
  }
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-그룹]');if(!b)return;if(b.getAttribute('data-그룹')==='탭')탭=b.getAttribute('data-값');else 주제=b.getAttribute('data-값');그리기()});
  그리기();
})();
</script>`;

  const 목록페이지 = ({ 목, 경로, 현재, 제목, 큰제목, 소개, 설명, 탭순서, 주제칩, 위에 = '' }) => {
    if (!목.length) return false;
    const 탭들 = 탭순서.filter((t) => 목.some((x) => x.탭 === t));
    const 칩들 = 주제칩 ? (Array.isArray(설정.주제) ? 설정.주제 : []).filter((t) => 목.some((x) => x.주제 === t)) : [];
    const 버튼 = (그룹, 값, 이름) => `<button type="button" data-그룹="${그룹}" data-값="${막기(값)}" aria-pressed="false">${막기(이름)}</button>`;
    쓰기(`${경로.replace(/^\//, '')}/index.html`, 틀({
      제목, 현재, 경로: `${경로}/`, 설명, 스크립트: 거름스크립트,
      본문: `<section class="일반글 게시판">
  <h1>${큰제목}</h1>
  <p class="소개">${소개}</p>
  ${위에}
  ${탭들.length >= 2 ? `<div class="탭줄">${버튼('탭', '', '전체')}${탭들.map((t) => 버튼('탭', t, t)).join('')}</div>` : ''}
  ${칩들.length >= 2 ? `<div class="주제줄">${칩들.map((t) => 버튼('주제', t, t)).join('')}</div>` : ''}
  <div class="글줄목록">${목.map(줄).join('')}</div>
  <p id="목록없음" class="작은" hidden>이 칸에는 아직 올라온 것이 없어요.</p>
  <p class="작은">일반 안내입니다. 지원 조건과 기준은 각 공고 원문에서 꼭 확인해 주세요.</p>
</section>`,
    }));
    return true;
  };

  const 경로목록 = [];
  if (목록페이지({
    목: 글항목, 경로: '/notes', 현재: '코치 노트', 제목: '코치 노트 · 아티스트 코치', 큰제목: '코치 노트',
    소개: '예술지원사업 신청서를 쓸 때 막히는 곳을, 영감이 쉬운 말로 풀어 드려요.',
    설명: '예술지원사업 신청서·기획서를 쓰는 법을 쉬운 말로 정리한 글 모음. 공고 읽기, 사업명, 문장, 예산, 심사까지.',
    탭순서: Array.isArray(설정.탭 && 설정.탭.노트) ? 설정.탭.노트 : [], 주제칩: true, 위에: 처음상자,
  })) 경로목록.push('/notes/');
  if (목록페이지({
    목: 도구항목, 경로: '/tools', 현재: '도구함', 제목: '도구함 · 아티스트 코치', 큰제목: '도구함',
    소개: '계산기, 워크시트, 양식, 모음. 가입 없이 바로 써요. 입력한 내용은 이 기기 안에서만 쓰여요.',
    설명: '예술지원사업 신청에 바로 쓰는 계산기·워크시트·양식·모음. 예산표 계산기, 발표 시간 계산기, 사업명 워크시트, 지원기관 모음.',
    탭순서: Array.isArray(설정.탭 && 설정.탭.도구) ? 설정.탭.도구 : [], 주제칩: false,
  })) 경로목록.push('/tools/');

  // 예전 자료실 주소(/resources/): 두 칸 안내. 이미 퍼진 링크가 깨지지 않게 남겨 둔다.
  쓰기('resources/index.html', 틀({
    제목: '코치 노트와 도구함 · 아티스트 코치', 현재: '코치 노트', 경로: '/resources/',
    설명: '예술지원사업 신청서를 쓰는 법(코치 노트)과 바로 쓰는 계산기·워크시트(도구함).',
    본문: `<section class="일반글 게시판">
  <h1>코치 노트와 도구함</h1>
  <p class="소개">읽고 배우는 글은 코치 노트에, 직접 쓰는 계산기와 양식은 도구함에 있어요.</p>
  <div class="두칸"><a class="칸" href="${길('/notes/')}"><b>코치 노트</b><span>신청서 쓰는 법 · 글 ${글항목.length}편</span></a><a class="칸 도구칸" href="${길('/tools/')}"><b>도구함</b><span>계산기·워크시트·양식 · ${도구항목.length}가지</span></a></div>
  ${처음상자}
</section>`,
  }));
  경로목록.push('/resources/');

  // 자료별 읽기·사용 페이지 (주소는 그대로 /resources/<id>/)
  보이는.forEach((g) => {
    const r = 글[g.id] || (도구[g.id] ? { 제목: g.이름, 요약: g.한줄, 본문: '' } : null); if (!r) return;
    const 도구인가 = (항목.find((x) => x.id === g.id) || {}).종류 === '도구';
    경로목록.push(`/resources/${g.id}/`);
    쓰기(`resources/${g.id}/index.html`, 틀({
      제목: `${r.제목 || g.이름} · 아티스트 코치`, 현재: 도구인가 ? '도구함' : '코치 노트', 경로: `/resources/${g.id}/`, 설명: (r.요약 || g.한줄).slice(0, 150),
      스크립트: r.본문.includes('class="복사칸"') ? 복사스크립트 : '',
      본문: `<article class="일반글 글본문 자료글">
  <header class="자료영웅">
    <div class="영웅글"><span class="윗글">영감의 무료 자료</span><h1>${막기(r.제목 || g.이름)}</h1>${r.요약 ? `<p class="리드">${막기(r.요약)}</p>` : ''}</div>
    ${fs.existsSync(path.join(그림폴더, 'mascot.png')) ? `<img src="${길('/resources/img/mascot.png')}" alt="" width="150" height="196">` : ''}
  </header>
  ${광고넣기(r.본문, 광고칸('글중간'))}
  ${도구[g.id] ? `<section class="글카드 도구칸"><p class="도구안내">직접 입력해 보세요. 입력한 내용은 이 기기 안에서만 계산되고 어디로도 보내지 않아요.</p>${도구[g.id]}</section>` : ''}
  ${광고칸('글끝')}
  <p class="작은">이 자료는 아티스트 코치가 정리한 일반 안내입니다. 지원 조건과 기준은 각 공고 원문에서 꼭 확인해 주세요.</p>
  <p><a class="단추" href="${길(도구인가 ? '/tools/' : '/notes/')}">${도구인가 ? '도구함' : '코치 노트'}으로 돌아가기</a> <a class="단추" href="${길('/')}">공고 보러 가기</a></p>
</article>`,
    }));
  });

  // 코치 노트 글 읽기 화면 (주소 /notes/<id>/): 한 줄 요약 → 목차 → 번호 소제목 → 다음 글
  노트목록.forEach((n) => {
    경로목록.push(`/notes/${n.id}/`);
    let k = 0; const 제목들 = [];
    const 본문 = n.본문.replace(/<h2>(.*?)<\/h2>/g, (m, t) => { k += 1; 제목들.push([k, t.replace(/<[^>]+>/g, '')]); return `<h2 id="s${k}">${t}</h2>`; });
    const 다음 = 글항목[글항목.findIndex((x) => x.id === n.id) + 1];
    const 관련도구 = 도구항목.slice(0, 2);
    쓰기(`notes/${n.id}/index.html`, 틀({
      제목: `${n.제목} · 코치 노트 · 아티스트 코치`, 현재: '코치 노트', 경로: `/notes/${n.id}/`, 설명: (n.요약 || n.제목).slice(0, 150),
      스크립트: 본문.includes('class="복사칸"') ? 복사스크립트 : '',
      본문: `<article class="일반글 글본문 노트글">
  <span class="윗글">코치 노트 · ${막기(n.탭 || '쓰는 법')}</span>
  <h1>${막기(n.제목)}</h1>
  <p class="메타">영감 · ${날짜글(n.날짜)}${날짜글(n.날짜) ? ' · ' : ''}${분(n.본문)}분 읽기</p>
  ${n.요약 ? `<div class="한줄요약"><b>한 줄 요약</b>${막기(n.요약)}</div>` : ''}
  ${제목들.length >= 3 ? `<nav class="노트목차" aria-label="목차">${제목들.map(([i, t]) => `<a href="#s${i}">${t}</a>`).join('')}</nav>` : ''}
  ${광고넣기(본문, 광고칸('글중간'))}
  ${광고칸('글끝')}
  ${다음 ? `<p class="다음글"><span>다음 글</span><br><a href="${다음.주소}">${막기(다음.이름)} →</a></p>` : ''}
  ${관련도구.length ? `<aside class="관련자료" aria-label="바로 쓰는 도구"><h2>바로 써 보세요</h2><p>글에서 읽은 것을 도구함에서 바로 해 볼 수 있어요.</p><div class="글줄목록">${관련도구.map((x) => 줄(x)).join('')}</div><a class="더자료" href="${길('/tools/')}">도구함 더 보기 →</a></aside>` : ''}
  <p class="작은">이 글은 아티스트 코치가 정리한 일반 안내입니다. 지원 조건과 기준은 기관마다, 해마다 달라질 수 있으니 반드시 해당 공고와 기관의 최신 안내를 확인해 주세요.</p>
  <p><a class="단추 주" href="${길('/')}">지원사업 공고 보러 가기</a> <a class="단추" href="${길('/notes/')}">코치 노트 목록</a></p>
</article>`,
    }));
  });

  // 메인 화면: 코치 노트와 도구함 두 칸 + 최근 글
  const 최근 = 글항목.slice(0, 3);
  const 띠 = `<section class="노트구역" aria-label="코치 노트와 도구함">
  <div class="두칸"><a class="칸" href="${길('/notes/')}"><b>코치 노트</b><span>신청서 쓰는 법 · 글 ${글항목.length}편</span></a><a class="칸 도구칸" href="${길('/tools/')}"><b>도구함</b><span>계산기·워크시트·양식 · ${도구항목.length}가지</span></a></div>
  ${최근.length ? `<h2>최근 코치 노트</h2><div class="글줄목록">${최근.map(줄).join('')}</div>` : ''}
</section>`;

  // 공고 상세 아래: 관련 자료 1~2개
  const 관련 = (ids) => {
    const 목록 = ids.map((id) => 보이는.find((g) => g.id === id)).filter(Boolean);
    if (!목록.length) return '';
    return `<aside class="관련자료" aria-label="관련 무료 자료"><h2>이 공고에 지원하려면</h2><p>지원서를 쓸 때 도움이 되는 무료 자료예요.</p>${목록.map(카드).join('')}<a class="더자료" href="${길('/tools/')}">도구함 더 보기 →</a> <a class="더자료" href="${길('/notes/')}">코치 노트 보기 →</a></aside>`;
  };

  return { 켜짐: true, 경로목록, 띠, 관련 };
};
