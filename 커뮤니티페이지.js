// 커뮤니티 화면 껍데기 (만들기.js 가 불러 쓴다). 안쪽은 커뮤니티.client.js 가 로그인 서버와 이야기하며 그린다.
// 탭: 공지 / 자유게시판 / 질문하기(완전 비공개) / 합격·후기. 읽기·쓰기 모두 로그인해야 한다. 검색에 잡히지 않는다(색인 false).
const fs = require('fs');
const path = require('path');
module.exports = ({ 틀, 길, 쓰기 }) => {
  const 스타일 = `
.cm-홈링크{color:inherit;text-decoration:none}
.cm-허브{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0 8px}
.cm-칸{display:flex;flex-direction:column;gap:6px;padding:18px 18px 16px;border-radius:18px;background:var(--면);border:1.5px solid var(--선);text-decoration:none;color:var(--ink);min-height:178px}
.cm-칸:hover{border-color:var(--브랜드);background:color-mix(in srgb,var(--브랜드) 5%,#fff)}
.cm-칸 .cm-아이콘{width:44px;height:44px;border-radius:14px;background:color-mix(in srgb,var(--브랜드) 10%,#fff);display:flex;align-items:center;justify-content:center;font-size:23px;line-height:1}
.cm-칸 b{font-size:20px;letter-spacing:-.02em;margin-top:4px}
.cm-칸 .cm-설명{font-size:14px;line-height:1.6;color:var(--sub)}
.cm-칸 .cm-꼬리{align-self:flex-start;margin-top:auto;font-size:12px;font-weight:700;color:var(--깊음);background:color-mix(in srgb,var(--브랜드) 8%,#fff);border:1px solid color-mix(in srgb,var(--브랜드) 22%,#fff);padding:2px 10px;border-radius:999px}
.cm-칸 .cm-최근{font-size:12.5px;color:var(--sub);line-height:1.5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-height:19px}
.cm-칸.강조{background:var(--브랜드);border-color:var(--브랜드);color:var(--브랜드글)}
.cm-칸.강조 .cm-아이콘{background:rgba(255,255,255,.2)}.cm-칸.강조 .cm-설명,.cm-칸.강조 .cm-최근{color:var(--브랜드글);opacity:.92}
.cm-칸.강조 .cm-꼬리{background:#fff;color:var(--깊음);border-color:#fff}
@media (max-width:560px){.cm-허브{gap:10px}.cm-칸{padding:14px 13px 13px;min-height:168px;border-radius:16px}.cm-칸 b{font-size:17.5px}.cm-칸 .cm-설명{font-size:13px}.cm-칸 .cm-아이콘{width:38px;height:38px;font-size:20px}}
.cm-문{max-width:520px;margin:10px auto;text-align:center}.cm-문 h1{font-size:26px;line-height:1.4;margin:6px 0 10px}.cm-문 p{line-height:1.8}.cm-문 .단추{margin-top:6px}
.cm-윗글{display:inline-block;font-size:12.5px;font-weight:800;padding:5px 12px;border-radius:999px;background:var(--브랜드);color:var(--브랜드글);margin:0 0 8px}
.cm-내별명{margin:0;padding-bottom:8px}.cm-내별명 a{color:var(--깊음);font-weight:700}
.cm-쓰기줄{display:flex;justify-content:flex-end;margin:14px 0 0}
.cm-더{margin-top:14px}
.행 .분류.대기{background:#fff4e5;border-color:#f3c98b;color:#8a5200}
.cm-소제목{font-size:18px;margin:28px 0 8px}
.cm-비공개{display:flex;flex-direction:column;gap:3px;background:color-mix(in srgb,var(--브랜드) 7%,#fff);border:1px solid color-mix(in srgb,var(--브랜드) 22%,#fff);border-radius:14px;padding:13px 16px;margin:14px 0 0;font-size:14.5px;line-height:1.6}
.cm-비공개 b{color:var(--깊음);font-size:15px}.cm-비공개 small{color:var(--sub)}
.cm-안내{font-size:13.5px;line-height:1.7;color:var(--sub);margin:4px 0}.cm-안내.오류,.cm-오류{color:#b3261e;font-weight:700}
.cm-폼{display:flex;flex-direction:column;gap:10px;margin:18px 0}
.cm-폼 input,.cm-폼 textarea,.cm-폼 select,.cm-별명창 input{width:100%;font:inherit;font-size:16px;padding:12px 14px;border:1px solid var(--선);border-radius:12px;background:var(--면);color:var(--ink);box-sizing:border-box}
.cm-폼 select{width:auto;align-self:flex-start;padding-right:30px}
.cm-폼 textarea{line-height:1.7;resize:vertical}
.cm-폼 input:focus,.cm-폼 textarea:focus,.cm-별명창 input:focus{outline:none;border-color:var(--브랜드)}
.cm-글쓰기 h2{font-size:20px;margin:0}
.cm-줄{display:flex;gap:8px;flex-wrap:wrap}
.cm-별명창{border:1.5px solid var(--브랜드);border-radius:14px;padding:16px;margin:14px 0;background:var(--면);display:flex;flex-direction:column;gap:8px}
.cm-본문{white-space:pre-wrap;word-break:break-word;font-size:16.5px;line-height:1.85;padding:6px 0 14px}
.cm-글줄{padding:6px 0 4px;border-top:1px solid var(--선);margin-top:6px;padding-top:14px}
.cm-댓글 h2{font-size:17px;margin:22px 0 8px}
.cm-댓{border-top:1px solid var(--선);padding:12px 2px 4px}.cm-댓 .cm-본문{font-size:15.5px;line-height:1.75;padding:2px 0 8px}
.cm-댓머리{display:flex;align-items:center;gap:10px;font-size:14px}.cm-댓머리 small{color:var(--sub)}
.cm-작은단추{margin-left:auto;font:inherit;font-size:12.5px;color:var(--sub);background:none;border:1px solid var(--선);border-radius:8px;padding:2px 9px;cursor:pointer}
.cm-대화{display:flex;flex-direction:column;gap:12px;margin:8px 0 6px}
.cm-말{max-width:92%;border-radius:16px;padding:12px 15px;display:flex;flex-direction:column;gap:4px}
.cm-말 b{font-size:13px}.cm-말 small{font-size:12px;color:var(--sub)}.cm-말 .cm-본문{padding:0;font-size:15.5px;line-height:1.75}
.cm-말.나{align-self:flex-end;background:var(--면);border:1px solid var(--선)}
.cm-말.영감{align-self:flex-start;background:color-mix(in srgb,var(--브랜드) 10%,#fff);border:1px solid color-mix(in srgb,var(--브랜드) 28%,#fff)}.cm-말.영감 b{color:var(--깊음)}
.cm-글 .글정보{flex-wrap:wrap;row-gap:2px}.cm-글 .글정보 span{white-space:nowrap}
.쪽번호.cm-더 button{padding:0 18px;min-width:120px}
`;
  const 만들기 = () => {
    쓰기('community.js', fs.readFileSync(path.join(__dirname, '커뮤니티.client.js'), 'utf8'));
    const 본문 = `<div id="커뮤니티" class="게시판 커뮤니티"><p class="작은">불러오는 중…</p></div>
<noscript><p>커뮤니티를 보려면 자바스크립트를 켜 주세요.</p></noscript>
<script src="${길('/community.js')}"></script>`;
    쓰기('community/index.html', 틀({ 제목: '커뮤니티 · 아티스트 코치', 설명: '아티스트 코치 커뮤니티 (로그인한 분만 볼 수 있어요)', 경로: '/community/', 현재: '커뮤니티', 본문, 색인: false }));
  };
  return { 스타일, 만들기 };
};
