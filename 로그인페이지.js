// 로그인 · 내 관심 공고 화면 (만들기.js 가 불러 쓴다). 로그인 서버(로그인서버/ 폴더, Cloudflare Worker)와 이야기한다.
// 켜는 조건: 자료/로그인.json 에 '서버' 주소가 있고, 검수 사이트이거나 '정식공개'가 true 일 때.
// 저장: 로그인 열쇠(토큰)만 이 브라우저 localStorage 에 둔다. 비밀번호·이메일은 다루지 않는다.
module.exports = ({ 설정, 공고, 틀, 길, 막기, 쓰기, 멤버십 = false, 검수용 = false }) => {
  const 판매서버 = /^https:\/\/[\w.\-/]+$/.test(설정.판매서버 || '') ? String(설정.판매서버).replace(/\/+$/, '') : '';   // 전자책 결제 서버(구매 목록·다시 받기)
  const 서버 = String(설정.서버 || '').replace(/\/+$/, '');

  const 스크립트 = `(function(){
var me=document.currentScript,S=me.getAttribute('data-server'),K='ac_t',B=me.getAttribute('data-base')||'';
function tok(){try{return localStorage.getItem(K)}catch(e){return null}}
function set(t){try{t?localStorage.setItem(K,t):localStorage.removeItem(K)}catch(e){}}
function api(p,o){o=o||{};o.headers=o.headers||{};var t=tok();if(t)o.headers.Authorization='Bearer '+t;
  return fetch(S+p,o).then(function(r){return r.json().then(function(j){j._s=r.status;if(r.status===401&&t)set(null);return j},function(){return{_s:r.status}})})}
window.AC={api:api,tok:tok,set:set,base:B,server:S};
// 머리 오른쪽: 로그인 / 내 관심 공고
var a=document.getElementById('계정칸');
if(a){if(tok()){a.textContent='내 공간';a.setAttribute('href',B+'/my/')}else{a.textContent='로그인';a.setAttribute('href',B+'/login/')}}
// 공고 상세의 관심 단추
document.addEventListener('DOMContentLoaded',function(){var b=document.getElementById('관심단추');
if(b){var id=b.getAttribute('data-id'),on=false;
  var paint=function(){b.textContent=on?'★ 관심 공고에 담았어요':'☆ 관심 공고에 담기';b.setAttribute('aria-pressed',on?'true':'false');b.classList.toggle('담음',on)};
  paint();
  if(tok())api('/saved').then(function(j){if(j.공고){on=j.공고.indexOf(id)>=0;paint()}});
  b.addEventListener('click',function(){
    if(!tok()){try{sessionStorage.setItem('ac_next',location.pathname)}catch(e){}location.href=B+'/login/';return}
    b.disabled=true;
    api('/saved/'+id,{method:on?'DELETE':'PUT'}).then(function(j){b.disabled=false;if(j._s===401){location.href=B+'/login/';return}if(j.공고){on=j.공고.indexOf(id)>=0;paint()}else{alert(j.오류||'저장하지 못했어요')}});
  });
}
});
})();`;

  const 로그인본문 = `<section class="일반글 로그인상자">
  <span class="윗글">회원</span>
  <h1>로그인</h1>
  <p>관심 있는 공고를 담아 두고 한곳에서 다시 볼 수 있어요. 로그인은 <b>구글이나 카카오 계정</b>으로 해요. 비밀번호는 우리가 받지도, 저장하지도 않아요.</p>
  <div id="로그인단추" class="로그인단추줄"><p class="작은">불러오는 중…</p></div>
  <p class="작은">받는 정보는 <b>닉네임(이름)</b> 하나예요. 이메일과 전화번호는 받지 않아요. 자세한 내용은 <a href="${길('/privacy/')}">개인정보처리방침</a>을 봐 주세요.</p>
  <p class="작은 로그인오류" id="로그인오류" hidden></p>
  ${검수용 ? `<p class="작은"><b>결제 심사 담당자</b>께: 신청서에 적은 테스트 계정(ID·비밀번호)으로 들어가려면 <a href="${길('/login/review/')}">심사용 로그인</a>을 눌러 주세요. 로그인 뒤 <a href="${길('/membership/')}">코치 크루 이용권</a>에서 가입 화면을 볼 수 있어요.</p>` : ''}
</section>
<script>(function(){var A=window.AC;if(!A)return;var box=document.getElementById('로그인단추');
if(A.tok()){location.replace(A.base+'/');return}
A.api('/config').then(function(j){var list=(j.로그인||[]);if(!list.length){box.innerHTML='<p>지금은 로그인을 준비하고 있어요.</p>';return}
 box.innerHTML='';list.forEach(function(p){var a=document.createElement('a');a.className='단추 로그인-'+p.id;a.textContent=p.이름+'로 로그인';
  a.href=A.server+'/auth/'+p.id+'/start?return='+encodeURIComponent(location.origin);box.appendChild(a)})},function(){box.innerHTML='<p>로그인 서버에 연결하지 못했어요. 잠시 뒤 다시 해 주세요.</p>'});
})();</script>`;

  const 완료본문 = `<section class="일반글 로그인상자"><h1>로그인 중…</h1><p id="완료글">잠시만 기다려 주세요.</p><p><a class="단추 주" href="${길('/login/')}" id="다시" hidden>다시 로그인하기</a></p></section>
<script>(function(){var A=window.AC,h=location.hash.replace(/^#/,''),q={};h.split('&').forEach(function(x){var k=x.split('=');q[k[0]]=decodeURIComponent(k[1]||'')});
history.replaceState(null,'',location.pathname);
var g=document.getElementById('완료글');
if(q.t&&/^[0-9a-f]{64}$/.test(q.t)){A.set(q.t);var n='';try{n=sessionStorage.getItem('ac_next')||'';sessionStorage.removeItem('ac_next')}catch(e){}
 if(!/^\\/[A-Za-z0-9_\\-\\/]*$/.test(n)||n.indexOf('//')===0)n='';
 location.replace(n||A.base+'/')}
else{g.textContent=(q.error||'로그인하지 못했어요')+'.';document.getElementById('다시').hidden=false}})();</script>`;

  // 내 관심 공고: 공고 정보는 이 페이지에 담아 두고, 어떤 공고를 담았는지만 서버에서 받는다
  const 자료 = {}; 공고.forEach((x) => { 자료[x.id] = [x.title, x.org, x.deadline]; });
  const 내것본문 = `<section class="일반글 내것">
  <span class="윗글">내 공간</span>
  <h1>내 공간</h1>
  <p id="내인사" class="작은"></p>
  ${판매서버 ? '<h2>내 구매</h2><div id="내구매"><p class="작은">불러오는 중…</p></div>' : ''}
  ${멤버십 ? `<h2>내 이용권</h2>
  <div id="내이용권"><p class="작은">불러오는 중…</p></div>` : ''}
  <h2>내 관심 공고</h2>
  <div id="내목록"><p class="작은">불러오는 중…</p></div>
  <div class="내줄">
    <button type="button" class="단추" id="로그아웃">로그아웃</button>
    <button type="button" class="단추 약함" id="탈퇴">회원 탈퇴</button>
  </div>
  <p class="작은">탈퇴하면 닉네임과 관심 공고가 바로 지워져요.</p>
</section>
<script>(function(){var A=window.AC,P=${JSON.stringify(판매서버)},B=document.getElementById('내구매');if(!A||!P||!B)return;if(!A.tok())return;
 fetch(P+'/orders',{headers:{Authorization:'Bearer '+A.tok()}}).then(function(r){return r.json()}).then(function(d){
  if(!d||!d.ok){B.innerHTML='<p class="작은">구매 내역을 불러오지 못했어요. 잠시 뒤 다시 해 주세요.</p>';return}
  if(!d.목록.length){B.innerHTML='<p>아직 구매한 책이 없어요. <a href="'+A.base+'/products/">스토어 보러 가기</a></p>';return}
  B.innerHTML='';d.목록.forEach(function(x){var row=document.createElement('div');row.className='내카드';var d1=document.createElement('div');var b=document.createElement('b');b.textContent=x.책;var sm=document.createElement('small');var t=new Date(x.구매시각);sm.textContent=t.getFullYear()+'.'+(t.getMonth()+1)+'.'+t.getDate()+' 구매 · 새 링크는 24시간 동안 쓸 수 있어요';d1.appendChild(b);d1.appendChild(sm);
   var a=document.createElement('a');a.className='받기링크';a.href=x.주소;a.textContent='PDF 내려받기';row.appendChild(d1);row.appendChild(a);B.appendChild(row)})
 }).catch(function(){B.innerHTML='<p class="작은">구매 내역을 불러오지 못했어요.</p>'});
})();</script>
${멤버십 ? `<script>(function(){var A=window.AC,B=document.getElementById('내이용권');if(!A||!B||!A.tok())return;
function 줄(t){B.innerHTML='';var p=document.createElement('p');p.textContent=t;B.appendChild(p)}
function 그리기(j){
 if(!j.이용중){B.innerHTML='<p>이용 중인 이용권이 없어요. <a href="'+A.base+'/membership/">코치 크루 알아보기</a></p>';return}
 B.innerHTML='';var 카드=document.createElement('div');카드.className='내카드';카드.style.cssText='flex-direction:column;align-items:center;text-align:center;padding:22px 18px;gap:16px';var 안=document.createElement('div');var b=document.createElement('b');b.style.fontSize='18px';b.textContent='코치 크루 (월 10,000원)';var s=document.createElement('small');
 s.textContent=j.상태==='해지예정'?'해지했어요 · '+j.만료+'까지 이용할 수 있어요':'이용 중 · 다음 결제일 '+(j.다음결제||'-')+' · '+(j.만료||'-')+'까지 이용';안.appendChild(b);안.appendChild(s);카드.appendChild(안);
 if(j.상태==='이용중'){var 해지=document.createElement('button');해지.type='button';해지.className='빼기';해지.textContent='해지하기';해지.style.cssText='border:1px solid var(--선);border-radius:12px;background:#fff;color:var(--ink);padding:13px 30px;font-size:15px;font-weight:700;cursor:pointer';
  해지.addEventListener('click',function(){if(카드.querySelector('.해지확인'))return;해지.hidden=true;카드.style.flexWrap='wrap';
   var 상=document.createElement('div');상.className='해지확인';상.setAttribute('style','flex-basis:100%;width:100%;margin-top:14px;padding:16px 18px;border:2px solid #e5484d;border-radius:14px;background:#fff6f6;box-sizing:border-box;text-align:left');
   var q=document.createElement('b');q.textContent='정말 해지할까요?';q.style.cssText='display:block;font-size:17px';
   var d=document.createElement('p');d.textContent='다음 결제부터 중단돼요. 이미 결제한 기간('+(j.만료||'-')+')까지는 계속 볼 수 있어요. 이용 기간이 끝나기 전에는 [해지 취소하기] 단추로 되돌릴 수 있어요. (환불은 해지와 달라요. 첫 결제 후 7일 이내이고 글을 열기 전이면 문의하기에서 환불 요청을 해 주세요.)';d.style.margin='8px 0 14px';
   var 줄2=document.createElement('div');줄2.style.cssText='display:flex;gap:10px;flex-wrap:wrap';
   var 예=document.createElement('button');예.type='button';예.textContent='네, 해지할게요';예.style.cssText='background:#e5484d;color:#fff;border:0;border-radius:999px;padding:12px 20px;font-weight:700;font-size:15px;cursor:pointer';
   var 아니=document.createElement('button');아니.type='button';아니.className='단추 주';아니.textContent='계속 이용할게요';
   아니.addEventListener('click',function(){상.remove();해지.hidden=false});
   예.addEventListener('click',function(){예.disabled=true;아니.disabled=true;
    A.api('/membership/cancel',{method:'POST'}).then(function(r){if(r.해지){A.api('/membership').then(그리기)}else{예.disabled=false;아니.disabled=false;alert(r.오류||'해지하지 못했어요. 잠시 뒤 다시 해 주세요')}})});
   줄2.appendChild(예);줄2.appendChild(아니);상.appendChild(q);상.appendChild(d);상.appendChild(줄2);카드.appendChild(상)});
  카드.appendChild(해지)}
 if(j.상태==='해지예정'){var 되돌리기=document.createElement('button');되돌리기.type='button';되돌리기.className='단추 주';되돌리기.textContent='해지 취소하기';되돌리기.style.cssText='font-size:18px;padding:16px 34px;border-radius:14px;box-shadow:0 8px 20px rgba(31,77,255,.30);align-self:center;min-width:220px';
  되돌리기.addEventListener('click',function(){if(카드.querySelector('.취소확인'))return;되돌리기.hidden=true;카드.style.flexWrap='wrap';
   var 상=document.createElement('div');상.className='취소확인';상.setAttribute('style','flex-basis:100%;width:100%;margin-top:14px;padding:16px 18px;border:2px solid #1f4dff;border-radius:14px;background:#f4f7ff;box-sizing:border-box;text-align:left');
   var q=document.createElement('b');q.textContent='해지를 취소할까요?';q.style.cssText='display:block;font-size:17px';
   var d=document.createElement('p');d.textContent='이용권이 계속돼요. 다음 결제일은 '+(j.만료||'-')+'이고, 그날 월 10,000원이 자동 결제돼요. 해지는 언제든 다시 할 수 있어요.';d.style.margin='8px 0 14px';
   var 줄2=document.createElement('div');줄2.style.cssText='display:flex;gap:10px;flex-wrap:wrap';
   var 예=document.createElement('button');예.type='button';예.className='단추 주';예.textContent='네, 계속 이용할게요';
   var 아니=document.createElement('button');아니.type='button';아니.className='단추';아니.textContent='아니요';
   아니.addEventListener('click',function(){상.remove();되돌리기.hidden=false});
   예.addEventListener('click',function(){예.disabled=true;아니.disabled=true;
    A.api('/membership/resume',{method:'POST'}).then(function(r){if(r.취소됨){A.api('/membership').then(그리기)}else{예.disabled=false;아니.disabled=false;alert(r.오류||'해지를 취소하지 못했어요. 잠시 뒤 다시 해 주세요')}})});
   줄2.appendChild(예);줄2.appendChild(아니);상.appendChild(q);상.appendChild(d);상.appendChild(줄2);카드.appendChild(상)});
  카드.appendChild(되돌리기)}
 B.appendChild(카드);
 var 환불=document.createElement('p');환불.className='작은';환불.style.cssText='margin:6px 2px 0;line-height:1.7';환불.innerHTML='환불이 필요하면 <a href="'+A.base+'/community/#ask">커뮤니티 · 문의하기</a>에서 종류를 <b>환불 요청</b>으로 골라 보내 주세요. 첫 결제 후 7일 이내이고 회원 전용 글을 열기 전이면 전액 환불해요. (<a href="'+A.base+'/refund/">환불 규정</a>)';B.appendChild(환불)}
A.api('/membership').then(function(j){if(j._s===401)return;그리기(j)},function(){줄('이용권 정보를 불러오지 못했어요.')});
})();</script>` : ''}
<script type="application/json" id="공고자료">${JSON.stringify(자료).replace(/</g, '\\u003c')}</script>
<script>(function(){var A=window.AC;if(!A)return;if(!A.tok()){location.replace(A.base+'/login/');return}
var D=JSON.parse(document.getElementById('공고자료').textContent),L=document.getElementById('내목록');
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function left(d){if(d==='상시')return null;var o=new Date();o.setHours(0,0,0,0);return Math.round((new Date(d+'T00:00:00')-o)/86400000)}
function draw(ids){if(!ids.length){L.innerHTML='<p>아직 담은 공고가 없어요. 공고 상세에서 <b>☆ 관심 공고에 담기</b>를 눌러 보세요.</p>';return}
 var rows=ids.map(function(id){var x=D[id];if(!x)return{id:id,gone:true,d:1e9};var n=left(x[2]);return{id:id,t:x[0],o:x[1],dl:x[2],n:n,d:n===null?1e8:n}});
 rows.sort(function(a,b){return a.d-b.d});
 L.innerHTML=rows.map(function(r){if(r.gone)return'<div class="내카드 지남"><div><b>내려간 공고</b><small>마감됐거나 사이트에서 내려갔어요</small></div><button type="button" class="빼기" data-id="'+r.id+'">빼기</button></div>';
  var tag=r.n===null?'상시':r.n<0?'마감됨':r.n===0?'오늘 마감':'D-'+r.n;
  return'<div class="내카드'+(r.n!==null&&r.n<0?' 지남':'')+'"><a href="'+A.base+'/notice/'+r.id+'/"><span class="디'+(r.n!==null&&r.n<=3&&r.n>=0?' 급':'')+'">'+tag+'</span><b>'+esc(r.t)+'</b><small>'+esc(r.o)+'</small></a><button type="button" class="빼기" data-id="'+r.id+'">빼기</button></div>'}).join('')}
A.api('/me').then(function(m){if(m._s===401){location.replace(A.base+'/login/');return}document.getElementById('내인사').textContent=(m.이름||'')+'님, 안녕하세요 ('+(m.제공자==='kakao'?'카카오':m.제공자==='review'?'심사용':'구글')+' 로그인)';
 A.api('/saved').then(function(j){draw(j.공고||[])})});
L.addEventListener('click',function(e){var b=e.target.closest('.빼기');if(!b)return;A.api('/saved/'+b.getAttribute('data-id'),{method:'DELETE'}).then(function(j){if(j.공고)draw(j.공고)})});
document.getElementById('로그아웃').addEventListener('click',function(){A.api('/logout',{method:'POST'}).then(function(){A.set(null);location.href=A.base+'/'})});
document.getElementById('탈퇴').addEventListener('click',function(){if(!confirm('탈퇴하면 닉네임과 관심 공고가 지워지고 되돌릴 수 없어요. 탈퇴할까요?'))return;
 A.api('/me',{method:'DELETE'}).then(function(j){if(j.탈퇴){A.set(null);alert('탈퇴했어요.');location.href=A.base+'/'}else{alert(j.오류||'탈퇴하지 못했어요')}})});
})();</script>`;

  const 스타일 = `
#계정칸{font-weight:800;color:var(--깊음)}
.로그인상자{max-width:520px}
.로그인단추줄{display:flex;flex-direction:column;gap:10px;margin:18px 0}
.로그인단추줄 .단추{text-align:center;font-size:17px;padding:16px 20px}
.로그인단추줄 .로그인-google{background:#fff;color:#1f1f1f;border:1px solid var(--선)}
.로그인단추줄 .로그인-kakao{background:#FEE500;color:#191919}
.관심단추{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:15px;font-weight:800;padding:12px 18px;border-radius:14px;border:1.5px solid var(--브랜드);background:#fff;color:var(--깊음);cursor:pointer;margin:0 0 14px}
.관심단추.담음{background:var(--아주연함)}
.내것{max-width:760px}
.내카드{display:flex;gap:10px;align-items:stretch;border:1px solid var(--선);border-radius:16px;margin:10px 0;overflow:hidden;background:#fff}
.내카드 a{flex:1;display:flex;flex-direction:column;gap:4px;padding:14px 16px;text-decoration:none;color:inherit}
.내카드 a b{font-size:16px}.내카드 small,.내카드 div small{color:var(--sub)}
.내카드 .디{align-self:flex-start}
.내카드 .받기링크{display:flex;align-items:center;padding:0 18px;background:var(--브랜드);color:var(--브랜드글);font-weight:800;text-decoration:none;font-size:14px}
.내카드 .빼기{border:0;border-left:1px solid var(--선);background:var(--아주연함);color:var(--sub);font:inherit;font-size:14px;padding:0 16px;cursor:pointer}
.내카드.지남{opacity:.6}
.내카드>div{flex:1;padding:14px 16px;display:flex;flex-direction:column;gap:4px}
.내줄{display:flex;gap:10px;margin:22px 0 8px}
.단추.약함{background:#fff;color:var(--sub);border:1px solid var(--선)}
.심사폼{display:flex;flex-direction:column;gap:10px;margin:18px 0}.심사폼 label{font-weight:700;font-size:15px}
.심사폼 input{width:100%;font:inherit;font-size:16px;padding:12px 14px;border:1px solid var(--선);border-radius:12px;background:var(--면);color:var(--ink);box-sizing:border-box}
`;

  // 토스페이먼츠 심사 담당자용 테스트 로그인 화면. 검수용 사이트에만 만들고 어디에도 링크하지 않는다. (서버: 로그인서버 POST /auth/review)
  const 심사본문 = `<section class="일반글 로그인상자">
  <span class="윗글">심사용</span>
  <h1>심사용 테스트 로그인</h1>
  <p>결제 심사 담당자만 쓰는 화면이에요. 일반 회원은 <a href="${길('/login/')}">구글·카카오 로그인</a>을 써 주세요.</p>
  <form id="심사폼" class="심사폼" autocomplete="off">
    <label for="심사id">ID</label><input id="심사id" type="text" autocomplete="off" maxlength="60">
    <label for="심사pw">비밀번호</label><input id="심사pw" type="password" autocomplete="off" maxlength="80">
    <p class="작은 로그인오류" id="심사오류" hidden></p>
    <button type="submit" class="단추 주" id="심사단추">로그인</button>
  </form>
</section>
<script>(function(){var A=window.AC;if(!A)return;var f=document.getElementById('심사폼'),e=document.getElementById('심사오류'),b=document.getElementById('심사단추');
f.addEventListener('submit',function(ev){ev.preventDefault();e.hidden=true;b.disabled=true;
 fetch(A.server+'/auth/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:document.getElementById('심사id').value.trim(),pw:document.getElementById('심사pw').value})})
 .then(function(r){return r.json().then(function(j){return{s:r.status,j:j}})}).then(function(x){
  if(x.j&&x.j.t&&/^[0-9a-f]{64}$/.test(x.j.t)){A.set(x.j.t);var n='';try{n=sessionStorage.getItem('ac_next')||'';sessionStorage.removeItem('ac_next')}catch(_){}
   if(!/^\\/[A-Za-z0-9_\\-\\/]*$/.test(n)||n.indexOf('//')===0)n='';location.replace(n||A.base+'/membership/');return}
  e.textContent=(x.j&&x.j.오류)||'로그인하지 못했어요';e.hidden=false;b.disabled=false},function(){e.textContent='서버에 연결하지 못했어요';e.hidden=false;b.disabled=false})});
})();</script>`;

  const 만들기 = () => {
    쓰기('login.js', 스크립트);
    const 공통 = { 색인: false };
    if (검수용) 쓰기('login/review/index.html', 틀({ 제목: '심사용 로그인 · 아티스트 코치', 설명: '결제 심사용 테스트 로그인', 경로: '/login/review/', 본문: 심사본문, ...공통 }));
    쓰기('login/index.html', 틀({ 제목: '로그인 · 아티스트 코치', 설명: '아티스트 코치 로그인', 경로: '/login/', 본문: 로그인본문, ...공통 }));
    쓰기('login/done/index.html', 틀({ 제목: '로그인 중 · 아티스트 코치', 설명: '로그인 중', 경로: '/login/done/', 본문: 완료본문, ...공통 }));
    쓰기('my/index.html', 틀({ 제목: '내 관심 공고 · 아티스트 코치', 설명: '내 관심 공고', 경로: '/my/', 본문: 내것본문, ...공통 }));
  };

  return {
    서버,
    스타일,
    // 머리 메뉴에 붙는 조각, 바닥 스크립트 태그, 공고 상세의 관심 단추
    메뉴: `<a id="계정칸" href="${길('/login/')}" rel="nofollow">로그인</a>`,
    스크립트태그: `<script src="${길('/login.js')}" data-server="${막기(서버)}" data-base="${막기(길(''))}" ></script>`,
    관심단추: (id) => `<button type="button" class="관심단추" id="관심단추" data-id="${막기(id)}" aria-pressed="false">☆ 관심 공고에 담기</button>`,
    만들기,
  };
};
