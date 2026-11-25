// 새 홈 화면(점구름 ↔ 지도)과 공고 목록(/notices/)을 만든다. 만들기.js 가 불러 쓴다.
// 화면 조각은 홈화면/ 폴더(홈.css · 홈.js · 목록.css · 목록.js · 분류.js · kmap.js)에 있다.
const fs = require('fs');
const path = require('path');

module.exports = ({ 공고, 오늘글, 길, 막기, 쓰기, 뿌리, 멤버십켜짐, 서버 = '' }) => {
  const 읽기 = (f) => fs.readFileSync(path.join(뿌리, '홈화면', f), 'utf8');


  // 자바스크립트 파일은 assets/ 로 내보낸다
  ['kmap.js', '분류.js', '홈.js', '목록.js'].forEach((f) => 쓰기('assets/' + f, 읽기(f)));

  const 자료 = 공고.map((x) => ({ id: x.id, org: x.org, region: x.region || '', title: x.title, deadline: x.deadline, target: x.target || '' }));
  const 데이터 = `<script>window.NOTICES=${JSON.stringify(자료).replace(/</g, '\\u003c')};window.TODAY=${JSON.stringify(오늘글)};window.__BASE=${JSON.stringify(길(''))};</script>`;
  const 글꼴 = '<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">';

  const 홈스크립트 = `${데이터}
<script src="${길('/assets/kmap.js')}"></script>
<script src="${길('/assets/분류.js')}"></script>
<script src="${길('/assets/홈.js')}"></script>`;
  const 목록스크립트 = `${데이터}
<script src="${길('/assets/분류.js')}"></script>
<script src="${길('/assets/목록.js')}"></script>`;

  const 홈스테이지 = `<div class="새홈">${글꼴}
<div class="stage" id="stage"><canvas id="cv" aria-label="공고 점구름과 지도"></canvas>
<div class="ui">
 <div class="top"><button data-m="0" class="on">장르별 보기</button><button data-m="1">지역으로 보기</button></div>
 <div class="hero"><div class="live"><span class="pu"></span><b>LIVE</b><span class="lt" id="liveT"></span></div>
  <h1 id="h1"></h1><p class="l" id="pl"></p>
  <div class="stats"><div class="stat"><b id="s1">0</b><span>공고</span></div><div class="stat"><b id="s2">0</b><span id="s2l">장르</span></div><div class="stat"><b id="s3">0</b><span>이번 주 마감</span></div></div>
  <div class="chips" id="chips"></div>
  <a class="전체목록" href="${길('/notices/')}">전체 공고 목록 보기 →</a></div>
 <div class="panel" id="panel"><header><div><b id="pt"></b><small id="pc"></small></div><button id="px" aria-label="닫기">✕</button></header><div class="list" id="list"></div></div>
 <div class="hint" id="hint"></div>
 <div class="mapcredit">지도 자료: 통계청 SGIS 행정구역경계(2018)를 단순화해 사용</div>
 <a class="scrollcue" href="#아래">↓ 더 보기</a>
</div>
<div class="ticker"><div class="lb"><i></i>LIVE <span>마감 임박</span></div><div class="tr"><div class="tk" id="tk"></div></div></div>
</div>
<div class="tip" id="tip"></div>
</div>
<div class="새홈"><div class="아래" id="아래">`;

  // 라운지에 실제로 올라간 글 제목만 서버에서 받아 보여 준다(없는 글을 미리 걸어 두지 않는다). 받지 못하면 구역을 숨긴다.
  const 라운지구역 = 멤버십켜짐 ? `<section class="라운지구역" id="라운지" hidden><h2>🔒 코치 라운지</h2><p class="d2">코치 크루가 되면 들어올 수 있는 전용 게시판이에요. 제목은 누구나 볼 수 있지만, 안에 든 이야기는 크루에게만 열려요.</p>
<div class="g4" id="라운지글"></div>
<a class="크루단추" href="${길('/membership/')}">코치 크루 되기 →</a></section>
<script>(function(){var S='${막기(서버)}',sec=document.getElementById('라운지'),g=document.getElementById('라운지글');if(!S||!sec)return;
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
fetch(S+'/library/preview').then(function(r){return r.json()}).then(function(j){var a=(j&&j.글)||[];if(!a.length)return;g.innerHTML=a.slice(0,4).map(function(x){return'<div class="잠긴"><span class="lk">🔒</span><div class="t">'+esc(x.제목)+'</div><span class="m">크루 전용'+(x.날짜?' · '+esc(x.날짜):'')+'</span></div>'}).join('');sec.hidden=false}).catch(function(){})})();</script>` : '';

  const 목록본문 = `<div class="새목록">${글꼴}
<h1>공고 <small>NOTICES</small></h1><p class="d2">중앙 정부·공공기관 → 광역 → 시·군·구 → 민간 순서로 모았어요. 마감이 아니라 <b>기관 순서</b>가 먼저예요. 공고마다 기관의 원문 링크로 이어져요.</p>
<div class="tools"><div class="fr"><b>장르</b><span id="fF"></span></div><div class="fr"><b>지역</b><span id="fR"></span></div><div class="fr"><b>구분</b><span id="fK"></span></div><div class="fr"><b>마감</b><span id="fP"></span></div><div class="fr"><b>기관별</b><span id="fJ"></span></div><div class="fr"><b>검색</b><input class="sr" id="q" placeholder="공고 이름이나 기관 이름" aria-label="공고 검색"></div></div>
<div id="list"></div><div class="note" id="cn"></div></div>`;

  return { 홈스테이지, 홈스크립트, 라운지구역, 목록본문, 목록스크립트 };
};
