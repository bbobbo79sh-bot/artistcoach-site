// 무료 자료실(/resources/)과, 메인 화면의 자료 배너·공고 상세의 '관련 자료' 조각, 자료별 읽기 페이지를 만든다.
// 자료/자료실.json 의 '사용'이 true 이거나 검수용(staging) 빌드일 때만 켜진다.
// 자료는 모두 웹에서 바로 읽는다(PDF 내려받기 없음, 2026-10-08 영감 결정).
//   자료/자료실/글/<id>.md  → /resources/<id>/   (글이 없는 자료는 검수용에서만 '곧 올라와요'로 보이고, 정식 사이트에서는 숨는다)

const fs = require('fs');
const path = require('path');

module.exports = ({ 설정, 검수용, 뿌리, 결과, 틀, 길, 막기, 쓰기, 광고칸 = () => '', 가이드 = [] }) => {
  const 켜짐 = !!(설정.사용 || 검수용) && Array.isArray(설정.자료) && 설정.자료.length > 0;
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
  설정.자료.forEach((g) => {
    if (/^[A-Za-z0-9_-]+$/.test(g.id) && fs.existsSync(글경로(g))) {
      const r = 변환(fs.readFileSync(글경로(g), 'utf8'));
      if (r.제목 && r.본문.length > 300) 글[g.id] = r;   // 너무 짧은 글은 웹 페이지로 올리지 않는다
    }
  });
  const 글주소 = (g) => 길(`/resources/${g.id}/`);
  // 정식 사이트에서는 글이 준비된 자료만 보인다(준비 중인 자료는 검수용에서만 '곧 올라와요'로 보임)
  const 자료목록 = 검수용 ? 설정.자료 : 설정.자료.filter((g) => 글[g.id]);
  if (!자료목록.length) return { 켜짐: false, 경로목록: [], 띠: '', 관련: () => '' };

  const 단추 = (g, 작게) => {
    const 작 = 작게 ? ' 작은단추' : '';
    return 글[g.id] ? `<a class="단추 주${작}" href="${글주소(g)}">읽어 보기</a>` : `<span class="단추 준비${작}">곧 올라와요</span>`;
  };
  const 카드 = (g) => `<div class="자료카드"><div class="자료몸"><b>${막기(g.이름)}</b><span>${막기(g.한줄)}</span><small>${막기(g.언제)}</small></div><div class="자료단추">${단추(g)}</div></div>`;

  쓰기('resources/index.html', 틀({
    제목: '무료 자료실 · 아티스트 코치', 현재: '자료실', 경로: '/resources/',
    설명: '지원사업을 준비할 때 바로 쓰는 무료 자료. 가입이나 이메일 없이 홈페이지에서 바로 읽으세요.',
    본문: `<section class="일반글">
  <span class="윗글">무료 자료실</span>
  <h1>지원서 쓸 때 바로 쓰는 무료 자료</h1>
  <p>가입이나 이메일 없이 바로 읽으세요. 공고를 읽는 것부터 지원서를 다듬는 것까지, 쓰는 순서대로 모았어요.</p>
  <div class="자료목록">${자료목록.map(카드).join('')}</div>
  <p class="작은">자료는 일반 안내입니다. 지원 조건과 기준은 각 공고 원문에서 꼭 확인해 주세요.</p>
</section>`,
  }));

  // 읽기 페이지
  const 경로목록 = ['/resources/'];
  자료목록.forEach((g) => {
    const r = 글[g.id]; if (!r) return;
    경로목록.push(`/resources/${g.id}/`);
    쓰기(`resources/${g.id}/index.html`, 틀({
      제목: `${r.제목 || g.이름} · 아티스트 코치`, 현재: '자료실', 경로: `/resources/${g.id}/`, 설명: (r.요약 || g.한줄).slice(0, 150),
      스크립트: r.본문.includes('class="복사칸"') ? 복사스크립트 : '',
      본문: `<article class="일반글 글본문">
  <span class="윗글">무료 자료</span>
  <h1>${막기(r.제목 || g.이름)}</h1>
  ${r.요약 ? `<p class="리드">${막기(r.요약)}</p>` : ''}
  ${광고넣기(r.본문, 광고칸('글중간'))}
  ${광고칸('글끝')}
  <p class="작은">이 자료는 아티스트 코치가 정리한 일반 안내입니다. 지원 조건과 기준은 각 공고 원문에서 꼭 확인해 주세요.</p>
  <p><a class="단추" href="${길('/resources/')}">자료실로 돌아가기</a> <a class="단추" href="${길('/')}">공고 보러 가기</a></p>
</article>`,
    }));
  });

  // 메인 화면 배너: 머리글 + 자료·가이드 카드가 옆으로 이어지는 줄 (다양한 자료가 있다는 것이 한눈에 보이게)
  const 배너카드 = [
    ...자료목록.map((g) => ({ 종류: '자료', 이름: g.이름, 한줄: g.한줄, 주소: 글[g.id] ? 글주소(g) : '' })),
    ...가이드.map((g) => ({ 종류: '가이드', 이름: g.제목, 한줄: g.요약, 주소: 길(`/guide/${g.번호}/`) })),
  ];
  const 띠 = `<section class="자료띠" aria-label="무료 자료">
  <div class="띠머리"><div><b>무료로 읽는 지원서 자료</b><span>자료 ${자료목록.length}가지 · 가이드 ${가이드.length}편 · 가입 없이 바로 보기</span></div><a class="단추 주 작은단추" href="${길('/resources/')}">자료실 가기 →</a></div>
  <div class="띠줄">${배너카드.map((c) => {
    const 속 = `<em class="${c.종류 === '자료' ? '종자료' : '종가이드'}">${c.종류}</em><b>${막기(c.이름)}</b><span>${막기(c.한줄)}</span>`;
    return c.주소 ? `<a class="띠카드" href="${c.주소}">${속}</a>` : `<div class="띠카드 준비중">${속}</div>`;
  }).join('')}</div>
</section>`;

  // 공고 상세 아래: 관련 자료 1~2개
  const 관련 = (ids) => {
    const 목록 = ids.map((id) => 자료목록.find((g) => g.id === id)).filter(Boolean);
    if (!목록.length) return '';
    return `<aside class="관련자료" aria-label="관련 무료 자료"><h2>이 공고에 지원하려면</h2><p>지원서를 쓸 때 도움이 되는 무료 자료예요.</p>${목록.map(카드).join('')}<a class="더자료" href="${길('/resources/')}">자료 더 보기 →</a></aside>`;
  };

  return { 켜짐: true, 경로목록, 띠, 관련 };
};
