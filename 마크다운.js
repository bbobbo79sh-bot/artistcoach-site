// 가이드·자료 글(.md)을 HTML 로 바꾸는 공통 도구.
// 지원: `# 제목`, `한 줄 요약: …`, `## 소제목`, `### 소제목`, 문단, 목록(- / 1.), 인용(>), **굵게**, *기울임*,
//       복사 블록(``` 로 감싼 부분 → 오른쪽에 '복사' 단추가 붙는 상자).
// 광고 자리: 글이 충분히 길 때만(소제목 4개 이상) 중간 1곳에 넣는다. 광고가 꺼져 있으면 아무것도 나오지 않는다.

const NL = String.fromCharCode(10), CRLF = String.fromCharCode(13, 10);

module.exports = ({ 막기, 길 = (x) => x }) => {
  // [이름](https://주소) → 새 창으로 열리는 바깥 링크. http/https 주소만 링크가 되고, 그 밖의 형태는 글자 그대로 보인다.
  const 인라인 = (t) => 막기(t)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');

  // | 칸 | 칸 | 표: 첫 줄은 제목 줄, 둘째 줄(---)은 건너뛴다. 좁은 화면에서는 옆으로 밀어 볼 수 있다.
  const 표만들기 = (줄들) => {
    const 칸 = (l) => l.replace(/^\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim());
    const 행 = 줄들.map(칸).filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c)));
    if (!행.length) return '';
    const [머리, ...몸] = 행;
    return '<div class="표칸"><table><thead><tr>' + 머리.map((c) => '<th>' + 인라인(c) + '</th>').join('') + '</tr></thead><tbody>'
      + 몸.map((r) => '<tr>' + r.map((c) => '<td>' + 인라인(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>' + NL;
  };

  // 두번째 값 { 카드: true } 이면 '## 소제목' 마다 한 장의 카드(<section class="글카드">)로 묶는다 (무료 자료용)
  const 변환 = (원문, { 카드 = false } = {}) => {
    const 줄 = 원문.split(CRLF).join(NL).split(NL);
    let 제목 = '', 요약 = '', 본문 = '', 목록 = null, 인용 = [], 문단 = [], 코드 = null, 표 = [], 카드열림 = false;
    const 닫기 = () => {
      if (문단.length) { 본문 += `<p>${인라인(문단.join(' '))}</p>\n`; 문단 = []; }
      if (인용.length) {
        const 종류 = /^\*\*영감의 한마디\*\*/.test(인용[0]) ? ' class="영감말"' : /^예\)/.test(인용[0]) ? ' class="예시"' : '';
        본문 += `<blockquote${종류}>${인용.map(인라인).join('<br>')}</blockquote>\n`; 인용 = [];
      }
      if (표.length) { 본문 += 표만들기(표); 표 = []; }
      if (목록) {
        const 체크 = (x) => /^\[[ xX]?\]\s/.test(x);
        본문 += `<${목록.태그}${목록.항목.every(체크) ? ' class="체크목록"' : ''}>${목록.항목.map((x) => 체크(x) ? `<li class="체크">${인라인(x.replace(/^\[[ xX]?\]\s/, ''))}</li>` : `<li>${인라인(x)}</li>`).join('')}</${목록.태그}>\n`; 목록 = null;
      }
    };
    for (const 원 of 줄) {
      const l = 원.trim();
      if (/^```/.test(l)) {                       // 복사 블록 시작/끝
        if (코드 === null) { 닫기(); 코드 = []; }
        else { 본문 += `<div class="복사칸"><pre>${막기(코드.join(NL))}</pre><button class="복사" type="button">복사</button></div>\n`; 코드 = null; }
        continue;
      }
      if (코드 !== null) { 코드.push(원.replace(/\s+$/, '')); continue; }
      if (/^\|/.test(l)) { if (문단.length || 목록 || 인용.length) 닫기(); 표.push(l); continue; }
      if (!l) { 닫기(); continue; }
      if (/^# /.test(l)) { 닫기(); 제목 = l.slice(2).trim(); continue; }
      if (/^한 줄 요약\s*:/.test(l)) { 닫기(); 요약 = l.replace(/^한 줄 요약\s*:\s*/, ''); continue; }
      if (/^## /.test(l)) {
        닫기();
        if (카드) { 본문 += (카드열림 ? '</section>\n' : '') + '<section class="글카드">'; 카드열림 = true; }
        본문 += `<h2>${인라인(l.slice(3).trim())}</h2>\n`; continue;
      }
      if (/^### /.test(l)) {
        닫기();
        const 번 = l.slice(4).trim().match(/^(\d+)\.\s*(.+)$/);       // '### 1. 제목' → 번호 동그라미가 붙은 소제목
        본문 += 번 ? `<h3 class="번호"><span>${번[1]}</span>${인라인(번[2])}</h3>\n` : `<h3>${인라인(l.slice(4).trim())}</h3>\n`;
        continue;
      }
      const 그림 = l.match(/^!\[(.*?)\]\(([A-Za-z0-9_.\-가-힣]+)\)$/);   // ![설명](파일이름) → 자료/자료실/그림/ 안의 이미지
      if (그림 && 그림[1] === '표지') continue;   // 표지 그림은 자료 읽기 화면 맨 위 표지 영역이 대신한다
      if (그림) { 닫기(); 본문 += `<figure class="글그림"><img src="${길('/resources/img/' + encodeURI(그림[2]))}" alt="${막기(그림[1])}" loading="lazy"></figure>\n`; continue; }
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
    if (카드열림) 본문 += '</section>\n';
    return { 제목, 요약, 본문 };
  };

  // 소제목이 4개 이상이면 3번째 소제목 앞에 광고 한 칸을 넣는다 (광고칸 문자열이 비어 있으면 그대로)
  const 광고넣기 = (본문, 중간광고) => {
    if (!중간광고) return 본문;
    const 자리 = [];
    const 표식 = 본문.includes('<section class="글카드">') ? '<section class="글카드">' : '<h2>';
    let i = -1;
    while ((i = 본문.indexOf(표식, i + 1)) !== -1) 자리.push(i);
    if (자리.length < 4) return 본문;
    return 본문.slice(0, 자리[2]) + 중간광고 + '\n' + 본문.slice(자리[2]);
  };

  const 복사스크립트 = `<script>
(function(){
  document.querySelectorAll('.복사칸 .복사').forEach(function(b){
    b.addEventListener('click',function(){
      var t=b.parentNode.querySelector('pre').textContent;
      var 끝=function(){b.textContent='복사됨 ✓';setTimeout(function(){b.textContent='복사'},1600)};
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(끝,function(){})}
      else{var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');끝()}catch(e){}document.body.removeChild(a)}
    });
  });
})();
</script>`;

  return { 변환, 광고넣기, 복사스크립트, 인라인 };
};
