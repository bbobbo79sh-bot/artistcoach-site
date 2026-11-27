// 코치 크루(월 구독) 안내 화면 (만들기.js 가 불러 쓴다).
// 결제는 토스 정기결제 계약·카드사 심사가 끝난 뒤에 연결한다. 그 전에는 '결제 준비 중'으로만 보이고, 정식 사이트에는 '멤버십공개'가 true 일 때만 나온다.
// 상태(이용중·해지예정)는 로그인 서버(/membership)에서 읽는다. 해지 단추는 "내 공간"(로그인페이지.js)에 있고 여기서도 같은 서버 길을 쓴다.
module.exports = ({ 틀, 길, 쓰기, 토스키 = '' }) => {
  const 스타일 = `
.ms-글{max-width:720px}
.ms-값{display:flex;align-items:baseline;gap:8px;margin:6px 0 4px}.ms-값 b{font-size:34px;letter-spacing:-.03em;color:var(--깊음)}.ms-값 span{color:var(--sub)}
.ms-상자{border:1px solid var(--선);border-radius:20px;background:var(--면);padding:20px 22px;margin:16px 0;box-shadow:0 4px 18px rgba(11,27,58,.06)}
.ms-상자 h2{font-size:18px;margin:0 0 8px}.ms-상자 ul{margin:0;padding-left:20px;line-height:1.85}
.ms-준비{background:color-mix(in srgb,var(--브랜드) 7%,#fff);border:1px solid color-mix(in srgb,var(--브랜드) 22%,#fff);border-radius:14px;padding:13px 16px;margin:14px 0;line-height:1.7}
.ms-줄{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0 6px}
.단추[disabled]{opacity:.55;cursor:not-allowed}
.ms-폼{display:flex;flex-direction:column;gap:10px;margin:18px 0}.ms-폼 label{font-weight:700;font-size:15px}
.ms-폼 input[type=email]{width:100%;font:inherit;font-size:16px;padding:12px 14px;border:1px solid var(--선);border-radius:12px;background:var(--면);color:var(--ink);box-sizing:border-box}
.ms-폼 .ms-동의{display:flex;gap:10px;align-items:flex-start;font-weight:500;line-height:1.7}.ms-폼 .ms-동의 input{margin-top:5px;width:18px;height:18px;flex:none}
.ms-글목록{list-style:none;margin:18px 0;padding:0;display:grid;gap:12px}
.ms-글목록 a{display:block;border:1px solid var(--선);border-radius:20px;background:var(--면);padding:18px 22px;box-shadow:0 4px 18px rgba(11,27,58,.06);text-decoration:none;color:inherit;transition:transform .15s,border-color .15s}
.ms-글목록 a:hover{transform:translateY(-3px);border-color:var(--브랜드)}
.ms-글목록 b{display:block;font-size:19px;line-height:1.4;letter-spacing:-.02em}
.ms-글목록 span{display:block;color:var(--sub);margin-top:4px;line-height:1.6}.ms-글목록 small{display:block;color:var(--sub);margin-top:8px;font-size:13px}
.ms-본문{line-height:1.95;font-size:17px}.ms-본문 h2{font-size:22px;margin:30px 0 8px}.ms-본문 p{margin:0 0 16px}.ms-본문 ul{margin:0 0 16px;padding-left:22px}.ms-본문 li{margin:4px 0}.ms-본문 h3{font-size:19px;margin:24px 0 6px}.ms-본문 ol{margin:0 0 16px;padding-left:24px}.ms-본문 img{max-width:100%;height:auto;border-radius:12px;display:block;margin:14px auto}.ms-본문 blockquote{margin:0 0 16px;padding:12px 16px;border-left:4px solid var(--브랜드);background:var(--아주연함);border-radius:0 12px 12px 0;line-height:1.8}.ms-본문 .ms-표칸{overflow-x:auto;margin:0 0 16px}.ms-본문 table{border-collapse:collapse;width:100%;font-size:15px}.ms-본문 th,.ms-본문 td{border:1px solid var(--선);padding:8px 10px;text-align:left;vertical-align:top;line-height:1.6}.ms-본문 th{background:var(--아주연함)}.ms-본문 .ms-상자묶음{position:relative;margin:0 0 16px}.ms-본문 pre.ms-상자{margin:0;white-space:pre-wrap;word-break:break-word;background:var(--아주연함);border:1px solid var(--선);border-radius:14px;padding:16px 16px 14px;font:inherit;font-size:15.5px;line-height:1.8}.ms-본문 .ms-복사{position:absolute;top:8px;right:8px;border:1px solid var(--선);background:var(--면);border-radius:10px;padding:4px 10px;font-size:13px;cursor:pointer}
.ms-저작{margin-top:34px;padding:14px 16px;border-radius:14px;background:var(--아주연함);color:var(--sub);font-size:14px;line-height:1.7}
`;
  const 본문 = `<section class="일반글 ms-글">
  <span class="윗글">코치 크루</span>
  <h1>코치 크루가 되어 보세요</h1>
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
 if(j.이용중){단추.textContent='코치 라운지 들어가기';단추.href=A.base+'/membership/library/';
  상태.textContent=j.상태==='해지예정'?'해지했어요. '+j.만료+'까지 이용할 수 있어요.':'이용 중이에요. 다음 결제일은 '+(j.다음결제||'-')+'이에요.';return}
 if(j.결제열림){준비.hidden=true;단추.textContent='가입하기';단추.href=A.base+'/membership/join/'}else{단추.textContent='결제 준비 중';단추.setAttribute('disabled','disabled');단추.removeAttribute('href')}   // 결제가 열리기(토스 정기결제 승인) 전에는 누를 수 없다
})})();</script>`;
  const 가입본문 = `<section class="일반글 ms-글">
  <span class="윗글">코치 크루</span>
  <h1>코치 크루 되기</h1>
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
  // 회원 전용 글 목록·읽기 (이용권이 있는 회원만. 글 내용은 로그인 서버에서만 내려온다)
  const 자료목록본문 = `<section class="일반글 ms-글">
  <span class="윗글">코치 라운지</span>
  <h1>코치 라운지</h1>
  <p>AI를 활용한 지원사업 신청서 작성 요령처럼, 공개 글보다 한 걸음 더 들어간 정보를 운영자가 직접 써서 올려요. 코치 크루만 볼 수 있어요.</p>
  <div id="ms-자료" class="작은">불러오는 중…</div>
  <p class="작은" style="margin-top:22px"><a href="${길('/membership/')}">코치 크루 안내로 돌아가기</a></p>
</section>
<script>(function(){var A=window.AC;if(!A)return;
if(!A.tok()){try{sessionStorage.setItem('ac_next','/membership/library/')}catch(e){}location.replace(A.base+'/login/');return}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var 칸=document.getElementById('ms-자료');
A.api('/library').then(function(j){
 if(j._s===401)return;
 if(j._s===403){칸.innerHTML='<div class="ms-상자"><b>코치 크루만 볼 수 있어요.</b><br>가입 전에 가격과 해지 방법을 확인할 수 있어요.</div><p><a class="단추 주" href="'+A.base+'/membership/">코치 크루 안내 보기</a></p>';return}
 if(!j.글||!j.글.length){칸.innerHTML='<div class="ms-상자">아직 올라온 글이 없어요. 곧 올라와요.</div>';return}
 칸.className='';칸.innerHTML='<ul class="ms-글목록">'+j.글.map(function(g){return'<li><a href="'+A.base+'/membership/library/read/?id='+encodeURIComponent(g.id)+'"><b>'+esc(g.제목)+'</b>'+(g.요약?'<span>'+esc(g.요약)+'</span>':'')+(g.날짜?'<small>'+esc(g.날짜)+'</small>':'')+'</a></li>'}).join('')+'</ul>'},
 function(){칸.textContent='연결하지 못했어요. 잠시 뒤 다시 해 주세요.'})})();</script>`;
  const 자료읽기본문 = `<section class="일반글 ms-글">
  <span class="윗글">코치 라운지</span>
  <h1 id="ms-글제목">불러오는 중…</h1>
  <div class="작은" id="ms-글날짜"></div>
  <div class="ms-본문" id="ms-글본문"></div>
  <div class="ms-저작" id="ms-저작" hidden>회원 전용 글은 개인적으로 읽는 용도로만 쓸 수 있어요. 허락 없이 복사해 판매하거나 다른 곳에 올릴 수 없어요.</div>
  <p style="margin-top:22px"><a class="단추 약함" href="${길('/membership/library/')}">목록으로</a></p>
</section>
<script>(function(){var A=window.AC;if(!A)return;
var id=(/[?&]id=([a-z0-9-]+)/.exec(location.search)||[])[1]||'';
if(!A.tok()){try{sessionStorage.setItem('ac_next','/membership/library/')}catch(e){}location.replace(A.base+'/login/');return}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var 제목=document.getElementById('ms-글제목'),날=document.getElementById('ms-글날짜'),몸=document.getElementById('ms-글본문');
function 본문그리기(t){var 줄=String(t).split('\\n'),out=[],문단=[],목록=[],종류='',표=[],인용=[],상자=null,T=String.fromCharCode(96),틱=T+T+T,코드=new RegExp(T+'([^'+T+']+)'+T,'g');
 function 인라인(x){return esc(x).replace(/\\*\\*([^*]+)\\*\\*/g,'<b>$1</b>').replace(코드,'<code>$1</code>')}
 function 문단닫기(){if(문단.length){out.push('<p>'+문단.join('<br>')+'</p>');문단=[]}}
 function 목록닫기(){if(목록.length){out.push('<'+종류+'>'+목록.join('')+'</'+종류+'>');목록=[]}}
 function 인용닫기(){if(인용.length){out.push('<blockquote>'+인용.join('<br>')+'</blockquote>');인용=[]}}
 function 표닫기(){if(!표.length)return;var 행=표.filter(function(r){return!/^\\|?[\\s:|-]+\\|?$/.test(r)}).map(function(r){return r.replace(/^\\||\\|$/g,'').split('|').map(function(c){return c.trim()})});표=[];if(!행.length)return;var h=행.shift();out.push('<div class="ms-표칸"><table><thead><tr>'+h.map(function(c){return'<th>'+인라인(c)+'</th>'}).join('')+'</tr></thead><tbody>'+행.map(function(r){return'<tr>'+r.map(function(c){return'<td>'+인라인(c)+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>')}
 function 닫기(){문단닫기();목록닫기();인용닫기();표닫기()}
 줄.forEach(function(l){
  if(상자){if(l.trim().indexOf(틱)===0){out.push('<div class="ms-상자묶음"><pre class="ms-상자">'+esc(상자.join('\\n'))+'</pre></div>');상자=null}else{상자.push(l)}return}
  var s=l.replace(/\\s+$/,'');
  if(s.trim().indexOf(틱)===0){닫기();상자=[];return}
  if(!s.trim()){닫기();return}
  var im=/^!\\[([^\\]]*)\\]\\(([\\w.-]+\\.(?:svg|jpg|jpeg|png))\\)$/.exec(s.trim());
  if(im){닫기();out.push('<img loading="lazy" src="'+A.base+'/resources/img/'+im[2]+'" alt="'+esc(im[1])+'">');return}
  if(/^### /.test(s)){닫기();out.push('<h3>'+인라인(s.slice(4))+'</h3>');return}
  if(/^## /.test(s)){닫기();out.push('<h2>'+인라인(s.slice(3))+'</h2>');return}
  if(/^\\|/.test(s)){문단닫기();목록닫기();인용닫기();표.push(s);return}
  if(/^> ?/.test(s)){문단닫기();목록닫기();표닫기();인용.push(인라인(s.replace(/^> ?/,'')));return}
  var li=/^(?:- |\\d+\\. )/.exec(s);
  if(li){var k=li[0]==='- '?'ul':'ol';문단닫기();인용닫기();표닫기();if(목록.length&&종류!==k)목록닫기();종류=k;목록.push('<li>'+인라인(s.slice(li[0].length))+'</li>');return}
  목록닫기();인용닫기();표닫기();문단.push(인라인(s))});
 if(상자)out.push('<div class="ms-상자묶음"><pre class="ms-상자">'+esc(상자.join('\\n'))+'</pre></div>');
 닫기();return out.join('')}
function 복사단추(){Array.prototype.forEach.call(몸.querySelectorAll('.ms-상자묶음'),function(w){var b=document.createElement('button');b.type='button';b.className='ms-복사';b.textContent='복사';b.onclick=function(){var x=w.querySelector('pre').textContent;try{navigator.clipboard.writeText(x).then(function(){b.textContent='복사됨'},function(){b.textContent='길게 눌러 복사'})}catch(e){b.textContent='길게 눌러 복사'}setTimeout(function(){b.textContent='복사'},1800)};w.appendChild(b)})}
if(!id){제목.textContent='글을 찾을 수 없어요';return}
A.api('/library/'+id).then(function(j){
 if(j._s===401)return;
 if(j._s===403){제목.textContent='코치 크루만 볼 수 있어요';몸.innerHTML='<p><a class="단추 주" href="'+A.base+'/membership/">코치 크루 안내 보기</a></p>';return}
 if(j._s===404||!j.제목){제목.textContent='글을 찾을 수 없어요';return}
 document.title=j.제목+' · 코치 라운지 · 아티스트 코치';제목.textContent=j.제목;날.textContent=j.날짜||'';몸.innerHTML=본문그리기(j.본문);복사단추();document.getElementById('ms-저작').hidden=false},
 function(){제목.textContent='연결하지 못했어요'})})();</script>`;
  const 만들기 = () => {
    쓰기('membership/library/index.html', 틀({ 제목: '코치 라운지 · 아티스트 코치', 설명: '코치 크루 회원 전용 글', 경로: '/membership/library/', 현재: '커뮤니티', 본문: 자료목록본문, 색인: false }));
    쓰기('membership/library/read/index.html', 틀({ 제목: '코치 라운지 · 아티스트 코치', 설명: '코치 크루 회원 전용 글', 경로: '/membership/library/read/', 현재: '커뮤니티', 본문: 자료읽기본문, 색인: false }));
    쓰기('membership/join/index.html', 틀({ 제목: '코치 크루 되기 · 아티스트 코치', 설명: '코치 크루 되기', 경로: '/membership/join/', 현재: '커뮤니티', 본문: 가입본문, 색인: false }));
    쓰기('membership/done/index.html', 틀({ 제목: '이용권 가입 · 아티스트 코치', 설명: '이용권 가입 마무리', 경로: '/membership/done/', 현재: '커뮤니티', 본문: 완료본문, 색인: false }));
    쓰기('membership/index.html', 틀({ 제목: '코치 크루 · 아티스트 코치', 설명: '아티스트 코치 코치 크루 안내', 경로: '/membership/', 현재: '커뮤니티', 본문, 색인: false }));
  };
  return { 스타일, 만들기 };
};
