// 자료/가이드/*.md 를 읽어 /guide/ 목록과 글 페이지를 만든다.
// 글 형식: 첫 줄 `# 제목`, 다음에 `한 줄 요약: ...`, 이후 `## 소제목`·문단·목록(- / 1.)·인용(>)·**굵게**·*기울임*.
// 파일 이름의 앞 숫자(01_…)가 글 번호이자 주소(/guide/01/)가 된다.

const fs = require('fs');
const path = require('path');

module.exports = ({ 뿌리, 틀, 길, 막기, 쓰기 }) => {
  const 폴더 = path.join(뿌리, '자료', '가이드');
  if (!fs.existsSync(폴더)) return { 경로목록: [], 글수: 0 };
  const 인라인 = (t) => 막기(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');

  const 변환 = (원문) => {
    const 줄 = 원문.split(String.fromCharCode(13, 10)).join('\n').split('\n');
    let 제목 = '', 요약 = '', 본문 = '', 목록 = null, 인용 = [], 문단 = [];
    const 닫기 = () => {
      if (문단.length) { 본문 += `<p>${인라인(문단.join(' '))}</p>\n`; 문단 = []; }
      if (인용.length) { 본문 += `<blockquote>${인용.map(인라인).join('<br>')}</blockquote>\n`; 인용 = []; }
      if (목록) { 본문 += `<${목록.태그}>${목록.항목.map((x) => `<li>${인라인(x)}</li>`).join('')}</${목록.태그}>\n`; 목록 = null; }
    };
    for (const 원 of 줄) {
      const l = 원.trim();
      if (!l) { 닫기(); continue; }
      if (/^# /.test(l)) { 닫기(); 제목 = l.slice(2).trim(); continue; }
      if (/^한 줄 요약\s*:/.test(l)) { 닫기(); 요약 = l.replace(/^한 줄 요약\s*:\s*/, ''); continue; }
      if (/^## /.test(l)) { 닫기(); 본문 += `<h2>${인라인(l.slice(3).trim())}</h2>\n`; continue; }
      if (/^### /.test(l)) { 닫기(); 본문 += `<h3>${인라인(l.slice(4).trim())}</h3>\n`; continue; }
      if (/^> ?/.test(l)) { if (문단.length || 목록) 닫기(); 인용.push(l.replace(/^> ?/, '')); continue; }
      const 불릿 = l.match(/^[-•]\s+(.*)$/), 번호 = l.match(/^\d+\.\s+(.*)$/);
      if (불릿 || 번호) {
        const 태그 = 불릿 ? 'ul' : 'ol';
        if (문단.length || 인용.length) 닫기();
        if (!목록 || 목록.태그 !== 태그) { 닫기(); 목록 = { 태그, 항목: [] }; }
        목록.항목.push((불릿 || 번호)[1]); continue;
      }
      if (인용.length || 목록) 닫기();
      문단.push(l);
    }
    닫기();
    return { 제목, 요약, 본문 };
  };

  const 글들 = fs.readdirSync(폴더).filter((f) => /^\d+_.+\.md$/.test(f)).sort().map((f) => {
    const 번호 = f.match(/^(\d+)_/)[1];
    const r = 변환(fs.readFileSync(path.join(폴더, f), 'utf8'));
    return { 번호, ...r };
  }).filter((g) => g.제목 && g.본문.length > 400);   // 제목이 없거나 너무 짧은 글은 올리지 않는다
  if (!글들.length) return { 경로목록: [], 글수: 0 };
  const 경로목록 = ['/guide/'];

  쓰기('guide/index.html', 틀({
    제목: '가이드 · 아티스트 코치', 현재: '가이드', 경로: '/guide/',
    설명: '예술지원사업 지원서를 쓸 때 도움이 되는 글. 예술활동증명, 공고문 용어, 사업명, 선정 기획서의 구조를 쉬운 말로 정리했습니다.',
    본문: `<section class="일반글">
  <span class="윗글">가이드</span>
  <h1>지원사업, 이렇게 준비하세요</h1>
  <p>공고를 찾은 다음 막히는 곳을 쉬운 말로 정리했습니다. 공식 기준은 각 기관의 공고와 지침에서 꼭 다시 확인해 주세요.</p>
  <div class="가이드목록">${글들.map((g) => `<a class="가이드카드" href="${길(`/guide/${g.번호}/`)}"><b>${막기(g.제목)}</b><span>${막기(g.요약)}</span></a>`).join('')}</div>
</section>`,
  }));

  글들.forEach((g) => {
    경로목록.push(`/guide/${g.번호}/`);
    쓰기(`guide/${g.번호}/index.html`, 틀({
      제목: `${g.제목} · 아티스트 코치`, 현재: '가이드', 경로: `/guide/${g.번호}/`, 설명: (g.요약 || g.제목).slice(0, 150),
      본문: `<article class="일반글 글본문">
  <span class="윗글">가이드</span>
  <h1>${막기(g.제목)}</h1>
  ${g.요약 ? `<p class="리드">${막기(g.요약)}</p>` : ''}
  ${g.본문}
  <p class="작은">이 글은 아티스트 코치가 정리한 일반 안내입니다. 지원 조건과 기준은 기관마다, 해마다 달라질 수 있으니 반드시 해당 공고와 기관의 최신 안내를 확인해 주세요.</p>
  <p><a class="단추 주" href="${길('/')}">지원사업 공고 보러 가기</a> <a class="단추" href="${길('/guide/')}">가이드 목록</a></p>
</article>`,
    }));
  });
  return { 경로목록, 글수: 글들.length };
};
