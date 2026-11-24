// 지원사업 컨설팅 화면 (만들기.js 가 불러 쓴다). 질문지 작성 · 자동 저장 · 제출 · 제출 뒤 진행 상태.
// 컨설팅 봇의 시안(바탕화면 '지원사업 컨설팅 봇')을 사이트에 옮긴 것이다. 문구 원칙: 흰색 톤, 가격·"질문 30개" 같은 숫자를 앞세우지 않는다, "자세히"를 권한다.
// 결제 연결 전이라 검수 사이트에서만 만든다(정식 사이트에는 이 화면이 없다). 내용은 로그인 서버(/consulting)에 저장되고 본인과 운영자만 본다.
// 아직 없는 것: 파일 첨부 · 영감 피드백/추가 질문 화면 · 결제 연결.
const fs = require('fs');
const path = require('path');
module.exports = ({ 틀, 길, 쓰기, 토스키 = '' }) => {
  const 구역 = [
    { id: 'A', t: 'A. 나의 활동', s: '심사위원이 볼 나의 모습이에요.' },
    { id: 'B', t: 'B. 지원사업 경험', s: '지금까지의 도전을 돌아봅니다.' },
    { id: 'C', t: 'C. 지원사업으로 얻고 싶은 것', s: '목표를 분명하게 합니다.' },
    { id: 'D', t: 'D. 맞는 사업 찾기', s: '방향을 좁혀 갑니다.' },
    { id: 'E', t: 'E. 준비 상태', s: '실행할 수 있는지 점검합니다.' },
  ];
  const 질문 = [
    { n: 1, s: 'A', q: '지금 하는 활동을 한 문장으로 소개해 주세요.', h: '지원서 첫 줄에 쓴다고 생각하고 적어 주세요.' },
    { n: 2, s: 'A', q: '활동 이력을 연도별로 정리해 주세요.', h: '공연·전시·교육·작업, 규모와 횟수' },
    { n: 3, s: 'A', q: '그중 심사위원에게 가장 자신 있게 보여줄 작업 하나와 그 이유는 무엇인가요?' },
    { n: 4, s: 'A', q: '내 작업의 핵심 주제나 반복해서 다루는 질문은 무엇인가요?' },
    { n: 5, s: 'A', q: '같은 분야의 다른 예술인과 구별되는 나만의 점은 무엇인가요?' },
    { n: 6, s: 'A', q: '내 활동을 뒷받침하는 자료는 무엇인가요?', h: '영상·사진·기록·후기·언론 보도·수상·관객 수 등. 영상이나 문서는 주소(링크)를 답변에 적어 주세요.' },
    { n: 7, s: 'B', q: '지금까지 지원사업에 신청한 경험을 모두 적어 주세요.', h: '사업명·연도·결과' },
    { n: 8, s: 'B', q: '선정된 경험이 있다면, 왜 선정되었다고 생각하나요?' },
    { n: 9, s: 'B', q: '탈락한 경험이 있다면, 왜 탈락했다고 생각하나요?' },
    { n: 10, s: 'B', q: '지원서를 쓸 때 가장 힘들었던 부분은 무엇인가요?', h: '사업 구상·글쓰기·예산·서류·증빙' },
    { n: 11, s: 'B', q: '지원서는 주로 누가, 얼마나 시간을 들여 쓰나요?' },
    { n: 12, s: 'B', q: '지원사업을 한 번도 안 해 봤다면, 시작하지 못한 이유는 무엇인가요?' },
    { n: 13, s: 'C', q: '지원사업을 통해 가장 얻고 싶은 것은 무엇인가요?', h: '네 가지에 1위~4위 순서를 매겨 주세요.', kind: 'rank', items: ['기회', '제작비', '수익', '도전'] },
    { n: 14, s: 'C', q: '1년 안에 지원사업으로 이루고 싶은 구체적인 결과는 무엇인가요?' },
    { n: 15, s: 'C', q: '3년 뒤, 지원사업을 거친 내 모습은 어떤 상태이면 좋겠나요?' },
    { n: 16, s: 'C', q: '지원사업을 받으면 내 활동에서 무엇이 달라지나요?', h: '작품·관객·수입·활동 범위' },
    { n: 17, s: 'C', q: '지원사업을 받지 못하면 그 계획은 어떻게 되나요? 대안이 있나요?' },
    { n: 18, s: 'C', q: '지원사업에 의존하지 않고 활동을 이어가는 방법을 생각해 본 적이 있나요? 있다면 적어 주세요.' },
    { n: 19, s: 'D', q: '지금까지 알아본 지원사업 중 관심 있는 것이 있나요? 이유와 함께 적어 주세요.' },
    { n: 20, s: 'D', q: '내 활동 분야와 단계에 맞는 지원사업이 무엇인지 알고 있나요? 모르는 부분은 무엇인가요?' },
    { n: 21, s: 'D', q: '기본 자격을 알려 주세요.', kind: 'basic' },
    { n: 22, s: 'D', q: '개인으로 지원할지, 단체로 지원할지, 아직 고민 중인 부분이 있나요?' },
    { n: 23, s: 'D', q: '지원하고 싶지만 조건이 안 맞아 포기한 사업이 있나요? 무엇이 부족했나요?' },
    { n: 24, s: 'D', q: '올해와 내년 중 가장 도전하고 싶은 사업 시기는 언제인가요? 그 이유는 무엇인가요?' },
    { n: 25, s: 'E', q: '지원사업 신청에 쓸 수 있는 시간은 주당 얼마나 되나요?' },
    { n: 26, s: 'E', q: '지원이 선정되었을 때 실제로 사업을 수행할 사람과 자원은 있나요?', h: '팀·공간·장비·협력처' },
    { n: 27, s: 'E', q: '선정되면 자부담이나 정산 부담이 생기는데, 감당할 수 있는 정도는 어느 정도인가요?' },
    { n: 28, s: 'E', q: '지원서에 쓸 사업 아이디어가 있나요? 있다면 자세히 적어 주세요.' },
    { n: 29, s: 'E', q: '지금 가장 걱정되는 부분은 무엇인가요?', h: '구상·글쓰기·예산·팀·일정·정산' },
    { n: 30, s: 'E', q: '이 컨설팅이 끝났을 때 가장 얻고 싶은 것은 무엇인가요?' },
  ];

  const 스타일 = `
.cs-글{max-width:760px}
.cs-상자{border:1.5px solid var(--선);border-radius:18px;background:var(--면);padding:18px 20px;margin:16px 0}
.cs-상자 h2{font-size:18px;margin:0 0 10px}
.cs-단계목록{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.cs-단계목록 li{display:flex;gap:12px;align-items:flex-start}
.cs-단계목록 .번호{flex:none;width:28px;height:28px;border-radius:50%;background:var(--브랜드);color:var(--브랜드글,#fff);font-weight:800;display:grid;place-items:center;font-size:14px}
.cs-단계목록 small{display:block;color:var(--sub)}
.cs-구역{font-size:22px;margin:38px 0 4px}
.cs-구역말{color:var(--sub);margin:0 0 10px;font-size:14px}
.cs-질문{border:1px solid var(--선);border-radius:16px;background:var(--면);padding:16px 18px;margin:12px 0}
.cs-질문 label.제목{display:block;font-weight:700;margin-bottom:4px;line-height:1.55}
.cs-질문 .번호{color:var(--브랜드);margin-right:6px}
.cs-질문 .힌트{display:block;color:var(--sub);font-size:13px;margin:0 0 8px}
.cs-질문 textarea,.cs-질문 input[type=text],.cs-질문 select{width:100%;box-sizing:border-box;font:inherit;font-size:16px;padding:10px 12px;border:1px solid var(--선);border-radius:10px;background:var(--면);color:var(--ink)}
.cs-질문 textarea{min-height:110px;resize:vertical;line-height:1.6}
.cs-질문 textarea:focus,.cs-질문 input:focus,.cs-질문 select:focus{outline:2px solid var(--브랜드);outline-offset:1px}
.cs-하위{margin-top:12px}.cs-하위 .소제목{font-size:14px;font-weight:700;margin-bottom:4px}
.cs-줄{display:flex;gap:16px;flex-wrap:wrap;margin:6px 0}.cs-줄 label{display:flex;gap:6px;align-items:center;cursor:pointer}
.cs-순위{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}.cs-순위 label{font-size:14px;font-weight:700}.cs-순위 select{margin-top:4px}
.cs-바닥{position:fixed;left:0;right:0;bottom:0;background:var(--면);border-top:1px solid var(--선);z-index:20}
.cs-바닥 .안{max-width:760px;margin:0 auto;padding:10px 16px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;font-size:14px}
.cs-바닥 .막대{flex:1;min-width:80px;height:8px;background:var(--선);border-radius:99px;overflow:hidden}.cs-바닥 .막대 i{display:block;height:100%;width:0;background:var(--브랜드);transition:width .3s}
.cs-저장{color:var(--sub)}.cs-저장.됨{color:#1b7f4d;font-weight:700}.cs-저장.안됨{color:#b45309;font-weight:700}
.cs-큰단추{width:100%;font-size:17px;padding:14px 20px}
.cs-단계표{display:flex;gap:6px;margin:18px 0;flex-wrap:wrap}
.cs-단계표 div{flex:1;min-width:130px;border:1px solid var(--선);border-radius:12px;padding:10px 12px;font-size:14px;color:var(--sub)}
.cs-단계표 div b{display:block;font-size:12px}
.cs-단계표 div.끝{background:var(--아주연함);color:#1b7f4d;border-color:#1b7f4d}
.cs-단계표 div.지금{border-color:var(--브랜드);color:var(--깊음);font-weight:800}
.cs-내답 details{border:1px solid var(--선);border-radius:12px;margin:8px 0;background:var(--면)}
.cs-내답 summary{cursor:pointer;padding:11px 14px;font-weight:700}
.cs-내답 .답{padding:0 14px 14px;white-space:pre-wrap;line-height:1.7}
.cs-검수{background:var(--아주연함);border-radius:10px;padding:10px 14px;font-size:14px;color:var(--깊음);margin:12px 0}
`;

  const 본문 = `<section class="일반글 cs-글" id="cs-root">
  <span class="윗글">컨설팅</span>
  <h1>지원사업 컨설팅</h1>
  <p>불러오는 중…</p>
</section>
<script>(function(){var A=window.AC;if(!A)return;
var SEC=${JSON.stringify(구역)},Q=${JSON.stringify(질문)};
var root=document.getElementById('cs-root'),data={},timer=null,dirty=false,바닥=null;
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function 시각(){var d=new Date();return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0')}
function 날짜글(s){var m=/^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(s||'');return m?m[1]+'년 '+Number(m[2])+'월 '+Number(m[3])+'일':(s||'')}
if(!A.tok()){try{sessionStorage.setItem('ac_next','/consulting/me/')}catch(e){}location.replace(A.base+'/login/');return}
var 머리='<span class="윗글">컨설팅</span><h1>지원사업 컨설팅</h1>';
function 오류(t){root.innerHTML=머리+'<p>'+esc(t)+'</p>'}
function 불러오기(){A.api('/consulting/me').then(function(j){if(j._s===401)return;그리기(j)},function(){오류('연결하지 못했어요. 잠시 뒤 다시 해 주세요.')})}
function 그리기(j){if(바닥){바닥.remove();바닥=null}if(!j.있음){시작화면(j);return}if(j.상태==='작성중'){폼(j);return}제출후(j)}
var 진행방식='<div class="cs-상자"><h2>진행 방식</h2><ol class="cs-단계목록">'
 +'<li><span class="번호">1</span><div><b>질문에 답변을 작성해 주세요</b><small>이 페이지를 쭉 내려가며 질문에 답변하고 제출해 주세요. 쓰는 내용은 자동으로 저장돼요.</small></div></li>'
 +'<li><span class="번호">2</span><div><b>영감님의 피드백과 추가 질문</b><small>제출하시면 7일 이내에 피드백과 추가 질문이 올라와요. 이 페이지에서 본인만 볼 수 있어요.</small></div></li>'
 +'<li><span class="번호">3</span><div><b>추가 질문에 다시 답변해 주세요</b><small>해당 질문에 답변을 주시면 돼요.</small></div></li>'
 +'<li><span class="번호">4</span><div><b>최종 피드백으로 컨설팅 종료</b><small>그에 따른 피드백을 드리고 컨설팅이 마무리돼요.</small></div></li></ol></div>';
function 시작화면(j){
 root.innerHTML=머리+'<p>컨설팅은 아래 순서로 진행돼요.</p>'+진행방식+
  '<div class="cs-상자"><b>컨설팅은 결제하면 바로 시작할 수 있어요.</b><br><small style="color:var(--sub)">결제는 토스페이먼츠로 해요. 카드번호는 토스페이먼츠가 처리하고 이 사이트에는 저장되지 않아요.</small></div>'
  +'<a class="단추 주 cs-큰단추" id="cs-결제" href="'+A.base+'/consulting/pay/" style="display:block;text-align:center;text-decoration:none">'+(j.결제열림===false?'결제 준비 중이에요':'결제하고 시작하기')+'</a>';
}
function 질문칸(q){var id='q'+q.n,본='';
 if(q.kind==='rank'){본='<div class="cs-순위">'+q.items.map(function(it,i){return'<div><label for="'+id+'_'+i+'">'+esc(it)+'</label><select id="'+id+'_'+i+'" data-k="'+id+'_'+i+'"><option value="">선택</option><option>1위</option><option>2위</option><option>3위</option><option>4위</option></select></div>'}).join('')+'</div>'}
 else if(q.kind==='basic'){
  본='<div class="cs-하위"><div class="소제목">거주지는 어디인가요?</div><input type="text" data-k="'+id+'_addr" maxlength="200" placeholder="예: 서울시 마포구"></div>'
   +'<div class="cs-하위"><div class="소제목">사업자등록증이 있나요?</div><div class="cs-줄"><label><input type="radio" name="'+id+'_biz" value="있음" data-k="'+id+'_biz"> 있음</label><label><input type="radio" name="'+id+'_biz" value="없음" data-k="'+id+'_biz"> 없음</label></div></div>'
   +'<div class="cs-하위"><div class="소제목">단체를 설립할 계획이 있나요?</div><div class="cs-줄"><label><input type="radio" name="'+id+'_org" value="있음" data-k="'+id+'_org"> 있음</label><label><input type="radio" name="'+id+'_org" value="없음" data-k="'+id+'_org"> 없음</label><label><input type="radio" name="'+id+'_org" value="고민 중" data-k="'+id+'_org"> 고민 중</label></div>'
   +'<input type="text" data-k="'+id+'_orgnote" maxlength="300" placeholder="계획이 있다면 간단히 적어 주세요 (시기, 형태 등)"></div>'}
 else{본='<textarea id="'+id+'" data-k="'+id+'" maxlength="6000" placeholder="여기에 적어 주세요"></textarea>'}
 return'<div class="cs-질문"><label class="제목" for="'+id+'"><span class="번호">'+q.n+'</span>'+esc(q.q)+'</label>'+(q.h?'<span class="힌트">'+esc(q.h)+'</span>':'')+본+'</div>'}
function 답함(q){if(q.kind==='rank')return q.items.some(function(_,i){return data['q'+q.n+'_'+i]});if(q.kind==='basic')return!!(data.q21_addr||data.q21_biz||data.q21_org);return!!(data['q'+q.n]||'').trim()}
function 세기(){return Q.filter(답함).length}
function 진행(){var c=세기();var n=document.getElementById('cs-개수'),f=document.getElementById('cs-채움'),i=document.getElementById('cs-제출말');if(n)n.textContent=c+'개 작성';if(f)f.style.width=(c/Q.length*100)+'%';if(i)i.textContent=c===Q.length?'모든 질문에 답변하셨어요. 제출하시면 7일 이내에 영감님의 피드백과 추가 질문이 올라와요.':'비어 있는 질문이 있어요. 모두 답변해 주시면 더 좋은 피드백을 받으실 수 있어요.'}
function 상태말(t,종류){var s=document.getElementById('cs-저장');if(!s)return;s.textContent=t;s.className='cs-저장'+(종류?' '+종류:'')}
function 저장(빠르게){clearTimeout(timer);if(!dirty)return Promise.resolve(true);
 var 몸=JSON.stringify({답변:data});var 옵션={method:'PUT',headers:{'Content-Type':'application/json'},body:몸};if(빠르게&&몸.length<60000)옵션.keepalive=true;
 상태말('저장 중…','');
 return A.api('/consulting/me/answers',옵션).then(function(r){
  if(r.저장){dirty=false;상태말('자동 저장됨 · '+시각(),'됨');return true}
  if(r._s===409){불러오기();return false}
  상태말('저장하지 못했어요. 잠시 뒤 다시 시도해요.','안됨');return false},function(){상태말('저장하지 못했어요. 연결을 확인해 주세요.','안됨');return false})}
function 예약(){dirty=true;상태말('저장 중…','');clearTimeout(timer);timer=setTimeout(function(){저장(false)},800);진행()}
function 폼(j){data=Object.assign({},j.답변||{});dirty=false;
 var 본='';SEC.forEach(function(s){본+='<h2 class="cs-구역">'+esc(s.t)+'</h2><p class="cs-구역말">'+esc(s.s)+'</p>';Q.filter(function(q){return q.s===s.id}).forEach(function(q){본+=질문칸(q)})});
 root.innerHTML=머리+'<p>결제해 주셔서 감사합니다. 컨설팅은 아래 순서로 진행돼요.</p>'+진행방식
  +'<div class="cs-상자"><h2>작성 안내</h2><p style="margin:0">쭉 내려가며 작성해 주세요. 최대한 자세하게, 친절히 작성해 주세요.<br>작성해 주신 내용을 중심으로 컨설팅이 이루어지기 때문에, 자세하게 작성해 주실수록 좋은 답변을 받으실 수 있습니다.</p>'
  +'<p class="cs-구역말" style="margin:12px 0 0">모르겠는 부분은 "모르겠다"고 적어 주셔도 괜찮아요. 영상이나 문서는 주소(링크)를 답변에 적어 주세요. 쓰신 내용은 본인과 컨설턴트만 볼 수 있고, 컨설팅 외 용도로 쓰지 않아요.</p></div>'
  +본
  +'<div class="cs-상자"><h2>다 쓰셨나요?</h2><p class="cs-구역말" id="cs-제출말"></p><button type="button" class="단추 주 cs-큰단추" id="cs-제출">제출하기</button><p class="cs-구역말" style="margin-top:10px">제출하시면 더 이상 고칠 수 없어요. 피드백이 올라오면 이메일로 알려 드려요.</p></div>';
 root.querySelectorAll('[data-k]').forEach(function(el){var k=el.getAttribute('data-k');
  if(el.type==='radio'){if(data[k]===el.value)el.checked=true}else if(data[k]!==undefined)el.value=data[k]});
 root.addEventListener('input',입력,false);root.addEventListener('change',입력,false);
 function 입력(e){var el=e.target;if(!el.getAttribute)return;var k=el.getAttribute('data-k');if(!k)return;if(el.type==='radio'){if(!el.checked)return}
  if(el.value===''||el.value==null)delete data[k];else data[k]=el.value;예약()}
 바닥=document.createElement('div');바닥.className='cs-바닥';바닥.innerHTML='<div class="안"><span id="cs-저장" class="cs-저장">자동 저장 켜짐</span><div class="막대"><i id="cs-채움"></i></div><span id="cs-개수">0개 작성</span></div>';document.body.appendChild(바닥);
 진행();
 document.getElementById('cs-제출').addEventListener('click',function(){var b=this;
  if(세기()===0){alert('답변을 한 칸 이상 적어 주세요.');return}
  if(세기()<Q.length&&!confirm('비어 있는 질문이 있어요. 그대로 제출할까요?\\n제출하면 더 이상 고칠 수 없어요.'))return;
  if(세기()===Q.length&&!confirm('제출할까요? 제출하면 더 이상 고칠 수 없어요.'))return;
  b.disabled=true;저장(false).then(function(ok){if(!ok){b.disabled=false;alert('저장하지 못해서 제출하지 않았어요. 잠시 뒤 다시 해 주세요.');return}
   A.api('/consulting/me/submit',{method:'POST'}).then(function(r){if(r.있음){그리기(r);window.scrollTo(0,0)}else{b.disabled=false;alert(r.오류||'제출하지 못했어요')}},function(){b.disabled=false;alert('연결하지 못했어요. 잠시 뒤 다시 해 주세요.')})})})}
function 제출후(j){var 목록='';Q.forEach(function(q){var 값='';
  if(q.kind==='rank'){값=q.items.map(function(it,i){var v=j.답변['q'+q.n+'_'+i];return v?it+' '+v:''}).filter(Boolean).join(' · ')}
  else if(q.kind==='basic'){var a=j.답변;값=[a.q21_addr&&'거주지: '+a.q21_addr,a.q21_biz&&'사업자등록증: '+a.q21_biz,a.q21_org&&'단체 설립 계획: '+a.q21_org,a.q21_orgnote].filter(Boolean).join('\\n')}
  else{값=j.답변['q'+q.n]||''}
  if(값)목록+='<details><summary>'+q.n+'. '+esc(q.q)+'</summary><div class="답" data-n="'+q.n+'"></div></details>'});
 root.innerHTML=머리+'<p>나의 컨설팅 페이지</p>'
  +'<div class="cs-단계표"><div class="끝"><b>1</b>답변 제출 완료</div><div class="지금"><b>2</b>1차 피드백 · 추가 질문</div><div><b>3</b>추가 질문 답변</div><div><b>4</b>최종 피드백</div></div>'
  +'<div class="cs-상자"><h2>제출하셨어요</h2><p style="margin:0">'+(j.마감?esc(날짜글(j.마감))+'까지 ':'7일 이내에 ')+'영감님의 피드백과 추가 질문이 올라와요. 올라오면 이메일로 알려 드려요.</p></div>'
  +'<div class="cs-상자"><h2>내가 쓴 답변</h2><div class="cs-내답">'+목록+'</div></div>';
 root.querySelectorAll('.답').forEach(function(el){var n=Number(el.getAttribute('data-n')),q=Q.filter(function(x){return x.n===n})[0],값='';
  if(q.kind==='rank'){값=q.items.map(function(it,i){var v=j.답변['q'+n+'_'+i];return v?it+' '+v:''}).filter(Boolean).join(' · ')}
  else if(q.kind==='basic'){var a=j.답변;값=[a.q21_addr&&'거주지: '+a.q21_addr,a.q21_biz&&'사업자등록증: '+a.q21_biz,a.q21_org&&'단체 설립 계획: '+a.q21_org,a.q21_orgnote].filter(Boolean).join('\\n')}
  else{값=j.답변['q'+n]||''}
  el.textContent=값})}
window.addEventListener('pagehide',function(){if(dirty)저장(true)});
document.addEventListener('visibilitychange',function(){if(document.hidden&&dirty)저장(true)});
불러오기();
})();</script>`;

  const 결제본문 = `<section class="일반글 cs-글" id="cs-결제화면">
  <span class="윗글">컨설팅</span>
  <h1>컨설팅 신청</h1>
  <p>결제하면 바로 질문지를 시작할 수 있어요.</p>
  <div class="cs-상자"><h2>지원사업 컨설팅 (비대면 서면)</h2>
    <div style="display:flex;align-items:baseline;gap:8px;margin:4px 0 10px"><b style="font-size:30px;letter-spacing:-.03em">100,000원</b><span style="color:var(--sub)">1회 결제</span></div>
    <ul style="margin:0;padding-left:20px;line-height:1.85">
      <li>결제한 본인이 로그인해서 보는 이 사이트 안의 웹 페이지로 진행돼요. 파일을 이메일로 보내 드리는 방식이 아니에요.</li>
      <li>질문지를 제출한 날부터 <b>7일 이내</b> 첫 피드백과 추가 질문, 추가 질문 답변을 받은 날부터 <b>7일 이내</b> 최종 피드백을 드려요. 답변이 늦어지면 그만큼 길어져요. (최대 약 3주)</li>
      <li>컨설팅은 방향과 준비를 돕는 서비스이며, 지원사업 선정을 보장하지 않아요.</li>
    </ul></div>
  <div class="cs-상자"><h2>환불 안내</h2>
    <ul style="margin:0;padding-left:20px;line-height:1.85">
      <li>질문지 제출 전, 결제일부터 7일 이내이면 <b>전액 환불</b>해요.</li>
      <li>질문지를 제출한 뒤 첫 피드백 전에는 결제 금액의 <b>50%</b>를 환불해요.</li>
      <li>첫 피드백을 받은 뒤에는 이미 서비스가 제공되어 <b>환불이 어려워요.</b></li>
      <li>약속한 기한을 지키지 못하면 <b>전액 환불</b>해 드려요. <a href="${길('/refund/')}">환불 규정 전체 보기</a> · <a href="${길('/terms/')}">이용약관</a></li>
    </ul></div>
  <div class="cs-상자">
    <label style="display:flex;gap:10px;align-items:flex-start;margin:4px 0"><input type="checkbox" id="cs-동의1" style="margin-top:6px;width:18px;height:18px;flex:none"><span><b>(필수)</b> 위 서비스 내용과 이용약관, 환불 규정을 확인했고 동의해요.</span></label>
    <label style="display:flex;gap:10px;align-items:flex-start;margin:10px 0 4px"><input type="checkbox" id="cs-동의2" style="margin-top:6px;width:18px;height:18px;flex:none"><span><b>(필수)</b> 첫 피드백을 받은 뒤에는 환불이 어렵다는 것을 확인했어요.</span></label></div>
  <p class="작은" id="cs-알림" hidden style="color:#c0392b"></p>
  <button type="button" class="단추 주 cs-큰단추" id="cs-결제하기">100,000원 결제하기</button>
  <p class="작은" style="margin-top:12px">카드번호는 토스페이먼츠가 처리하고 이 사이트에는 저장되지 않아요.</p>
</section>
<script src="https://js.tosspayments.com/v2/standard"></script>
<script>(function(){var A=window.AC;if(!A)return;var 키=${JSON.stringify(토스키)};
var 알림=document.getElementById('cs-알림'),버튼=document.getElementById('cs-결제하기');
function 알려(t){알림.textContent=t;알림.hidden=!t}
if(!A.tok()){try{sessionStorage.setItem('ac_next','/consulting/pay/')}catch(e){}location.replace(A.base+'/login/');return}
A.api('/consulting/me').then(function(j){if(j._s===401)return;if(j.있음){location.replace(A.base+'/consulting/me/');return}if(j.결제열림===false){버튼.disabled=true;버튼.textContent='결제 준비 중이에요'}});
버튼.addEventListener('click',async function(){
 알려('');
 if(!document.getElementById('cs-동의1').checked||!document.getElementById('cs-동의2').checked){알려('두 가지 동의에 모두 체크해 주세요.');return}
 if(!키||typeof TossPayments==='undefined'){알려('결제창을 불러오지 못했어요. 잠시 뒤 다시 해 주세요.');return}
 버튼.disabled=true;
 try{
  var 주문=await A.api('/consulting/pay/order',{method:'POST'});
  if(!주문||!주문.주문번호){버튼.disabled=false;if(주문&&주문._s===409){location.replace(A.base+'/consulting/me/');return}알려((주문&&주문.오류)||'주문을 만들지 못했어요.');return}
  var 나=await A.api('/me');
  var 결제=TossPayments(키).payment({customerKey:TossPayments.ANONYMOUS});
  await 결제.requestPayment({method:'CARD',amount:{currency:'KRW',value:주문.금액},orderId:주문.주문번호,orderName:주문.상품이름,
   successUrl:location.origin+A.base+'/consulting/pay/done/',failUrl:location.origin+A.base+'/consulting/pay/fail/'});
 }catch(e){버튼.disabled=false;if(e&&e.code!=='USER_CANCEL')알려('결제창을 열지 못했어요: '+(e.message||e.code||''))}
});})();</script>`;
  const 완료본문 = `<section class="일반글 cs-글">
  <span class="윗글">컨설팅</span>
  <h1 id="cs-제목">결제를 확인하고 있어요…</h1>
  <p id="cs-말">잠시만 기다려 주세요. 이 화면을 닫지 마세요.</p>
  <div class="ms-줄" style="display:flex;gap:10px;margin-top:18px"><a class="단추 주" id="cs-이동" href="${길('/consulting/me/')}" hidden>질문지 시작하기</a></div>
</section>
<script>(function(){var A=window.AC;if(!A)return;
var q=new URLSearchParams(location.search),제목=document.getElementById('cs-제목'),말=document.getElementById('cs-말'),이동=document.getElementById('cs-이동');
function 실패(t){제목.textContent='결제를 확인하지 못했어요';말.textContent=t||'잠시 뒤 다시 해 주세요.';}
if(!A.tok()){try{sessionStorage.setItem('ac_next',location.pathname+location.search)}catch(e){}location.replace(A.base+'/login/');return}
var 키=q.get('paymentKey'),주문=q.get('orderId'),금액=Number(q.get('amount'));
if(!키||!주문||!금액){실패('결제 정보가 없어요.');return}
A.api('/consulting/pay/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({paymentKey:키,orderId:주문,amount:금액})}).then(function(r){
 if(r&&r.결제완료){제목.textContent='결제가 완료됐어요';말.textContent='이제 질문지를 시작할 수 있어요. 쓰는 내용은 자동으로 저장돼요.';이동.hidden=false;return}
 실패((r&&r.오류)||'');
},function(){실패('연결하지 못했어요. 결제 금액이 나갔다면 잠시 뒤 이 화면을 새로고침해 주세요.')});})();</script>`;
  const 실패본문 = `<section class="일반글 cs-글">
  <span class="윗글">컨설팅</span>
  <h1>결제가 끝나지 않았어요</h1>
  <p id="cs-사유">결제를 마치지 못했어요. 금액은 청구되지 않았어요.</p>
  <p><a class="단추 주" href="${길('/consulting/pay/')}">다시 결제하기</a> <a class="단추 약함" href="${길('/consulting/')}">컨설팅 안내로</a></p>
</section>
<script>(function(){var m=new URLSearchParams(location.search).get('message');if(m)document.getElementById('cs-사유').textContent='결제를 마치지 못했어요: '+m+' (금액은 청구되지 않았어요)'})();</script>`;
  const 판매스타일 = fs.readFileSync(path.join(__dirname, '홈화면', '컨설팅.css'), 'utf8');
  const 판매본문 = fs.readFileSync(path.join(__dirname, '홈화면', '컨설팅.html'), 'utf8').replace(/\{\{BASE\}\}/g, 길(''));
  const 만들기 = () => {
    // 판매 페이지(누구나 볼 수 있음)와, 결제한 사람이 쓰는 질문지 화면(로그인 필요)을 나눈다
    쓰기('consulting/index.html', 틀({ 제목: '지원사업 컨설팅 · 아티스트 코치', 설명: '지원사업에 도전하기 전, 내 방향부터 잡아 보는 서면 컨설팅. 질문에 답하면 코치 영감이 전체 답변을 종합해 피드백을 드려요.', 경로: '/consulting/', 현재: '컨설팅', 본문: 판매본문, 색인: false }));
    쓰기('consulting/pay/index.html', 틀({ 제목: '컨설팅 신청 · 아티스트 코치', 설명: '지원사업 컨설팅 결제', 경로: '/consulting/pay/', 현재: '컨설팅', 본문: 결제본문, 색인: false }));
    쓰기('consulting/pay/done/index.html', 틀({ 제목: '컨설팅 결제 확인 · 아티스트 코치', 설명: '지원사업 컨설팅 결제 확인', 경로: '/consulting/pay/done/', 현재: '컨설팅', 본문: 완료본문, 색인: false }));
    쓰기('consulting/pay/fail/index.html', 틀({ 제목: '컨설팅 결제 · 아티스트 코치', 설명: '지원사업 컨설팅 결제', 경로: '/consulting/pay/fail/', 현재: '컨설팅', 본문: 실패본문, 색인: false }));
    쓰기('consulting/me/index.html', 틀({ 제목: '내 컨설팅 · 아티스트 코치', 설명: '지원사업 컨설팅 질문지', 경로: '/consulting/me/', 현재: '커뮤니티', 본문, 색인: false }));
  };
  return { 스타일: 스타일 + '\n' + 판매스타일, 만들기 };
};
