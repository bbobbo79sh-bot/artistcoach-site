// 상품 목록·상품 상세·결제 결과 페이지를 만든다 (자료/상품.json 의 '사용'이 true 일 때만).
// 토스페이먼츠 결제창(v2)을 열기만 한다. 결제 승인(확인)은 서버가 비밀 키로 해야 하므로
// '승인확인서버' 주소가 있을 때만 결제 결과 페이지가 그 서버로 확인을 요청한다.
// ※ 비밀 키는 이 사이트 어디에도 두지 않는다 (공개 저장소).

const fs = require('fs');
const path = require('path');

module.exports = ({ 설정: 원설정, 뿌리, 결과, 틀, 길, 막기, 쓰기, 사업자 }) => {
  let 설정 = 원설정;
  const 팔것 = (설정.상품 || []).filter((p) => Number(p.가격) > 0);   // 가격이 정해지지 않은 상품은 만들지 않는다
  if (!설정.사용 || !팔것.length) return { 경로목록: [] };
  설정 = { ...설정, 상품: 팔것 };
  const 원 = (n) => Number(n).toLocaleString('ko-KR') + '원';
  // 검수 사이트(SITE_STAGING)는 시험 키, 진짜 사이트는 라이브 키(있을 때)로 결제창을 연다. 서버도 같은 기준으로 비밀 키를 고른다.
  const 고른키 = process.env.SITE_STAGING === '1' ? 설정.토스클라이언트키 : (설정.라이브클라이언트키 || 설정.토스클라이언트키);
  const 키 = /^(test|live)_(gck|ck)_[A-Za-z0-9_]+$/.test(고른키 || '') ? 고른키 : '';
  const 서버 = /^https:\/\/[\w.\-/]+$/.test(설정.승인확인서버 || '') ? 설정.승인확인서버 : '';
  const 경로목록 = ['/products/'];

  // 상품 이미지(표지)는 자료/상품/ 에서 결과 폴더로 복사한다. 파일 이름은 영문·숫자·한글·점·하이픈만 허용.
  const 이미지주소 = (p) => (p.이미지 && /^[A-Za-z0-9_.\-가-힣]+$/.test(p.이미지) && fs.existsSync(path.join(뿌리, '자료', '상품', p.이미지)))
    ? 길('/products/img/' + encodeURI(p.이미지)) : '';
  설정.상품.forEach((p) => {
    if (!이미지주소(p)) return;
    fs.mkdirSync(path.join(결과, 'products', 'img'), { recursive: true });
    fs.copyFileSync(path.join(뿌리, '자료', '상품', p.이미지), path.join(결과, 'products', 'img', p.이미지));
  });

  // ── 상품 목록
  쓰기('products/index.html', 틀({
    제목: '스토어 · 아티스트 코치', 설명: '아티스트 코치의 유료 서비스', 경로: '/products/',
    본문: `<section class="일반글">
  <span class="윗글">스토어</span>
  <h1>아티스트 코치 서비스</h1>
  <div class="상품목록">${설정.상품.filter((p) => !p.목록숨김).map((p) => `<a class="상품카드" href="${길(`/products/${p.id}/`)}">${이미지주소(p) ? `<img src="${이미지주소(p)}" alt="${막기(p.이름)} 표지" width="800" height="1000">` : ''}<b>${막기(p.이름)}</b><span>${막기(p.한줄)}</span><em>${원(p.가격)}</em></a>`).join('')}</div>
  <p class="작은">결제 전에 <a href="${길('/refund/')}">환불 규정</a>과 <a href="${길('/terms/')}">이용약관</a>을 확인해 주세요.</p>
</section>`,
  }));

  // ── 책 상품(소개글·목차·도서 정보·미리보기·구매 안내가 있는 상세 페이지)
  const { 변환 } = require('./마크다운.js')({ 막기, 길 });
  const 글읽기 = (폴더, 파일) => { const f = path.join(뿌리, '자료', '상품', 폴더, 파일 || ''); return (파일 && /^[A-Za-z0-9_.\-]+$/.test(파일) && fs.existsSync(f)) ? 변환(fs.readFileSync(f, 'utf8')) : null; };
  const 구매폼 = (p) => `<form class="구매폼" onsubmit="return false">
    <label>이름<input id="구매자이름" autocomplete="name"></label>
    <label>이메일<input id="구매자메일" type="email" autocomplete="email"></label>
    <label>연락처<input id="구매자전화" type="tel" autocomplete="tel" placeholder="휴대전화 번호"></label>
    <label class="동의"><input id="동의약관" type="checkbox"> <a href="${길('/terms/')}" target="_blank">이용약관</a>에 동의합니다.</label>
    <label class="동의"><input id="동의환불" type="checkbox"> <a href="${길('/refund/')}" target="_blank">환불 규정</a>을 확인했고, 디지털 콘텐츠는 내려받은 뒤에는 청약철회가 제한될 수 있음을 확인했습니다.</label>
    <p id="결제알림" class="결제알림" role="alert" hidden></p>
    <button id="결제버튼" class="단추 주" type="button">${원(p.가격)} 결제하기</button>
  </form>`;
  const 책본문 = (p) => {
    const 소개 = 글읽기('소개', p.소개글);
    const 미리 = 글읽기('미리보기', p.미리보기);
    const 정보 = [['서명', p.이름], ['부제', p.부제], ['지은이', p.저자], ['펴낸곳', p.발행처], ['형태', p.형태 + (p.쪽수 ? ' · ' + p.쪽수 : '')], ['ISBN', p.isbn], ['펴낸날', p.펴낸날], ['정가', 원(p.가격)]].filter((x) => x[1]);
    return `<article class="일반글 상품상세 책상세">
  <span class="윗글">스토어 · 전자책</span>
  <div class="책머리">
    ${이미지주소(p) ? `<img class="상품이미지" src="${이미지주소(p)}" alt="${막기(p.이름)} 표지" width="700" height="1000">` : ''}
    <div class="책머리글">
      <h1>${막기(p.이름)}</h1>
      ${p.부제 ? `<p class="부제">${막기(p.부제)}</p>` : ''}
      <p class="저자줄">${막기(p.저자 || '')}${p.발행처 ? ' · ' + 막기(p.발행처) : ''}</p>
      <p class="가격">${원(p.가격)}</p>
      <p class="작은">PDF 전자책 · 결제 후 바로 내려받기 · 회원가입 없이 구매</p>
      <p class="책단추"><a class="단추 주" href="#구매하기">구매하기</a>${미리 ? ` <a class="단추" href="${길(`/products/${p.id}/preview/`)}">미리 읽어 보기 (무료)</a>` : ''}</p>
    </div>
  </div>
  ${소개 ? `<section class="글카드 책소개">${소개.본문}</section>` : ''}
  ${p.목차 && p.목차.length ? `<section class="글카드"><h2>목차 한눈에</h2><ol class="책목차">${p.목차.map((m) => `<li><b>${막기(m[0])}</b><span>${막기(m[1])}</span></li>`).join('')}</ol></section>` : ''}
  <section class="글카드"><h2>도서 정보</h2><dl class="정보">${정보.map((x) => `<div><dt>${막기(x[0])}</dt><dd>${막기(x[1])}</dd></div>`).join('')}</dl></section>
  <section class="글카드"><h2>구매 안내</h2>
    <dl class="정보">
      <div><dt>받는 방법</dt><dd>${막기(p.제공방법)}. 인쇄본과 배송은 없어요.</dd></div>
      <div><dt>받는 시기</dt><dd>${막기(p.제공기간)}</dd></div>
      <div><dt>다시 받기</dt><dd>링크를 잃어버렸다면 <a href="${길('/pay/retrieve/')}">다시 받기</a>에서 결제할 때 적은 이메일과 휴대전화 번호 뒤 4자리로 새 링크를 받을 수 있어요.</dd></div>
      <div><dt>환불</dt><dd>${막기(p.환불가능기간)} · <a href="${길('/refund/')}">환불 규정 보기</a></dd></div>
      <div><dt>문의</dt><dd>${막기(사업자.이메일 || '')}</dd></div>
      <div><dt>이용 범위</dt><dd>구매하신 분 개인이 읽고 쓰는 용도로만 사용해 주세요. 복제·전송·다시 판매는 저작권법으로 금지돼 있어요.</dd></div>
    </dl>
  </section>
  <section class="글카드" id="구매하기"><h2>구매하기 (회원가입 없이 구매할 수 있어요)</h2>
  ${구매폼(p)}
  <p class="작은">결제는 토스페이먼츠 결제창에서 진행되며, 카드번호는 운영자가 저장하지 않습니다. 개인정보는 <a href="${길('/privacy/')}">개인정보처리방침</a>에 따라 처리합니다.</p>
  </section>
  <p class="작은">${막기(사업자.상호)} · 대표 ${막기(사업자.대표자)} · 사업자등록번호 ${막기(사업자.사업자등록번호)} · 통신판매업 신고번호 ${막기(사업자.통신판매업신고)}</p>
</article>`;
  };

  // ── 상품 상세 (비회원 구매)
  설정.상품.forEach((p) => {
    경로목록.push(`/products/${p.id}/`);
    const 스크립트 = `<script src="https://js.tosspayments.com/v2/standard"></script>
<script>
(function(){
  var 키=${JSON.stringify(키)}, 금액=${Number(p.가격)}, 이름=${JSON.stringify(p.이름)}, 기준=${JSON.stringify(길(''))};
  var 버튼=document.getElementById('결제버튼'), 알림=document.getElementById('결제알림');
  function 알려(t){알림.textContent=t;알림.hidden=!t}
  버튼.addEventListener('click',async function(){
    알려('');
    var 이름값=document.getElementById('구매자이름').value.trim(), 메일=document.getElementById('구매자메일').value.trim(), 전화=document.getElementById('구매자전화').value.replace(/[^0-9]/g,'');
    if(!이름값||!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(메일)||전화.length<9){알려('이름, 이메일, 연락처를 정확히 적어 주세요.');return}
    if(!document.getElementById('동의약관').checked||!document.getElementById('동의환불').checked){알려('이용약관과 환불 규정에 동의해 주세요.');return}
    if(!키||typeof TossPayments==='undefined'){alert('결제 준비 중입니다.');return}
    try{
      var 주문='ac'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);
      try{localStorage.setItem('acBuyer',JSON.stringify({o:주문,e:메일,p:전화,t:Date.now()}))}catch(_){}   // 결제 확인 때 다시 받기용으로 쓰고 바로 지운다(주소에는 넣지 않는다. 결제창이 다른 창으로 돌아와도 읽도록 localStorage)
      var 결제=TossPayments(키).payment({customerKey:TossPayments.ANONYMOUS});
      await 결제.requestPayment({method:'CARD',amount:{currency:'KRW',value:금액},orderId:주문,orderName:이름,
        successUrl:location.origin+기준+'/pay/success/',failUrl:location.origin+기준+'/pay/fail/',
        customerName:이름값,customerEmail:메일,customerMobilePhone:전화});
    }catch(e){if(e&&e.code!=='USER_CANCEL')알려('결제창을 열지 못했어요: '+(e.message||e.code||''))}
  });
})();
</script>`;
    쓰기(`products/${p.id}/index.html`, 틀({
      제목: `${p.이름} · 아티스트 코치`, 설명: p.한줄, 경로: `/products/${p.id}/`, 스크립트,
      본문: p.소개글 ? 책본문(p) : `<article class="일반글 상품상세">
  <span class="윗글">스토어</span>
  <h1>${막기(p.이름)}</h1>
  ${이미지주소(p) ? `<img class="상품이미지" src="${이미지주소(p)}" alt="${막기(p.이름)} 표지" width="800" height="1000">` : ''}
  <p class="가격">${원(p.가격)}</p>
  <p>${막기(p.한줄)}</p>
  ${p.설명.map((t) => `<p>${막기(t)}</p>`).join('')}
  <dl class="정보">
    <div><dt>제공 방법</dt><dd>${막기(p.제공방법 || '이메일 전달 (배송 없음)')}</dd></div>
    <div><dt>제공 기간</dt><dd>${막기(p.제공기간)}</dd></div>
    <div><dt>환불 가능 기간</dt><dd>${막기(p.환불가능기간)} · <a href="${길('/refund/')}">환불 규정 보기</a></dd></div>
  </dl>
  <h2>구매하기 (회원가입 없이 구매할 수 있어요)</h2>
  <form class="구매폼" onsubmit="return false">
    <label>이름<input id="구매자이름" autocomplete="name"></label>
    <label>이메일<input id="구매자메일" type="email" autocomplete="email"></label>
    <label>연락처<input id="구매자전화" type="tel" autocomplete="tel" placeholder="휴대전화 번호"></label>
    <label class="동의"><input id="동의약관" type="checkbox"> <a href="${길('/terms/')}" target="_blank">이용약관</a>에 동의합니다.</label>
    <label class="동의"><input id="동의환불" type="checkbox"> <a href="${길('/refund/')}" target="_blank">환불 규정</a>을 확인했고, 디지털 콘텐츠는 내려받은 뒤에는 청약철회가 제한될 수 있음을 확인했습니다.</label>
    <p id="결제알림" class="결제알림" role="alert" hidden></p>
    <button id="결제버튼" class="단추 주" type="button">${원(p.가격)} 결제하기</button>
  </form>
  <p class="작은">결제는 토스페이먼츠 결제창에서 진행되며, 카드번호는 운영자가 저장하지 않습니다. 개인정보는 <a href="${길('/privacy/')}">개인정보처리방침</a>에 따라 처리합니다.</p>
  <p class="작은">${막기(사업자.상호)} · 대표 ${막기(사업자.대표자)} · 사업자등록번호 ${막기(사업자.사업자등록번호)} · 통신판매업 신고번호 ${막기(사업자.통신판매업신고)}</p>
</article>`,
    }));
  });

  // ── 책 미리 읽기(머리말·0장 일부, 글로 공개)
  설정.상품.forEach((p) => {
    const 미리 = p.소개글 && 글읽기('미리보기', p.미리보기);
    if (!미리) return;
    경로목록.push(`/products/${p.id}/preview/`);
    쓰기(`products/${p.id}/preview/index.html`, 틀({
      제목: `미리 읽기 · ${p.이름} · 아티스트 코치`, 설명: `${p.이름} — 머리말과 0장 '시작하기 전에'를 먼저 읽어 보세요.`, 경로: `/products/${p.id}/preview/`,
      본문: `<article class="일반글 글본문 자료글">
  <header class="자료영웅"><div class="영웅글"><span class="윗글">무료 미리 읽기</span><h1>${막기(p.이름)}</h1><p class="리드">머리말과 0장 '시작하기 전에'를 먼저 읽어 보세요. 이어지는 1~6장과 부록은 전자책에서 만나요.</p></div>${이미지주소(p) ? `<img src="${이미지주소(p)}" alt="${막기(p.이름)} 표지" width="140" height="200">` : ''}</header>
  ${미리.본문.replace(/<h2>/g, '<h2 class="미리소제목">')}
  <section class="글카드"><p><b>이어서 읽고 싶으시다면</b> 1장부터 부록까지 147쪽의 전체 내용은 전자책에서 볼 수 있어요.</p><p><a class="단추 주" href="${길(`/products/${p.id}/`)}">전자책 보러 가기</a> <a class="단추" href="${길('/resources/')}">무료 자료실</a></p></section>
  <p class="작은">책 내용은 저작권법의 보호를 받습니다. 복제·전송·다시 판매할 수 없습니다.</p>
</article>`,
    }));
  });

  // ── 결제 결과 (검색에 나오지 않게 noindex)
  const 성공스크립트 = `<script>
(function(){
  var q=new URLSearchParams(location.search), 서버=${JSON.stringify(서버)}, 상자=document.getElementById('결과');
  var 키=q.get('paymentKey'), 주문=q.get('orderId'), 금액=q.get('amount');
  if(!키||!주문||!금액){상자.textContent='결제 정보를 찾을 수 없어요.';return}
  if(!서버){상자.innerHTML='결제창 연결 시험 화면입니다. 결제 승인 확인 서버가 아직 연결되지 않았습니다.<br>주문번호: '+주문.replace(/[<>&"]/g,'')+' · 금액: '+Number(금액).toLocaleString('ko-KR')+'원';return}
  var 구매자={}; try{var s=JSON.parse(localStorage.getItem('acBuyer')||'{}'); if(s.o===주문&&Date.now()-(s.t||0)<3600000)구매자=s; localStorage.removeItem('acBuyer')}catch(_){}
  fetch(서버+'/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({paymentKey:키,orderId:주문,amount:Number(금액),email:구매자.e||'',phone:구매자.p||''})})
    .then(function(r){return r.json()}).then(function(d){
      if(d&&d.ok&&d.주소){
        상자.textContent='결제가 완료되었어요. 감사합니다! 아래 버튼으로 전자책을 바로 내려받을 수 있어요.';
        var 줄=document.getElementById('받기줄'), a=document.createElement('a');
        a.className='단추 주'; a.href=d.주소; a.textContent='전자책 PDF 내려받기';
        줄.insertBefore(a,줄.firstChild); 줄.hidden=false;
        document.getElementById('받기안내').hidden=false;
      }else{상자.textContent='결제 확인에 실패했어요. 결제가 됐는데도 이 문구가 보이면 문의해 주세요.'}})
    .catch(function(){상자.textContent='결제 확인 중 오류가 났어요. 이 화면을 닫지 말고 문의해 주세요.'});
})();
</script>`;
  쓰기('pay/success/index.html', 틀({ 제목: '결제 결과 · 아티스트 코치', 설명: '결제 결과', 경로: '/pay/success/', 색인: false, 스크립트: 성공스크립트,
    본문: `<section class="일반글"><h1>결제 결과</h1><p id="결과">확인 중이에요…</p>
  <p id="받기줄" class="책단추" hidden><a class="단추" href="${길('/')}">처음으로</a></p>
  <p id="받기안내" class="작은" hidden>링크는 24시간 동안 쓸 수 있어요. 이 화면을 닫아도 <a href="${길('/pay/retrieve/')}">다시 받기</a>에서 결제할 때 적은 이메일과 휴대전화 번호 뒤 4자리로 새 링크를 받을 수 있어요. 구매하신 책은 개인이 읽고 쓰는 용도로만 사용해 주세요.</p></section>` }));

  // ── 다시 받기 (이메일 + 휴대전화 번호 뒤 4자리)
  const 다시스크립트 = `<script>
(function(){
  var 서버=${JSON.stringify(서버)}, 폼=document.getElementById('다시폼'), 알림=document.getElementById('다시알림'), 결과=document.getElementById('다시결과');
  폼.addEventListener('submit',function(e){
    e.preventDefault(); 알림.hidden=true; 결과.hidden=true;
    var 메일=document.getElementById('다시메일').value.trim(), 뒤=document.getElementById('다시뒤4').value.replace(/[^0-9]/g,'');
    if(!서버){알림.textContent='아직 준비 중이에요.';알림.hidden=false;return}
    fetch(서버+'/lookup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:메일,last4:뒤})})
      .then(function(r){return r.json()}).then(function(d){
        if(d&&d.ok&&d.주소){
          결과.textContent='';
          var a=document.createElement('a'); a.className='단추 주'; a.href=d.주소; a.textContent='전자책 PDF 내려받기';
          결과.appendChild(a); 결과.hidden=false;
        }else{알림.textContent=(d&&d.error)||'구매 내역을 찾지 못했어요.';알림.hidden=false}})
      .catch(function(){알림.textContent='확인 중 오류가 났어요. 잠시 뒤 다시 해 주세요.';알림.hidden=false});
  });
})();
</script>`;
  쓰기('pay/retrieve/index.html', 틀({ 제목: '전자책 다시 받기 · 아티스트 코치', 설명: '구매한 전자책 다시 받기', 경로: '/pay/retrieve/', 색인: false, 스크립트: 다시스크립트,
    본문: `<section class="일반글"><span class="윗글">스토어</span><h1>전자책 다시 받기</h1>
  <p>결제할 때 적으신 <b>이메일</b>과 <b>휴대전화 번호 뒤 4자리</b>를 넣으면 새 다운로드 링크를 드려요. 링크는 24시간 동안 쓸 수 있어요.</p>
  <form id="다시폼" class="구매폼">
    <label>이메일<input id="다시메일" type="email" autocomplete="email" required></label>
    <label>휴대전화 번호 뒤 4자리<input id="다시뒤4" inputmode="numeric" maxlength="4" autocomplete="off" required></label>
    <p id="다시알림" class="결제알림" role="alert" hidden></p>
    <button class="단추 주" type="submit">새 링크 받기</button>
  </form>
  <p id="다시결과" class="책단추" hidden></p>
  <p class="작은">찾지 못하시면 ${막기(사업자.이메일 || '')} 로 문의해 주세요.</p></section>` }));
  쓰기('pay/fail/index.html', 틀({ 제목: '결제 실패 · 아티스트 코치', 설명: '결제 실패', 경로: '/pay/fail/', 색인: false,
    본문: `<section class="일반글"><h1>결제가 완료되지 않았어요</h1><p>결제가 취소되었거나 실패했어요. 다시 시도해 주세요.</p><a class="단추 주" href="${길('/products/')}">상품으로 돌아가기</a></section>` }));

  return { 경로목록 };
};
