// 고급 정보 이용권(월 구독) 안내 화면 (만들기.js 가 불러 쓴다).
// 결제는 토스 정기결제 계약·카드사 심사가 끝난 뒤에 연결한다. 그 전에는 '결제 준비 중'으로만 보이고, 정식 사이트에는 '멤버십공개'가 true 일 때만 나온다.
// 상태(이용중·해지예정)는 로그인 서버(/membership)에서 읽는다. 해지 단추는 "내 공간"(로그인페이지.js)에 있고 여기서도 같은 서버 길을 쓴다.
module.exports = ({ 틀, 길, 쓰기 }) => {
  const 스타일 = `
.ms-글{max-width:720px}
.ms-값{display:flex;align-items:baseline;gap:8px;margin:6px 0 4px}.ms-값 b{font-size:34px;letter-spacing:-.03em;color:var(--깊음)}.ms-값 span{color:var(--sub)}
.ms-상자{border:1.5px solid var(--선);border-radius:18px;background:var(--면);padding:18px 20px;margin:16px 0}
.ms-상자 h2{font-size:18px;margin:0 0 8px}.ms-상자 ul{margin:0;padding-left:20px;line-height:1.85}
.ms-준비{background:color-mix(in srgb,var(--브랜드) 7%,#fff);border:1px solid color-mix(in srgb,var(--브랜드) 22%,#fff);border-radius:14px;padding:13px 16px;margin:14px 0;line-height:1.7}
.ms-줄{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0 6px}
.단추[disabled]{opacity:.55;cursor:not-allowed}
`;
  const 본문 = `<section class="일반글 ms-글">
  <span class="윗글">이용권</span>
  <h1>고급 정보 이용권</h1>
  <p>AI를 활용한 지원사업 신청서 작성 요령처럼, 공개 글보다 한 걸음 더 들어간 정보를 회원 전용 게시판에 올립니다.</p>
  <div class="ms-값"><b>월 10,000원</b><span>매월 자동 결제 · 언제든 해지</span></div>
  <div class="ms-준비" id="ms-준비"><b>결제는 아직 열리지 않았어요.</b><br>결제대행사 심사가 끝나면 이 화면에서 가입할 수 있어요. 열리면 바로 알려 드릴게요.</div>
  <div class="ms-상자">
    <h2>결제하기 전에 알아 두세요</h2>
    <ul>
      <li><b>자동 결제</b>예요. 첫 결제일부터 매월 같은 날 등록한 카드로 결제돼요.</li>
      <li>결제 <b>3일 전까지 이메일</b>로 결제 예정 금액과 날짜를 알려 드려요.</li>
      <li><b>해지는 "내 공간"에서 단추 한 번</b>이면 끝나요. 전화나 메일은 필요 없어요. 해지해도 이미 결제한 기간의 마지막 날까지는 볼 수 있어요.</li>
      <li>회원 전용 글은 <b>열람을 시작하면 청약철회가 제한</b>될 수 있어요. 첫 결제 후 7일 이내에 글을 열어 보기 전이면 전액 환불해요.</li>
      <li>자세한 내용은 <a href="/terms/">이용약관</a>과 <a href="/refund/">환불 규정</a>에 있어요.</li>
    </ul>
  </div>
  <div id="ms-내상태" class="작은"></div>
  <div class="ms-줄"><a class="단추 주" id="ms-단추" href="${길('/login/')}">로그인하고 알아보기</a></div>
</section>
<script>(function(){var A=window.AC;if(!A)return;var 단추=document.getElementById('ms-단추'),상태=document.getElementById('ms-내상태'),준비=document.getElementById('ms-준비');
if(!A.tok())return;
A.api('/membership').then(function(j){if(j._s===401)return;
 if(j.이용중){단추.textContent='내 공간에서 확인하기';단추.href=A.base+'/my/';
  상태.textContent=j.상태==='해지예정'?'해지했어요. '+j.만료+'까지 이용할 수 있어요.':'이용 중이에요. 다음 결제일은 '+(j.다음결제||'-')+'이에요.';return}
 단추.textContent='결제 준비 중';단추.setAttribute('disabled','disabled');단추.removeAttribute('href');   // 결제 연결(토스 정기결제 승인 뒤)이 붙기 전까지는 누를 수 없다
})})();</script>`;
  const 만들기 = () => {
    쓰기('membership/index.html', 틀({ 제목: '고급 정보 이용권 · 아티스트 코치', 설명: '아티스트 코치 고급 정보 이용권 안내', 경로: '/membership/', 현재: '커뮤니티', 본문, 색인: false }));
  };
  return { 스타일, 만들기 };
};
