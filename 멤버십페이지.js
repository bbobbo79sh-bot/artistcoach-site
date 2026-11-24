// 고급 정보 이용권(월 구독) 안내 화면 (만들기.js 가 불러 쓴다).
// 결제는 토스 정기결제 계약·카드사 심사가 끝난 뒤에 연결한다. 그 전에는 '결제 준비 중'으로만 보이고, 정식 사이트에는 '멤버십공개'가 true 일 때만 나온다.
// 상태(이용중·해지예정)는 로그인 서버(/membership)에서 읽는다. 해지 단추는 "내 공간"(로그인페이지.js)에 있고 여기서도 같은 서버 길을 쓴다.
module.exports = ({ 틀, 길, 쓰기, 토스키 = '' }) => {
  const 스타일 = `
.ms-글{max-width:720px}
.ms-값{display:flex;align-items:baseline;gap:8px;margin:6px 0 4px}.ms-값 b{font-size:34px;letter-spacing:-.03em;color:var(--깊음)}.ms-값 span{color:var(--sub)}
.ms-상자{border:1.5px solid var(--선);border-radius:18px;background:var(--면);padding:18px 20px;margin:16px 0}
.ms-상자 h2{font-size:18px;margin:0 0 8px}.ms-상자 ul{margin:0;padding-left:20px;line-height:1.85}
.ms-준비{background:color-mix(in srgb,var(--브랜드) 7%,#fff);border:1px solid color-mix(in srgb,var(--브랜드) 22%,#fff);border-radius:14px;padding:13px 16px;margin:14px 0;line-height:1.7}
.ms-줄{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0 6px}
.단추[disabled]{opacity:.55;cursor:not-allowed}
.ms-폼{display:flex;flex-direction:column;gap:10px;margin:18px 0}.ms-폼 label{font-weight:700;font-size:15px}
.ms-폼 input[type=email]{width:100%;font:inherit;font-size:16px;padding:12px 14px;border:1px solid var(--선);border-radius:12px;background:var(--면);color:var(--ink);box-sizing:border-box}
.ms-폼 .ms-동의{display:flex;gap:10px;align-items:flex-start;font-weight:500;line-height:1.7}.ms-폼 .ms-동의 input{margin-top:5px;width:18px;height:18px;flex:none}
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
 if(j.결제열림){준비.hidden=true;단추.textContent='가입하기';단추.href=A.base+'/membership/join/'}else{단추.textContent='결제 준비 중';단추.setAttribute('disabled','disabled');단추.removeAttribute('href')}   // 결제가 열리기(토스 정기결제 승인) 전에는 누를 수 없다
})})();</script>`;
  const 가입본문 = `<section class="일반글 ms-글">
  <span class="윗글">이용권</span>
  <h1>고급 정보 이용권 가입</h1>
  <div class="ms-값"><b>월 10,000원</b><span>매월 자동 결제 · 언제든 해지</span></div>
  <div class="ms-상자">
    <h2>가입하기 전에 꼭 확인해 주세요</h2>
    <ul>
      <li>오늘 첫 결제가 되고, 이후 <b>매월 같은 날 등록한 카드로 자동 결제</b>돼요.</li>
      <li>결제 <b>3일 전까지 아래 이메일</b>로 결제 예정 금액과 날짜를 알려 드려요.</li>
      <li><b>해지는 "내 공간"에서 단추 한 번</b>이에요. 해지해도 이미 결제한 기간의 마지막 날까지는 볼 수 있어요.</li>
      <li>회원 전용 글은 열람을 시작하면 <b>청약철회가 제한</b>될 수 있어요. 첫 결제 후 7일 이내이고 글을 열어 보기 전이면 전액 환불해요. (<a href="/refund/">환불 규정</a> · <a href="/terms/">이용약관</a>)</li>
    </ul>
  </div>
  <div class="ms-폼">
    <label for="ms-메일">결제 안내를 받을 이메일</label>
    <input id="ms-메일" type="email" autocomplete="email" maxlength="100" placeholder="name@example.com">
    <label class="ms-동의"><input id="ms-동의" type="checkbox"> <span>위 내용(월 10,000원 자동 결제, 결제 3일 전 이메일 안내, 청약철회 제한 가능)을 확인했고 동의해요.</span></label>
    <p id="ms-오류" class="cm-오류" hidden></p>
    <div class="ms-줄"><button type="button" class="단추 주" id="ms-가입" disabled>카드 등록하고 가입하기</button><a class="단추 약함" href="${길('/membership/')}">돌아가기</a></div>
  </div>
</section>
<script src="https://js.tosspayments.com/v2/standard"></script>
<script>(function(){var A=window.AC,K=${JSON.stringify(토스키)};if(!A)return;if(!A.tok()){try{sessionStorage.setItem('ac_next','/membership/join/')}catch(e){}location.replace(A.base+'/login/');return}
var 단추=document.getElementById('ms-가입'),메일=document.getElementById('ms-메일'),동의=document.getElementById('ms-동의'),오류=document.getElementById('ms-오류'),고객='';
function 말(t){오류.textContent=t;오류.hidden=!t}
if(/[?&]fail/.test(location.search))말('카드 등록이 끝나지 않았어요. 다시 해 주세요.');
function 켜기(){단추.disabled=!(고객&&동의.checked&&메일.value.indexOf('@')>0)}
메일.addEventListener('input',켜기);동의.addEventListener('change',켜기);
A.api('/membership').then(function(j){if(j._s===401)return;
 if(!j.결제열림||!K){말('아직 결제가 열리지 않았어요.');return}
 if(j.이용중){말('이미 이용 중이에요. 이용 기간이 끝난 뒤에 다시 가입할 수 있어요.');return}
 고객=j.고객키;켜기()});
단추.addEventListener('click',function(){if(단추.disabled)return;말('');단추.disabled=true;
 try{sessionStorage.setItem('ms_mail',메일.value.trim())}catch(e){}
 try{var tp=TossPayments(K);tp.payment({customerKey:고객}).requestBillingAuth({method:'CARD',successUrl:location.origin+A.base+'/membership/done/',failUrl:location.origin+A.base+'/membership/join/?fail=1',customerEmail:메일.value.trim()}).catch(function(e){단추.disabled=false;if(e&&e.code!=='USER_CANCEL')말('카드 등록을 시작하지 못했어요. 잠시 뒤 다시 해 주세요.')})}catch(e){단추.disabled=false;말('결제창을 열지 못했어요. 잠시 뒤 다시 해 주세요.')}});
})();</script>`;
  const 완료본문 = `<section class="일반글 ms-글"><h1 id="ms-제목">가입을 마무리하고 있어요…</h1><p id="ms-글">카드를 확인하고 첫 결제를 하고 있어요. 이 화면을 닫지 마세요.</p>
<div class="ms-줄"><a class="단추 주" id="ms-다음" href="${길('/my/')}" hidden>내 공간으로</a></div></section>
<script>(function(){var A=window.AC;if(!A)return;if(!A.tok()){location.replace(A.base+'/login/');return}
var q={};location.search.replace(/^\\?/,'').split('&').forEach(function(x){var k=x.split('=');q[k[0]]=decodeURIComponent(k[1]||'')});
var 제목=document.getElementById('ms-제목'),글=document.getElementById('ms-글'),다음=document.getElementById('ms-다음');
function 끝(t,g,ok){제목.textContent=t;글.textContent=g;다음.hidden=false;다음.href=ok?A.base+'/my/':A.base+'/membership/join/';다음.textContent=ok?'내 공간으로':'다시 해 보기'}
var 메일='';try{메일=sessionStorage.getItem('ms_mail')||''}catch(e){}
if(!q.authKey||!q.customerKey){끝('카드 등록이 끝나지 않았어요','처음부터 다시 해 주세요.',false);return}
history.replaceState(null,'',location.pathname);
A.api('/membership/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({이메일:메일,동의:true,customerKey:q.customerKey,authKey:q.authKey})}).then(function(r){
 try{sessionStorage.removeItem('ms_mail')}catch(e){}
 if(r.가입){끝('가입이 완료됐어요','첫 결제가 됐어요. 다음 결제일은 '+r.다음결제+'이에요. 결제 3일 전에 이메일로 알려 드려요.',true)}
 else{끝('가입하지 못했어요',(r.오류||'잠시 뒤 다시 해 주세요')+'. 결제가 되지 않았다면 요금은 나가지 않아요.',false)}
},function(){끝('연결하지 못했어요','잠시 뒤 다시 해 주세요. 결제 여부는 "내 공간"에서 확인할 수 있어요.',false)})})();</script>`;
  const 만들기 = () => {
    쓰기('membership/join/index.html', 틀({ 제목: '고급 정보 이용권 가입 · 아티스트 코치', 설명: '고급 정보 이용권 가입', 경로: '/membership/join/', 현재: '커뮤니티', 본문: 가입본문, 색인: false }));
    쓰기('membership/done/index.html', 틀({ 제목: '이용권 가입 · 아티스트 코치', 설명: '이용권 가입 마무리', 경로: '/membership/done/', 현재: '커뮤니티', 본문: 완료본문, 색인: false }));
    쓰기('membership/index.html', 틀({ 제목: '고급 정보 이용권 · 아티스트 코치', 설명: '아티스트 코치 고급 정보 이용권 안내', 경로: '/membership/', 현재: '커뮤니티', 본문, 색인: false }));
  };
  return { 스타일, 만들기 };
};
