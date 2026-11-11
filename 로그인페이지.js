// 로그인 · 내 관심 공고 화면 (만들기.js 가 불러 쓴다). 로그인 서버(로그인서버/ 폴더, Cloudflare Worker)와 이야기한다.
// 켜는 조건: 자료/로그인.json 에 '서버' 주소가 있고, 검수 사이트이거나 '정식공개'가 true 일 때.
// 저장: 로그인 열쇠(토큰)만 이 브라우저 localStorage 에 둔다. 비밀번호·이메일은 다루지 않는다.
module.exports = ({ 설정, 공고, 틀, 길, 막기, 쓰기 }) => {
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
if(a){if(tok()){a.textContent='내 관심 공고';a.setAttribute('href',B+'/my/')}else{a.textContent='로그인';a.setAttribute('href',B+'/login/')}}
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
</section>
<script>(function(){var A=window.AC;if(!A)return;var box=document.getElementById('로그인단추');
if(A.tok()){location.replace(A.base+'/my/');return}
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
 location.replace(n||A.base+'/my/')}
else{g.textContent=(q.error||'로그인하지 못했어요')+'.';document.getElementById('다시').hidden=false}})();</script>`;

  // 내 관심 공고: 공고 정보는 이 페이지에 담아 두고, 어떤 공고를 담았는지만 서버에서 받는다
  const 자료 = {}; 공고.forEach((x) => { 자료[x.id] = [x.title, x.org, x.deadline]; });
  const 내것본문 = `<section class="일반글 내것">
  <span class="윗글">내 공간</span>
  <h1>내 관심 공고</h1>
  <p id="내인사" class="작은"></p>
  <div id="내목록"><p class="작은">불러오는 중…</p></div>
  <div class="내줄">
    <button type="button" class="단추" id="로그아웃">로그아웃</button>
    <button type="button" class="단추 약함" id="탈퇴">회원 탈퇴</button>
  </div>
  <p class="작은">탈퇴하면 닉네임과 관심 공고가 바로 지워져요.</p>
</section>
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
A.api('/me').then(function(m){if(m._s===401){location.replace(A.base+'/login/');return}document.getElementById('내인사').textContent=(m.이름||'')+'님, 안녕하세요 ('+(m.제공자==='kakao'?'카카오':'구글')+' 로그인)';
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
.내카드 .빼기{border:0;border-left:1px solid var(--선);background:var(--아주연함);color:var(--sub);font:inherit;font-size:14px;padding:0 16px;cursor:pointer}
.내카드.지남{opacity:.6}
.내카드>div{flex:1;padding:14px 16px;display:flex;flex-direction:column;gap:4px}
.내줄{display:flex;gap:10px;margin:22px 0 8px}
.단추.약함{background:#fff;color:var(--sub);border:1px solid var(--선)}
`;

  const 만들기 = () => {
    쓰기('login.js', 스크립트);
    const 공통 = { 색인: false };
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
