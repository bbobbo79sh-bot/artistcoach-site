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
  const 키 = /^(test|live)_(gck|ck)_[A-Za-z0-9_]+$/.test(설정.토스클라이언트키 || '') ? 설정.토스클라이언트키 : '';
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
    제목: '상품 · 아티스트 코치', 설명: '아티스트 코치의 유료 서비스', 경로: '/products/',
    본문: `<section class="일반글">
  <span class="윗글">상품</span>
  <h1>아티스트 코치 서비스</h1>
  <div class="상품목록">${설정.상품.map((p) => `<a class="상품카드" href="${길(`/products/${p.id}/`)}">${이미지주소(p) ? `<img src="${이미지주소(p)}" alt="${막기(p.이름)} 표지" width="800" height="1000">` : ''}<b>${막기(p.이름)}</b><span>${막기(p.한줄)}</span><em>${원(p.가격)}</em></a>`).join('')}</div>
  <p class="작은">결제 전에 <a href="${길('/refund/')}">환불 규정</a>과 <a href="${길('/terms/')}">이용약관</a>을 확인해 주세요.</p>
</section>`,
  }));

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
      본문: `<article class="일반글 상품상세">
  <span class="윗글">상품</span>
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

  // ── 결제 결과 (검색에 나오지 않게 noindex)
  const 성공스크립트 = `<script>
(function(){
  var q=new URLSearchParams(location.search), 서버=${JSON.stringify(서버)}, 상자=document.getElementById('결과');
  var 키=q.get('paymentKey'), 주문=q.get('orderId'), 금액=q.get('amount');
  if(!키||!주문||!금액){상자.textContent='결제 정보를 찾을 수 없어요.';return}
  if(!서버){상자.innerHTML='결제창 연결 시험 화면입니다. 결제 승인 확인 서버가 아직 연결되지 않았습니다.<br>주문번호: '+주문.replace(/[<>&"]/g,'')+' · 금액: '+Number(금액).toLocaleString('ko-KR')+'원';return}
  fetch(서버,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({paymentKey:키,orderId:주문,amount:Number(금액)})})
    .then(function(r){return r.json()}).then(function(d){
      상자.textContent=d&&d.ok?'결제가 완료되었어요. 입력하신 이메일로 안내드릴게요.':'결제 확인에 실패했어요. 문의해 주세요.'})
    .catch(function(){상자.textContent='결제 확인 중 오류가 났어요. 문의해 주세요.'});
})();
</script>`;
  쓰기('pay/success/index.html', 틀({ 제목: '결제 결과 · 아티스트 코치', 설명: '결제 결과', 경로: '/pay/success/', 색인: false, 스크립트: 성공스크립트,
    본문: `<section class="일반글"><h1>결제 결과</h1><p id="결과">확인 중이에요…</p><a class="단추 주" href="${길('/')}">처음으로</a></section>` }));
  쓰기('pay/fail/index.html', 틀({ 제목: '결제 실패 · 아티스트 코치', 설명: '결제 실패', 경로: '/pay/fail/', 색인: false,
    본문: `<section class="일반글"><h1>결제가 완료되지 않았어요</h1><p>결제가 취소되었거나 실패했어요. 다시 시도해 주세요.</p><a class="단추 주" href="${길('/products/')}">상품으로 돌아가기</a></section>` }));

  return { 경로목록 };
};
