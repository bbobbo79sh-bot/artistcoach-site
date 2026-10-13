// 임시 공유용 HTML 한 장을 '암호로 잠가서' 사이트에 올릴 준비를 한다. (업무툴 시안 등, 2026-10-13 영감 승인)
//   node 도구/임시공유올리기.js "<인계 폴더>"
// 인계 폴더에는 index.html(공유할 화면)과 제안_주소토큰.txt(주소에 쓸 글자)가 있어야 한다.
// 사이트 저장소가 공개라서, 그냥 올리면 누구나 볼 수 있다 → 내용을 AES-256-GCM 으로 암호화해 올리고, 암호는 직원에게만 알려 준다.
// 결과: 자료/임시공유/tool-<글자>/index.html (사이트를 만들 때 그대로 복사됨). 메뉴·사이트맵·robots 에는 넣지 않는다.
// 암호와 최종 주소는 인계 폴더의 '최종주소와_암호.txt' 에만 적는다(채팅·저장소에는 쓰지 않는다). 이미 있으면 그 암호를 다시 쓴다.
// 내리는 법: 자료/임시공유 폴더를 지우고 push.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const 인계 = process.argv[2];
if (!인계) { console.log('사용법: node 도구/임시공유올리기.js "<인계 폴더>"'); process.exit(1); }
const 뿌리 = path.join(__dirname, '..');
const 원본 = fs.readFileSync(path.join(인계, 'index.html'));
const 글자 = fs.readFileSync(path.join(인계, '제안_주소토큰.txt'), 'utf8').trim().replace(/^\/?tool-/, '').replace(/\/$/, '');
if (!/^[A-Za-z0-9-]{8,60}$/.test(글자)) { console.log('주소 글자 형식이 이상합니다'); process.exit(1); }

const 정보경로 = path.join(인계, '최종주소와_암호.txt');
let 암호 = '';
if (fs.existsSync(정보경로)) { const m = fs.readFileSync(정보경로, 'utf8').match(/^암호:\s*(\S+)/m); if (m) 암호 = m[1]; }
if (!암호) {
  const 글 = 'abcdefghjkmnpqrstuvwxyz23456789';   // 헷갈리는 글자(0 o 1 l i) 뺌
  암호 = Array.from(crypto.randomBytes(12)).map((b) => 글[b % 글.length]).join('');
}

const 소금 = crypto.randomBytes(16), 숫자 = crypto.randomBytes(12), 반복 = 600000;
const 키 = crypto.pbkdf2Sync(암호, 소금, 반복, 32, 'sha256');
const 잠금기 = crypto.createCipheriv('aes-256-gcm', 키, 숫자);
const 속 = Buffer.concat([잠금기.update(원본), 잠금기.final()]);
const 암호문 = Buffer.concat([속, 잠금기.getAuthTag()]);

const 화면 = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive"><title>잠긴 화면</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fff4f8;font-family:system-ui,-apple-system,"Malgun Gothic",sans-serif;color:#2a1a22}
form{background:#fff;border:1px solid #e8c9d8;border-radius:16px;padding:28px;max-width:340px;width:calc(100% - 40px);text-align:center}
h1{font-size:18px;margin:0 0 6px}p{font-size:13.5px;color:#7a6470;margin:0 0 16px}
input{width:100%;box-sizing:border-box;font:inherit;padding:10px 12px;border:1px solid #e8c9d8;border-radius:10px;margin-bottom:12px}
button{font:inherit;font-weight:700;width:100%;padding:10px;border:0;border-radius:999px;background:#e5007d;color:#fff;cursor:pointer}
#e{color:#c00;font-size:13px;min-height:18px;margin-top:10px}</style></head>
<body><form id="f"><h1>직원 공유 화면</h1><p>받은 암호를 입력하세요.</p>
<input id="p" type="password" autocomplete="off" autofocus aria-label="암호"><button type="submit">열기</button><div id="e"></div></form>
<script>
var D={s:"${소금.toString('base64')}",n:"${숫자.toString('base64')}",i:${반복},c:"${암호문.toString('base64')}"};
function b(x){var r=atob(x),u=new Uint8Array(r.length);for(var k=0;k<r.length;k++)u[k]=r.charCodeAt(k);return u}
document.getElementById('f').addEventListener('submit',function(ev){ev.preventDefault();
var e=document.getElementById('e');e.textContent='여는 중…';
var pw=new TextEncoder().encode(document.getElementById('p').value);
crypto.subtle.importKey('raw',pw,'PBKDF2',false,['deriveKey']).then(function(m){
return crypto.subtle.deriveKey({name:'PBKDF2',salt:b(D.s),iterations:D.i,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['decrypt'])})
.then(function(k){return crypto.subtle.decrypt({name:'AES-GCM',iv:b(D.n)},k,b(D.c))})
.then(function(t){var h=new TextDecoder().decode(t);document.open();document.write(h);document.close()})
.catch(function(){e.textContent='암호가 맞지 않아요.'})});
</script></body></html>
`;

const 폴더 = path.join(뿌리, '자료', '임시공유', `tool-${글자}`);
fs.mkdirSync(폴더, { recursive: true });
fs.writeFileSync(path.join(폴더, 'index.html'), 화면);

fs.writeFileSync(정보경로, `업무툴 임시 공유 — 최종 주소와 암호 (이 파일은 영감·업무툴 봇만. 채팅·저장소에 붙이지 마세요)
주소: https://artistcoach.kr/tool-${글자}/
암호: ${암호}
내리는 법: 사이트 폴더의 자료/임시공유 폴더를 지우고 push 하면 주소가 사라집니다(홈피 봇에게 "임시공유 내려줘").
`, 'utf8');
console.log('잠금 화면을 만들었습니다 → 자료/임시공유/tool-… (주소·암호는 인계 폴더의 최종주소와_암호.txt)');
