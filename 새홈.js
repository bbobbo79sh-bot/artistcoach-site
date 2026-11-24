// 새 홈 화면(점구름 ↔ 지도)과 공고 목록(/notices/)을 만든다. 만들기.js 가 불러 쓴다.
// 화면 조각은 홈화면/ 폴더(홈.css · 홈.js · 목록.css · 목록.js · 분류.js · kmap.js)에 있다.
const fs = require('fs');
const path = require('path');

module.exports = ({ 공고, 오늘글, 길, 막기, 쓰기, 뿌리, 멤버십켜짐 }) => {
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
 <a class="scrollcue" href="#아래">↓ 더 보기</a>
</div>
<div class="ticker"><div class="lb"><i></i>LIVE <span>마감 임박</span></div><div class="tr"><div class="tk" id="tk"></div></div></div>
</div>
<div class="tip" id="tip"></div>
</div>
<div class="새홈"><div class="아래" id="아래">`;

  const 라운지구역 = 멤버십켜짐 ? `<section class="라운지구역" id="라운지"><h2>🔒 코치 라운지</h2><p class="d2">코치 크루가 되면 들어올 수 있는 전용 게시판이에요. 제목은 누구나 볼 수 있지만, 안에 든 이야기는 크루에게만 열려요.</p>
<div class="g4"><div class="잠긴"><span class="lk">🔒</span><div class="t">예술활동증명, 왜 떨어졌을까</div><div class="s">반려 사유 7가지와 다시 내는 법</div><span class="m">크루 전용</span></div>
<div class="잠긴"><span class="lk">🔒</span><div class="t">AI로 신청서 첫 문단 쓰는 법</div><div class="s">그대로 따라 쓰는 질문 순서</div><span class="m">크루 전용</span></div>
<div class="잠긴"><span class="lk">🔒</span><div class="t">심사위원 관점 점검표</div><div class="s">내 신청서를 심사위원처럼 읽어 보기</div><span class="m">크루 전용</span></div>
<div class="잠긴"><span class="lk">🔒</span><div class="t">무료로 쓰는 연습·공연 공간</div><div class="s">지역별로 모은 곳과 신청 요령</div><span class="m">크루 전용</span></div></div>
<a class="크루단추" href="${길('/membership/')}">코치 크루 되기 →</a></section>` : '';

  const 목록본문 = `<div class="새목록">${글꼴}
<h1>공고 <small>NOTICES</small></h1><p class="d2">중앙 정부·공공기관 → 광역 → 시·군·구 → 민간 순서로 모았어요. 마감이 아니라 <b>기관 순서</b>가 먼저예요. 공고마다 기관의 원문 링크로 이어져요.</p>
<div class="tools"><div class="fr"><b>장르</b><span id="fF"></span></div><div class="fr"><b>지역</b><span id="fR"></span></div><div class="fr"><b>마감</b><span id="fP"></span></div><div class="fr"><b>기관별</b><span id="fJ"></span></div><div class="fr"><b>검색</b><input class="sr" id="q" placeholder="공고 이름이나 기관 이름" aria-label="공고 검색"></div></div>
<div id="list"></div><div class="note" id="cn"></div></div>`;

  return { 홈스테이지, 홈스크립트, 라운지구역, 목록본문, 목록스크립트 };
};
