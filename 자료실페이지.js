// 무료 자료실(/resources/)과, 메인 화면 아래 띠·공고 상세의 '관련 자료' 조각을 만든다.
// 자료/자료실.json 의 '사용'이 true 이거나 검수용(staging) 빌드일 때만 켜진다.
// 파일은 자료/자료실/<파일이름> 에 두면 /resources/files/ 로 복사되고, 없으면 '곧 올라와요'로 보인다.

const fs = require('fs');
const path = require('path');

module.exports = ({ 설정, 검수용, 뿌리, 결과, 틀, 길, 막기, 쓰기 }) => {
  const 켜짐 = !!(설정.사용 || 검수용) && Array.isArray(설정.자료) && 설정.자료.length > 0;
  if (!켜짐) return { 켜짐: false, 경로목록: [], 띠: '', 관련: () => '' };

  const 파일주소 = (g) => (g.파일 && /^[A-Za-z0-9_.\-가-힣 ]+$/.test(g.파일) && fs.existsSync(path.join(뿌리, '자료', '자료실', g.파일)))
    ? 길('/resources/files/' + encodeURI(g.파일)) : '';
  설정.자료.forEach((g) => {
    if (!파일주소(g)) return;
    fs.mkdirSync(path.join(결과, 'resources', 'files'), { recursive: true });
    fs.copyFileSync(path.join(뿌리, '자료', '자료실', g.파일), path.join(결과, 'resources', 'files', g.파일));
  });
  const 단추 = (g, 작게) => 파일주소(g)
    ? `<a class="단추 주${작게 ? ' 작은단추' : ''}" href="${파일주소(g)}" download>PDF 받기</a>`
    : `<span class="단추 준비${작게 ? ' 작은단추' : ''}">곧 올라와요</span>`;
  const 카드 = (g) => `<div class="자료카드"><div class="자료몸"><b>${막기(g.이름)}</b><span>${막기(g.한줄)}</span><small>${막기(g.언제)}</small></div>${단추(g)}</div>`;

  쓰기('resources/index.html', 틀({
    제목: '무료 자료실 · 아티스트 코치', 현재: '자료실', 경로: '/resources/',
    설명: '지원사업을 준비할 때 바로 쓰는 무료 자료. 이메일 없이 PDF로 바로 받으세요.',
    본문: `<section class="일반글">
  <span class="윗글">무료 자료실</span>
  <h1>지원서 쓸 때 바로 쓰는 무료 자료</h1>
  <p>가입이나 이메일 없이 PDF로 바로 받을 수 있어요. 공고를 읽는 것부터 지원서를 다듬는 것까지, 쓰는 순서대로 모았어요.</p>
  <div class="자료목록">${설정.자료.map(카드).join('')}</div>
  <p class="작은">자료는 일반 안내입니다. 지원 조건과 기준은 각 공고 원문에서 꼭 확인해 주세요.</p>
</section>`,
  }));

  // 메인 화면 아래 띠: 한 줄 + 단추 하나
  const 띠 = `<section class="자료띠" aria-label="무료 자료">
  <div><b>지원서 쓸 때 쓰는 무료 자료</b><span>${설정.자료.length}가지 PDF, 이메일 없이 바로 받기</span></div>
  <a class="단추 주" href="${길('/resources/')}">자료실 가기 →</a>
</section>`;

  // 공고 상세 아래: 관련 자료 1~2개
  const 관련 = (ids) => {
    const 목록 = ids.map((id) => 설정.자료.find((g) => g.id === id)).filter(Boolean);
    if (!목록.length) return '';
    return `<aside class="관련자료" aria-label="관련 무료 자료"><h2>이 공고에 지원하려면</h2><p>지원서를 쓸 때 도움이 되는 무료 자료예요.</p>${목록.map(카드).join('')}<a class="더자료" href="${길('/resources/')}">자료 더 보기 →</a></aside>`;
  };

  return { 켜짐: true, 경로목록: ['/resources/'], 띠, 관련 };
};
