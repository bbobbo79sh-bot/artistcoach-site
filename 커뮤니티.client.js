// 커뮤니티 화면 (브라우저에서 돈다). 로그인 서버(window.AC.api)와 이야기한다. 사용자가 쓴 글은 항상 textContent 로만 넣는다.
// 주소 모양: /community/#free  #view/free/<번호>  #write/free  #ask  #view/ask/<번호>  #admin  #admin/ask/<번호>
(function () {
  var A = window.AC, root = document.getElementById('커뮤니티');
  if (!A || !root) return;
  var 판이름 = { notice: '공지', free: '자유게시판', review: '합격·후기' };
  var 판순서 = ['notice', 'free', 'ask', 'review'];
  var me = null, 번호표 = 0;

  function h(tag, attr, kids) {
    var e = document.createElement(tag);
    if (attr) for (var k in attr) { if (k === 'text') e.textContent = attr[k]; else if (k === 'class') e.className = attr[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attr[k]); else if (attr[k] !== false && attr[k] != null) e.setAttribute(k, attr[k]); }
    (kids || []).forEach(function (c) { if (c == null) return; e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function 날짜(s) {
    var d = new Date(s); if (isNaN(d)) return '';
    var n = new Date(), 같은날 = d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
    var p = function (x) { return (x < 10 ? '0' : '') + x };
    return 같은날 ? p(d.getHours()) + ':' + p(d.getMinutes()) : (d.getMonth() + 1) + '.' + d.getDate();
  }
  function 긴날짜(s) { var d = new Date(s); if (isNaN(d)) return ''; var p = function (x) { return (x < 10 ? '0' : '') + x }; return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); }
  function 비우기() { root.innerHTML = ''; window.scrollTo(0, 0); }
  function 가기(해시) { if (location.hash === '#' + 해시) route(); else location.hash = 해시; }
  function 안내(글, 종류) { return h('p', { class: 'cm-안내 ' + (종류 || ''), text: 글 }); }

  // ── 로그인 안 했을 때 ──────────────────────────────
  function 문닫힘() {
    root.innerHTML = '';
    root.appendChild(h('section', { class: 'cm-문' }, [
      h('span', { class: 'cm-윗글', text: '커뮤니티' }),
      h('h1', { text: '로그인하면 들어올 수 있어요' }),
      h('p', { text: '공지, 자유게시판, 합격·후기, 그리고 영감에게 직접 묻는 비공개 질문하기까지 — 모두 로그인한 분들만 볼 수 있는 공간이에요.' }),
      h('p', { class: '작은', text: '구글이나 카카오 계정으로 로그인해요. 비밀번호는 받지 않고, 게시판에는 직접 정한 별명만 보여요.' }),
      h('a', { class: '단추 주', href: A.base + '/login/', text: '로그인하러 가기', onclick: function () { try { sessionStorage.setItem('ac_next', location.pathname) } catch (e) { } } })
    ]));
  }

  // ── 위쪽 탭 ────────────────────────────────────────
  function 탭(현재) {
    var 줄 = h('div', { class: '게시판바' });
    var 탭줄 = h('div', { class: '탭줄', role: 'tablist' });
    판순서.forEach(function (b) {
      var 글 = b === 'ask' ? '질문하기 🔒' : 판이름[b];
      탭줄.appendChild(h('button', { type: 'button', 'aria-pressed': b === 현재 ? 'true' : 'false', text: 글, onclick: function () { 가기(b) } }));
    });
    if (me && me.관리자) 탭줄.appendChild(h('button', { type: 'button', 'aria-pressed': 현재 === 'admin' ? 'true' : 'false', text: '운영', onclick: function () { 가기('admin') } }));
    줄.appendChild(탭줄);
    var 내 = h('p', { class: 'cm-내별명 작은' });
    if (me && me.별명) { 내.appendChild(document.createTextNode('내 별명 ')); 내.appendChild(h('b', { text: me.별명 })); 내.appendChild(document.createTextNode(' · ')); 내.appendChild(h('a', { href: '#', text: '바꾸기', onclick: function (e) { e.preventDefault(); 별명창(function () { route() }) } })); }
    else 내.appendChild(h('a', { href: '#', text: '별명 정하기', onclick: function (e) { e.preventDefault(); 별명창(function () { route() }) } }));
    줄.appendChild(내);
    return 줄;
  }
  function 머리(현재) {
    root.appendChild(h('div', { class: '게시판' }, [h('h1', { text: '커뮤니티' }), h('p', { class: '소개', text: '예술지원사업을 준비하는 분들의 이야기 공간이에요. 로그인한 분만 보고 쓸 수 있어요.' })]));
    root.appendChild(탭(현재));
  }

  // ── 별명 ──────────────────────────────────────────
  function 별명창(끝난뒤, 먼저) {
    var 칸 = h('input', { type: 'text', maxlength: '12', value: (me && me.별명) || '', placeholder: '예) 무용하는 가나', 'aria-label': '별명' });
    var 오류 = h('p', { class: 'cm-오류 작은', hidden: 'hidden' });
    var 박스 = h('div', { class: 'cm-별명창' }, [
      h('b', { text: '게시판에서 쓸 별명을 정해 주세요' }),
      h('p', { class: '작은', text: '구글·카카오 이름은 밖에 보이지 않아요. 2~12자, 한글·영문·숫자만 쓸 수 있고 언제든 바꿀 수 있어요.' }),
      칸, 오류,
      h('div', { class: 'cm-줄' }, [
        h('button', { type: 'button', class: '단추 주', text: '저장', onclick: function () {
          var v = 칸.value.trim();
          A.api('/me/nick', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ 별명: v }) }).then(function (j) {
            if (j.별명) { me.별명 = j.별명; 박스.remove(); 끝난뒤 && 끝난뒤(); } else { 오류.textContent = j.오류 || '저장하지 못했어요'; 오류.hidden = false; }
          });
        } }),
        h('button', { type: 'button', class: '단추 약함', text: '닫기', onclick: function () { 박스.remove(); } })
      ])
    ]);
    var 옛 = root.querySelector('.cm-별명창'); if (옛) 옛.remove();
    root.insertBefore(박스, root.children[2] || null);
    칸.focus();
  }

  // ── 글 목록 ────────────────────────────────────────
  function 목록(판, 다음, 표) {
    var 처음 = !표;
    if (처음) { 비우기(); 머리(판); 표 = h('div', { class: '게시판목록' }, [h('div', { class: '행 머리줄' }, [h('span', { class: '번호', text: '번호' }), h('span', { class: '분류', text: '분류' }), h('span', { class: '제목', text: '제목' }), h('span', { class: '날짜', text: '날짜' })])]); }
    var 쓰기줄 = null, 더 = null;
    if (처음) { 번호표 = 0; root.appendChild(h('p', { class: '건수줄', id: 'cm-건수', text: '불러오는 중…' })); root.appendChild(표); }
    A.api('/community/' + 판 + (다음 ? '?다음=' + encodeURIComponent(다음) : '')).then(function (j) {
      if (j._s === 401) { 문닫힘(); return; }
      var 건수 = document.getElementById('cm-건수');
      (j.글 || []).forEach(function (x) {
        번호표++;
        표.appendChild(h('a', { class: '행' + (j.게시판 === 'notice' ? ' 공지행' : ''), href: '#view/' + 판 + '/' + x.id }, [
          h('span', { class: '번호', text: String(번호표) }),
          h('span', { class: '분류' + (x.운영 ? ' 공지분류' : ''), text: x.운영 ? '운영' : (x.말머리 || '글') }),
          h('span', { class: '제목' }, [h('b', { text: x.제목 + (x.댓글 ? '  [' + x.댓글 + ']' : '') }), h('small', { text: x.별명 })]),
          h('span', { class: '날짜', text: 날짜(x.시각) })
        ]));
      });
      var 옛더 = root.querySelector('.cm-더'); if (옛더) 옛더.remove();
      if (!번호표) { 건수.textContent = ''; 표.appendChild(h('p', { class: '없음글 작은', text: 판 === 'notice' ? '아직 공지가 없어요.' : '아직 글이 없어요. 첫 글을 남겨 보세요!' })); }
      else 건수.textContent = '글 ' + 번호표 + '개' + (j.다음 ? ' 이상' : '');
      if (j.다음) root.appendChild(h('div', { class: 'cm-더 쪽번호' }, [h('button', { type: 'button', text: '더 보기', onclick: function () { 목록(판, j.다음, 표) } })]));
      if (처음 && j.쓸수있음) root.insertBefore(h('div', { class: 'cm-쓰기줄' }, [h('button', { type: 'button', class: '단추 주', text: '글쓰기', onclick: function () { 가기('write/' + 판) } })]), document.getElementById('cm-건수'));
    }, function () { 오류화면(); });
  }

  function 오류화면() { root.appendChild(안내('서버에 연결하지 못했어요. 잠시 뒤 다시 해 주세요.', '오류')); }

  // ── 글 읽기 ────────────────────────────────────────
  function 읽기(판, id) {
    비우기(); 머리(판);
    var 칸 = h('div', { class: '노트글 cm-글' }, [h('p', { class: '작은', text: '불러오는 중…' })]); root.appendChild(칸);
    A.api('/community/' + 판 + '/' + id).then(function (j) {
      if (!j.글) { 칸.innerHTML = ''; 칸.appendChild(안내(j.오류 || '글을 찾지 못했어요')); 칸.appendChild(h('div', { class: '목록줄' }, [h('button', { type: 'button', class: '단추', text: '목록', onclick: function () { 가기(판) } })])); return; }
      var g = j.글; 칸.innerHTML = '';
      칸.appendChild(h('div', { class: '글머리' }, [
        h('span', { class: '분류표', text: g.운영 ? '운영' : (g.말머리 || g.이름) }),
        h('h1', { text: g.제목 }),
        h('div', { class: '글정보' }, [h('span', { text: g.별명 + (g.운영 ? ' (운영)' : '') }), h('span', { text: 긴날짜(g.시각) }), h('span', { text: '댓글 ' + j.댓글.length })])
      ]));
      칸.appendChild(h('div', { class: 'cm-본문', text: g.내용 }));
      var 줄 = h('div', { class: 'cm-줄 cm-글줄' });
      줄.appendChild(h('button', { type: 'button', class: '단추', text: '목록', onclick: function () { 가기(판) } }));
      if (j.지울수있음) 줄.appendChild(h('button', { type: 'button', class: '단추 약함', text: '지우기', onclick: function () { if (!confirm('이 글과 댓글을 지울까요? 되돌릴 수 없어요.')) return; A.api('/community/' + 판 + '/' + id, { method: 'DELETE' }).then(function () { 가기(판) }); } }));
      if (!g.내것) 줄.appendChild(h('button', { type: 'button', class: '단추 약함', text: '신고', onclick: function () { if (!confirm('이 글을 운영자에게 신고할까요?')) return; A.api('/community/' + 판 + '/' + id + '/report', { method: 'POST' }).then(function (r) { alert(r.신고 ? '신고했어요. 운영자가 확인할게요.' : (r.오류 || '신고하지 못했어요')); }); } }));
      칸.appendChild(줄);
      var 댓칸 = h('section', { class: 'cm-댓글' }, [h('h2', { text: '댓글 ' + j.댓글.length })]);
      j.댓글.forEach(function (c) {
        var 한 = h('div', { class: 'cm-댓' }, [h('div', { class: 'cm-댓머리' }, [h('b', { text: c.별명 + (c.운영 ? ' (운영)' : '') }), h('small', { text: 긴날짜(c.시각) })]), h('div', { class: 'cm-본문', text: c.내용 })]);
        if (c.내것 || j.지울수있음 && me.관리자) 한.querySelector('.cm-댓머리').appendChild(h('button', { type: 'button', class: 'cm-작은단추', text: '지우기', onclick: function () { if (!confirm('이 댓글을 지울까요?')) return; A.api('/community/' + 판 + '/' + id + '/comments/' + c.id, { method: 'DELETE' }).then(function () { 읽기(판, id) }); } }));
        댓칸.appendChild(한);
      });
      var 입력 = h('textarea', { rows: '3', maxlength: '500', placeholder: '댓글을 남겨 보세요 (500자까지)', 'aria-label': '댓글' });
      var 오류 = h('p', { class: 'cm-오류 작은', hidden: 'hidden' });
      function 보내기() {
        var v = 입력.value.trim(); if (!v) return;
        A.api('/community/' + 판 + '/' + id + '/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ 내용: v }) }).then(function (r) {
          if (r.별명필요) { 별명창(보내기); return; }
          if (r.id) 읽기(판, id); else { 오류.textContent = r.오류 || '남기지 못했어요'; 오류.hidden = false; }
        });
      }
      댓칸.appendChild(h('div', { class: 'cm-폼' }, [입력, 오류, h('div', { class: 'cm-줄' }, [h('button', { type: 'button', class: '단추 주', text: '댓글 남기기', onclick: 보내기 })])]));
      칸.appendChild(댓칸);
    }, 오류화면);
  }

  // ── 글쓰기 ─────────────────────────────────────────
  function 쓰기(판) {
    비우기(); 머리(판);
    var 글 = h('section', { class: 'cm-폼 cm-글쓰기' });
    var 말머리 = null;
    var 목록값 = { free: ['질문', '정보 공유', '수다'], review: ['합격 소식', '후기', '팁'], notice: [] }[판] || [];
    글.appendChild(h('h2', { text: (판이름[판] || '') + ' 글쓰기' }));
    if (목록값.length) { 말머리 = h('select', { 'aria-label': '말머리' }, 목록값.map(function (x) { return h('option', { value: x, text: x }); })); 글.appendChild(말머리); }
    var 제목 = h('input', { type: 'text', maxlength: '60', placeholder: '제목 (60자까지)', 'aria-label': '제목' });
    var 내용 = h('textarea', { rows: '10', maxlength: '3000', placeholder: '내용을 적어 주세요 (3000자까지)', 'aria-label': '내용' });
    var 오류 = h('p', { class: 'cm-오류 작은', hidden: 'hidden' });
    function 올리기() {
      var 몸 = { 제목: 제목.value, 내용: 내용.value }; if (말머리) 몸.말머리 = 말머리.value;
      A.api('/community/' + 판, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(몸) }).then(function (r) {
        if (r.별명필요) { 별명창(올리기); return; }
        if (r.id) 가기('view/' + 판 + '/' + r.id); else { 오류.textContent = r.오류 || '올리지 못했어요'; 오류.hidden = false; }
      });
    }
    글.appendChild(제목); 글.appendChild(내용);
    글.appendChild(안내('전화번호·주소·주민번호 같은 개인정보와 다른 분을 비난하는 글은 쓰지 말아 주세요. 개인적인 질문은 "질문하기"로 보내 주세요(나와 영감만 볼 수 있어요).'));
    글.appendChild(오류);
    글.appendChild(h('div', { class: 'cm-줄' }, [h('button', { type: 'button', class: '단추 주', text: '올리기', onclick: 올리기 }), h('button', { type: 'button', class: '단추 약함', text: '취소', onclick: function () { 가기(판) } })]));
    root.appendChild(글);
  }

  // ── 질문하기(비공개) ───────────────────────────────
  function 질문목록() {
    비우기(); 머리('ask');
    root.appendChild(h('div', { class: 'cm-비공개', id: 'cm-비공개' }, [h('b', { text: '🔒 완전 비공개예요' }), h('span', { text: '제목도 내용도 나와 영감만 볼 수 있어요. 다른 분들에게는 보이지 않아요.' }), h('small', { id: 'cm-통계', text: '' })]));
    var 줄 = h('div', { class: 'cm-쓰기줄' }, [h('button', { type: 'button', class: '단추 주', text: '질문 쓰기', onclick: function () { 가기('write/ask') } })]);
    root.appendChild(줄);
    var 표 = h('div', { class: '게시판목록' }, [h('div', { class: '행 머리줄' }, [h('span', { class: '번호', text: '번호' }), h('span', { class: '분류', text: '상태' }), h('span', { class: '제목', text: '내 질문' }), h('span', { class: '날짜', text: '날짜' })])]);
    root.appendChild(표);
    A.api('/community/stats').then(function (s) { if (s.문의 != null) document.getElementById('cm-통계').textContent = '이번 달 문의 ' + s.문의 + '건 · 답변 ' + s.답변 + '건'; });
    A.api('/ask').then(function (j) {
      if (j._s === 401) { 문닫힘(); return; }
      var 질 = j.질문 || [];
      if (!질.length) { 표.appendChild(h('p', { class: '없음글 작은', text: '아직 보낸 질문이 없어요. 신청서 쓰다 막힌 곳, 컨설팅·결제 문의, 사이트에 바라는 점 뭐든 편하게 보내 주세요.' })); return; }
      질.forEach(function (x, i) {
        표.appendChild(h('a', { class: '행', href: '#view/ask/' + x.id }, [h('span', { class: '번호', text: String(질.length - i) }), h('span', { class: '분류' + (x.상태 === '답변' ? '' : ' 대기'), text: x.상태 === '답변' ? '답변 완료' : '답변 대기' }), h('span', { class: '제목' }, [h('b', { text: x.제목 }), h('small', { text: x.말머리 })]), h('span', { class: '날짜', text: 날짜(x.시각) })]));
      });
    }, 오류화면);
  }
  function 질문쓰기() {
    비우기(); 머리('ask');
    var 글 = h('section', { class: 'cm-폼 cm-글쓰기' });
    글.appendChild(h('h2', { text: '영감에게 질문하기' }));
    글.appendChild(h('div', { class: 'cm-비공개' }, [h('b', { text: '🔒 완전 비공개예요' }), h('span', { text: '제목과 내용 모두 나와 영감만 볼 수 있어요. 답변은 이 화면에서 확인해요.' })]));
    var 머 = h('select', { 'aria-label': '질문 종류' }, ['신청서 질문', '컨설팅·결제 문의', '사이트 건의', '기타'].map(function (x) { return h('option', { value: x, text: x }); }));
    var 제목 = h('input', { type: 'text', maxlength: '60', placeholder: '제목 (60자까지)', 'aria-label': '제목' });
    var 내용 = h('textarea', { rows: '10', maxlength: '3000', placeholder: '어떤 사업에 지원하는지, 어디서 막혔는지 적어 주시면 더 정확히 답할 수 있어요 (3000자까지)', 'aria-label': '내용' });
    var 오류 = h('p', { class: 'cm-오류 작은', hidden: 'hidden' });
    글.appendChild(머); 글.appendChild(제목); 글.appendChild(내용);
    글.appendChild(안내('하루에 3개까지 보낼 수 있어요. 전화번호·주민번호·계좌번호는 쓰지 마세요.'));
    글.appendChild(오류);
    글.appendChild(h('div', { class: 'cm-줄' }, [
      h('button', { type: 'button', class: '단추 주', text: '보내기', onclick: function () {
        A.api('/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ 말머리: 머.value, 제목: 제목.value, 내용: 내용.value }) }).then(function (r) {
          if (r.id) 가기('view/ask/' + r.id); else { 오류.textContent = r.오류 || '보내지 못했어요'; 오류.hidden = false; }
        });
      } }),
      h('button', { type: 'button', class: '단추 약함', text: '취소', onclick: function () { 가기('ask') } })
    ]));
    root.appendChild(글);
  }
  // 질문 한 건 (질문자 화면과 운영자 화면이 같은 모양)
  function 질문보기(id, 운영) {
    비우기(); 머리(운영 ? 'admin' : 'ask');
    var 칸 = h('div', { class: 'cm-글' }, [h('p', { class: '작은', text: '불러오는 중…' })]); root.appendChild(칸);
    var 길 = 운영 ? '/admin/ask/' + id : '/ask/' + id;
    A.api(길).then(function (j) {
      칸.innerHTML = '';
      if (!j.글) { 칸.appendChild(안내(j.오류 || '질문을 찾지 못했어요')); return; }
      칸.appendChild(h('div', { class: '글머리' }, [h('span', { class: '분류표', text: j.말머리 }), h('h1', { text: j.제목 }), h('div', { class: '글정보' }, [h('span', { text: j.상태 === '답변' ? '답변 완료' : '답변 대기' }), h('span', { text: 긴날짜(j.시각) }), 운영 ? h('span', { text: '보낸 사람 ' + (j.별명 || '') }) : h('span', { text: '🔒 나와 영감만 볼 수 있어요' })])]));
      var 대화 = h('div', { class: 'cm-대화' });
      j.글.forEach(function (x) {
        var 영감말 = x.누가 === '영감';
        대화.appendChild(h('div', { class: 'cm-말 ' + (영감말 ? '영감' : '나') }, [h('b', { text: 영감말 ? '영감' : (운영 ? (j.별명 || '질문한 분') : '나') }), h('div', { class: 'cm-본문', text: x.글 }), h('small', { text: 긴날짜(x.시각) })]));
      });
      칸.appendChild(대화);
      var 입력 = h('textarea', { rows: '5', maxlength: '3000', placeholder: 운영 ? '답변을 적어 주세요' : (j.상태 === '답변' ? '답변에 더 궁금한 점이 있으면 여기에 적어 주세요' : '더 덧붙일 내용이 있으면 적어 주세요'), 'aria-label': '내용' });
      var 오류 = h('p', { class: 'cm-오류 작은', hidden: 'hidden' });
      칸.appendChild(h('div', { class: 'cm-폼' }, [입력, 오류, h('div', { class: 'cm-줄' }, [
        h('button', { type: 'button', class: '단추 주', text: 운영 ? '답변 보내기' : '추가로 보내기', onclick: function () {
          var v = 입력.value.trim(); if (!v) return;
          A.api(길, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ 내용: v }) }).then(function (r) { if (r.보냄) 질문보기(id, 운영); else { 오류.textContent = r.오류 || '보내지 못했어요'; 오류.hidden = false; } });
        } }),
        h('button', { type: 'button', class: '단추', text: '목록', onclick: function () { 가기(운영 ? 'admin' : 'ask') } }),
        운영 ? null : h('button', { type: 'button', class: '단추 약함', text: '질문 지우기', onclick: function () { if (!confirm('이 질문과 답변을 지울까요? 되돌릴 수 없어요.')) return; A.api('/ask/' + id, { method: 'DELETE' }).then(function () { 가기('ask') }); } })
      ])]));
    }, 오류화면);
  }

  // ── 운영(영감 전용) ────────────────────────────────
  function 운영화면() {
    비우기(); 머리('admin');
    if (!me.관리자) { root.appendChild(안내('운영자만 볼 수 있어요.')); return; }
    var 질 = h('div', { class: '게시판목록' }, [h('div', { class: '행 머리줄' }, [h('span', { class: '번호', text: '' }), h('span', { class: '분류', text: '상태' }), h('span', { class: '제목', text: '받은 질문' }), h('span', { class: '날짜', text: '날짜' })])]);
    root.appendChild(h('h2', { class: 'cm-소제목', text: '받은 질문 (비공개)' })); root.appendChild(질);
    A.api('/admin/ask?상태=전체').then(function (j) {
      var 목 = j.질문 || [];
      if (!목.length) 질.appendChild(h('p', { class: '없음글 작은', text: '받은 질문이 없어요.' }));
      목.forEach(function (x, i) { 질.appendChild(h('a', { class: '행', href: '#admin/ask/' + x.id }, [h('span', { class: '번호', text: String(i + 1) }), h('span', { class: '분류' + (x.상태 === '답변' ? '' : ' 대기'), text: x.상태 === '답변' ? '답변함' : '대기' }), h('span', { class: '제목' }, [h('b', { text: x.제목 }), h('small', { text: x.별명 + ' · ' + x.말머리 })]), h('span', { class: '날짜', text: 날짜(x.시각) })])); });
    });
    var 신 = h('div', { class: '게시판목록' }, [h('div', { class: '행 머리줄' }, [h('span', { class: '번호', text: '' }), h('span', { class: '분류', text: '게시판' }), h('span', { class: '제목', text: '신고된 글' }), h('span', { class: '날짜', text: '' })])]);
    root.appendChild(h('h2', { class: 'cm-소제목', text: '신고된 글' })); root.appendChild(신);
    A.api('/admin/reports').then(function (j) {
      var 목 = j.신고 || [];
      if (!목.length) 신.appendChild(h('p', { class: '없음글 작은', text: '신고된 글이 없어요.' }));
      목.forEach(function (x, i) {
        var 줄 = h('a', { class: '행', href: '#view/' + x.게시판 + '/' + x.id }, [h('span', { class: '번호', text: String(i + 1) }), h('span', { class: '분류', text: 판이름[x.게시판] || x.게시판 }), h('span', { class: '제목' }, [h('b', { text: x.제목 }), h('small', { text: x.별명 })]), h('button', { type: 'button', class: 'cm-작은단추', text: '신고 해제', onclick: function (e) { e.preventDefault(); A.api('/admin/reports/' + x.게시판 + '/' + x.id, { method: 'DELETE' }).then(function () { 운영화면() }); } })]);
        신.appendChild(줄);
      });
    });
  }

  function route() {
    var p = location.hash.replace(/^#\/?/, '').split('/');
    var a = p[0] || 'notice';
    if (a === 'view' && p[1] === 'ask' && p[2]) return 질문보기(p[2], false);
    if (a === 'view' && 판이름[p[1]] && p[2]) return 읽기(p[1], p[2]);
    if (a === 'write' && p[1] === 'ask') return 질문쓰기();
    if (a === 'write' && 판이름[p[1]]) return 쓰기(p[1]);
    if (a === 'admin' && p[1] === 'ask' && p[2]) return 질문보기(p[2], true);
    if (a === 'admin') return 운영화면();
    if (a === 'ask') return 질문목록();
    if (판이름[a]) return 목록(a);
    return 목록('notice');
  }

  if (!A.tok()) { 문닫힘(); return; }
  A.api('/me').then(function (j) {
    if (j._s === 401 || !j.이름) { 문닫힘(); return; }
    me = j; window.addEventListener('hashchange', route); route();
  }, function () { 비우기(); 오류화면(); });
})();
