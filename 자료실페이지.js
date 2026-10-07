// 무료 자료실(/resources/)과, 메인 화면 아래 띠·공고 상세의 '관련 자료' 조각, 자료별 '웹으로 보기' 페이지를 만든다.
// 자료/자료실.json 의 '사용'이 true 이거나 검수용(staging) 빌드일 때만 켜진다.
// 자료 하나는 두 가지로 줄 수 있다:
//   · 웹으로 보기  자료/자료실/글/<id>.md  → /resources/<id>/  (글로 읽는 페이지. 광고 자리·복사 단추 가능)
//   · PDF 받기     자료/자료실/<파일>.pdf  → /resources/files/  (인쇄하거나 칸을 채워 쓰는 자료)
// 둘 다 없으면 '곧 올라와요'로 보인다.

const fs = require('fs');
const path = require('path');

module.exports = ({ 설정, 검수용, 뿌리, 결과, 틀, 길, 막기, 쓰기, 광고칸 = () => '' }) => {
  const 켜짐 = !!(설정.사용 || 검수용) && Array.isArray(설정.자료) && 설정.자료.length > 0;
  if (!켜짐) return { 켜짐: false, 경로목록: [], 띠: '', 관련: () => '' };
  const { 변환, 광고넣기, 복사스크립트 } = require('./마크다운.js')({ 막기 });

  const 파일주소 = (g) => (g.파일 && /^[A-Za-z0-9_.\-가-힣 ]+$/.test(g.파일) && fs.existsSync(path.join(뿌리, '자료', '자료실', g.파일)))
    ? 길('/resources/files/' + encodeURI(g.파일)) : '';
  const 글경로 = (g) => path.join(뿌리, '자료', '자료실', '글', `${g.id}.md`);
  const 글 = {};   // id → { 제목, 요약, 본문 }
  설정.자료.forEach((g) => {
    if (/^[A-Za-z0-9_-]+$/.test(g.id) && fs.existsSync(글경로(g))) {
      const r = 변환(fs.readFileSync(글경로(g), 'utf8'));
      if (r.제목 && r.본문.length > 300) 글[g.id] = r;   // 너무 짧은 글은 웹 페이지로 올리지 않는다
    }
    if (파일주소(g)) {
      fs.mkdirSync(path.join(결과, 'resources', 'files'), { recursive: true });
      fs.copyFileSync(path.join(뿌리, '자료', '자료실', g.파일), path.join(결과, 'resources', 'files', g.파일));
    }
  });
  const 글주소 = (g) => 길(`/resources/${g.id}/`);
  // 정식 사이트에서는 글이나 PDF 가 준비된 자료만 보인다(준비 중인 자료는 검수용에서만 '곧 올라와요'로 보임)
  const 자료목록 = 검수용 ? 설정.자료 : 설정.자료.filter((g) => 글[g.id] || 파일주소(g));
  if (!자료목록.length) return { 켜짐: false, 경로목록: [], 띠: '', 관련: () => '' };

  const 단추들 = (g, 작게) => {
    const 작 = 작게 ? ' 작은단추' : '';
    const 목록 = [];
    if (글[g.id]) 목록.push(`<a class="단추 주${작}" href="${글주소(g)}">웹으로 보기</a>`);
    if (파일주소(g)) 목록.push(`<a class="단추${글[g.id] ? '' : ' 주'}${작}" href="${파일주소(g)}" download>PDF 받기</a>`);
    if (!목록.length) 목록.push(`<span class="단추 준비${작}">곧 올라와요</span>`);
    return `<div class="자료단추">${목록.join('')}</div>`;
  };
  const 카드 = (g) => `<div class="자료카드"><div class="자료몸"><b>${막기(g.이름)}</b><span>${막기(g.한줄)}</span><small>${막기(g.언제)}</small></div>${단추들(g)}</div>`;

  쓰기('resources/index.html', 틀({
    제목: '무료 자료실 · 아티스트 코치', 현재: '자료실', 경로: '/resources/',
    설명: '지원사업을 준비할 때 바로 쓰는 무료 자료. 가입이나 이메일 없이 바로 보고, 필요하면 PDF로 받으세요.',
    본문: `<section class="일반글">
  <span class="윗글">무료 자료실</span>
  <h1>지원서 쓸 때 바로 쓰는 무료 자료</h1>
  <p>가입이나 이메일 없이 바로 보세요. 인쇄하거나 칸을 채워 쓰는 자료는 PDF로도 받을 수 있어요. 공고를 읽는 것부터 지원서를 다듬는 것까지, 쓰는 순서대로 모았어요.</p>
  <div class="자료목록">${자료목록.map(카드).join('')}</div>
  <p class="작은">자료는 일반 안내입니다. 지원 조건과 기준은 각 공고 원문에서 꼭 확인해 주세요.</p>
</section>`,
  }));

  // 웹으로 보는 자료 페이지
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
  ${파일주소(g) ? `<p><a class="단추 주" href="${파일주소(g)}" download>인쇄용 PDF 받기</a></p>` : ''}
  <p class="작은">이 자료는 아티스트 코치가 정리한 일반 안내입니다. 지원 조건과 기준은 각 공고 원문에서 꼭 확인해 주세요.</p>
  <p><a class="단추" href="${길('/resources/')}">자료실로 돌아가기</a> <a class="단추" href="${길('/')}">공고 보러 가기</a></p>
</article>`,
    }));
  });

  // 메인 화면 아래 띠: 한 줄 + 단추 하나
  const 띠 = `<section class="자료띠" aria-label="무료 자료">
  <div><b>지원서 쓸 때 쓰는 무료 자료</b><span>${자료목록.length}가지, 가입 없이 바로 보기</span></div>
  <a class="단추 주" href="${길('/resources/')}">자료실 가기 →</a>
</section>`;

  // 공고 상세 아래: 관련 자료 1~2개
  const 관련 = (ids) => {
    const 목록 = ids.map((id) => 자료목록.find((g) => g.id === id)).filter(Boolean);
    if (!목록.length) return '';
    return `<aside class="관련자료" aria-label="관련 무료 자료"><h2>이 공고에 지원하려면</h2><p>지원서를 쓸 때 도움이 되는 무료 자료예요.</p>${목록.map((g) => 카드(g).replace('class="자료카드"', 'class="자료카드"')).join('')}<a class="더자료" href="${길('/resources/')}">자료 더 보기 →</a></aside>`;
  };

  return { 켜짐: true, 경로목록, 띠, 관련 };
};
