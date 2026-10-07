// 자료/가이드/*.md 를 읽어 /guide/ 목록과 글 페이지를 만든다. (변환·광고 자리·복사 단추는 마크다운.js 공통 도구)
// 글 형식: 첫 줄 `# 제목`, 다음에 `한 줄 요약: ...`, 이후 본문. 파일 이름의 앞 숫자(01_…)가 글 번호이자 주소(/guide/01/)가 된다.

const fs = require('fs');
const path = require('path');

module.exports = ({ 뿌리, 틀, 길, 막기, 쓰기, 광고칸 = () => '' }) => {
  const 폴더 = path.join(뿌리, '자료', '가이드');
  if (!fs.existsSync(폴더)) return { 경로목록: [], 글수: 0 };
  const { 변환, 광고넣기, 복사스크립트 } = require('./마크다운.js')({ 막기 });

  const 글들 = fs.readdirSync(폴더).filter((f) => /^\d+_.+\.md$/.test(f)).sort().map((f) => {
    const 번호 = f.match(/^(\d+)_/)[1];
    return { 번호, ...변환(fs.readFileSync(path.join(폴더, f), 'utf8')) };
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
      스크립트: g.본문.includes('class="복사칸"') ? 복사스크립트 : '',
      본문: `<article class="일반글 글본문">
  <span class="윗글">가이드</span>
  <h1>${막기(g.제목)}</h1>
  ${g.요약 ? `<p class="리드">${막기(g.요약)}</p>` : ''}
  ${광고넣기(g.본문, 광고칸('글중간'))}
  ${광고칸('글끝')}
  <p class="작은">이 글은 아티스트 코치가 정리한 일반 안내입니다. 지원 조건과 기준은 기관마다, 해마다 달라질 수 있으니 반드시 해당 공고와 기관의 최신 안내를 확인해 주세요.</p>
  <p><a class="단추 주" href="${길('/')}">지원사업 공고 보러 가기</a> <a class="단추" href="${길('/guide/')}">가이드 목록</a></p>
</article>`,
    }));
  });
  return { 경로목록, 글수: 글들.length };
};
