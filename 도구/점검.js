// 올리기 전에 자료/공고.json 이 멀쩡한지 본다. 이상하면 올리지 않는다 (종료코드 1).
//   node 도구/점검.js
// 마감이 한꺼번에 몰려 정말 많이 줄어든 날은 사람이 확인한 뒤 SITE_FORCE=1 로 올린다.
// 수집이 한 번 잘못 돌아 빈 파일이나 반토막 난 파일이 올라가면 공개 사이트가 같이 망가지기 때문이다.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const 뿌리 = path.join(__dirname, '..');
const 파일 = path.join(뿌리, '자료', '공고.json');
const 문제 = [];

let 새;
try {
  새 = JSON.parse(fs.readFileSync(파일, 'utf8'));
  if (!Array.isArray(새)) throw new Error('목록이 아님');
} catch (e) {
  console.log('공고.json 을 읽을 수 없습니다: ' + e.message);
  process.exit(1);
}

// 1) 지금 올라가 있는 건수와 비교: 갑자기 많이 줄면 멈춘다
let 이전 = null;
try {
  이전 = JSON.parse(execSync('git show HEAD:자료/공고.json', { cwd: 뿌리, stdio: ['ignore', 'pipe', 'ignore'] }).toString());
} catch (e) { /* 처음 올리는 경우 */ }
const 강제 = process.env.SITE_FORCE === '1';   // 사람이 확인하고 올릴 때만: SITE_FORCE=1 (건수 줄어듦 검사만 건너뜀)
if (!강제 && 새.length < 30) 문제.push(`공고가 ${새.length}건뿐입니다 (30건 미만은 수집 오류로 봅니다)`);
if (!강제 && 이전 && 이전.length >= 50 && 새.length < 이전.length * 0.6) {
  문제.push(`공고가 ${이전.length}건에서 ${새.length}건으로 40% 넘게 줄었습니다`);
}

// 2) 한 건씩: 꼭 있어야 하는 칸, 이상한 값, 같은 번호
const 날짜형 = /^\d{4}-\d{2}-\d{2}$/;
const 본 = new Set();
let 중복 = 0, 칸없음 = 0, 이상한값 = 0, 요약 = 0, 혜택 = 0;
for (const x of 새) {
  if (!x.id || !x.title || !x.org || !/^https?:\/\//.test(x.link || '') || !(x.deadline === '상시' || 날짜형.test(x.deadline || ''))) 칸없음++;
  if (본.has(x.id)) 중복++; else 본.add(x.id);
  for (const k of ['summary', 'benefit', 'title', 'org']) {
    if (/^(true|false|none|null|nan|undefined)$/i.test((x[k] || '').trim())) 이상한값++;
  }
  if (x.summary) 요약++;
  if (x.benefit) 혜택++;
}
if (칸없음) 문제.push(`꼭 있어야 하는 칸(번호·제목·기관·원문 링크·마감일)이 비어 있는 공고가 ${칸없음}건`);
if (중복) 문제.push(`같은 번호가 겹치는 공고가 ${중복}건`);
if (이상한값) 문제.push(`TRUE/FALSE/None 같은 이상한 값이 ${이상한값}군데`);

console.log(`공고 ${새.length}건 · 요약 ${요약}건 · 지원내용 ${혜택}건` + (이전 ? ` (지금 올라가 있는 것: ${이전.length}건)` : ''));
if (문제.length) {
  console.log('올리지 않습니다. 이유:');
  문제.forEach((m) => console.log('  - ' + m));
  process.exit(1);
}
console.log('점검 통과');
