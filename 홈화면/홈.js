(function(){var _go=function(){

(function(){
 var A=AC,M=KMAP,PROV=M.provs.map(function(p){return p.short}),PM={};M.provs.forEach(function(p){PM[p.short]=p});
 var $=function(i){return document.getElementById(i)};
 // ── 색: 사이트 색을 읽어 온다 ──
 var ROOT=document.querySelector('.새홈'),cs=getComputedStyle(ROOT),gv=function(n,f){return (cs.getPropertyValue(n)||f).trim()||f};
 var C={ink:gv('--ink','#0B1B3A'),sig:gv('--브랜드','#1F4DFF'),bg:gv('--bg','#EEF2F8'),sub:gv('--sub','#5A6A86'),line:gv('--line','#CBD5E4')};
 // ── 공고 분류 ──
 var CITY={마포:'서울',중랑:'서울',강남:'서울',종로:'서울',안산:'경기',군포:'경기',광명:'경기',오산:'경기',하남:'경기',과천:'경기',용인:'경기',수원:'경기',성남:'경기',부평:'인천',미추홀:'인천',영도:'부산',전주:'전북',남원:'전북',충주:'충북',청주:'충북',공주:'충남',아산:'충남',김해:'경남',창원:'경남',의령:'경남',삼척:'강원',강릉:'강원',영주:'경북',포항:'경북',경주:'경북',달서:'대구',경인일보:'경기'};
 var FOREIGN=/프랑스|미국|독일|일본|스위스|슬로베니아|오스트리아|홍콩|영국|이탈리아|네덜란드|호주|캐나다|중국|핀란드|스페인|\(.+국\)|[A-Za-z]{4,}/;
 function loc(x){if(x._t===1||x.region==='전국')return '전국';if(PROV.indexOf(x.region)>=0)return x.region;var o=x.org;for(var i=0;i<PROV.length;i++){if(o.indexOf(PROV[i])>=0)return PROV[i]}for(var k in CITY){if(o.indexOf(k)>=0)return CITY[k]}if(/^(CJ|KT)/.test(o))return '기타';if(FOREIGN.test(o))return '해외';return '기타'}
 var FL=[['연극','연극·공연'],['무용','무용·전통춤'],['음악','음악·국악'],['미술','미술·전시'],['문학','문학·출판'],['영상','영상·미디어'],['','종합·기타']];
 function fieldOf(x){var s=A.clean(x.title)+' '+x.org;for(var i=0;i<6;i++)if(A.KW[FL[i][0]].test(s))return i;return 6}
 function grp(x){return PM[x._l]?x._l:'전국'}
 function rnd(seed){return function(){seed|=0;seed=(seed+0x6D2B79F5)|0;var t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
 var r=rnd(9);function g(){return (r()+r()+r()-1.5)*.6}

 // ── 점 만들기 ──
 var stage=$('stage'),cv=$('cv'),ctx=cv.getContext('2d'),W=0,H=0,DPR=1;
 var VB={x:0,y:330,w:M.viewBox[2],h:M.viewBox[3]-330},S=6.4,PX=document.createElement('canvas').getContext('2d');
 function sample(d){var p2=new Path2D(d),pts=[],row=0;for(var y=VB.y;y<VB.y+VB.h;y+=S*0.866,row++){for(var x=(row%2?S/2:0);x<VB.w;x+=S){if(PX.isPointInPath(p2,x,y))pts.push([x,y])}}return pts}
 var CEN=[[-.8,.25,.35],[.75,.45,-.35],[.1,-.75,.5],[-.35,.15,-.85],[.25,.85,.6],[-.2,-.35,-.45],[.8,-.5,.3]];
 var NATX=34,NATY=808;
 A.ALL.forEach(function(x){x._l=loc(x)});
 var NP=[],DP=[],NK=[],cnt={},fc=[0,0,0,0,0,0,0],used={},natN=0,total=A.ALL.length,open=0;
 A.ALL.forEach(function(x){var k=fieldOf(x),c=CEN[k],G=grp(x);fc[k]++;cnt[G]=(cnt[G]||0)+1;if(x._d===null||x._d>=0)open++;
  var pt={n:x,k:k,G:G,notice:1,ex:c[0]+g()*.6,ey:c[1]+g()*.6,ez:c[2]+g()*.6,dl:r(),wx:(r()-.5)*180,wy:(r()-.5)*180};
  var p=PM[x._l];
  if(p){var u=used[x._l]||0;used[x._l]=u+1;var q=p.dots[u%p.dots.length],j=u>=p.dots.length?8:0;pt.mx=q[0]+(r()-.5)*j;pt.my=q[1]+(r()-.5)*j}
  else{var i=natN++,rr=5.2*Math.sqrt(i+.5),a=i*2.39996;pt.mx=NATX+Math.cos(a)*rr;pt.my=NATY+Math.sin(a)*rr}
  NP.push(pt)});
 M.provs.forEach(function(p){sample(p.d).forEach(function(q){var k=Math.floor(r()*7),c=CEN[k];DP.push({prov:p.short,k:k,mx:q[0],my:q[1],ex:c[0]+g()*1.15,ey:c[1]+g()*1.15,ez:c[2]+g()*1.15,dl:r(),wx:(r()-.5)*200,wy:(r()-.5)*200})})});
 sample(M.north).forEach(function(q){NK.push({mx:q[0],my:q[1]})});
 (function(){var by={};NP.forEach(function(p){if(PM[p.G])(by[p.G]=by[p.G]||[]).push(p)});
  Object.keys(by).forEach(function(k){var pv=PM[k],pool=DP.filter(function(d){return d.prov===k}).map(function(d){return [d.mx,d.my]});
   for(var i=pool.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=pool[i];pool[i]=pool[j];pool[j]=t}
   var cand=pv.dots.concat(pool),need=by[k].length;
   for(var e=0;cand.length<need&&e<60;e++){var an=r()*6.283,rd=Math.sqrt(r())*(k==='인천'?9:11);cand.push([pv.cx+Math.cos(an)*rd,pv.cy+Math.sin(an)*rd])}
   by[k].forEach(function(p,i){var q=cand[i%cand.length],jj=i>=cand.length?5:0;p.mx=q[0]+(r()-.5)*jj;p.my=q[1]+(r()-.5)*jj})})})();
 NP.forEach(function(p,i){var d=NP.map(function(q,j){return [j,(p.ex-q.ex)*(p.ex-q.ex)+(p.ey-q.ey)*(p.ey-q.ey)+(p.ez-q.ez)*(p.ez-q.ez)]}).sort(function(a,b){return a[1]-b[1]});p.nb=[d[1][0],d[2][0]]});
 var maxC=Math.max.apply(null,PROV.map(function(p){return cnt[p]||0}))||1;

 // ── 상태 ──
 var mode=0,m=0,target=0,sel=null,hov=null,R={a:.4,va:0,tilt:.35},L={},RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function layout(){var mob=W<820,ax0=mob?0:Math.min(380,W*.3),ax1=mob?W:W-(sel?360:60),cx=(ax0+ax1)/2,cy=mob?H*.55:H*.5,ah=mob?H*.56:H*.74;
  L.cx=cx;L.cy=cy;L.esc=Math.min(ax1-ax0,ah)*.42;L.s=Math.min(ah/VB.h,(ax1-ax0)/VB.w*.98);
  L.mx=function(x){return (x-VB.w/2)*L.s+cx};L.my=function(y){return (y-(VB.y+VB.h/2))*L.s+cy};
  NP.concat(DP,NK).forEach(function(p){p.tx=L.mx(p.mx);p.ty=L.my(p.my)})}
 function resize(){DPR=Math.min(2,window.devicePixelRatio||1);W=stage.clientWidth;H=stage.clientHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.width=W+'px';cv.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);layout()}
 window.addEventListener('resize',resize);

 // ── 글/칩/패널 ──
 function setText(){var h=$('h1'),p=$('pl');h.classList.add('fade');p.classList.add('fade');
  setTimeout(function(){
   if(mode===0){h.innerHTML='장르별로 모아 본<br><em>'+total+'건의 지원사업</em>';p.innerHTML='AI가 공고를 읽고 비슷한 것끼리 <b>가까이</b> 모아 놨어요. 큰 점이나 장르 이름을 누르면 그 장르의 공고가 열려요.';$('s2').textContent=7;$('s2l').textContent='장르';$('hint').textContent='끌면 돌아가요 · 큰 점 = 장르 고르기 · 가까울수록 비슷한 공고'}
   else{h.innerHTML='전국에 펼쳐진<br><em>'+total+'건의 지원사업</em>';p.innerHTML='파란 점 하나가 <b>공고 하나</b>예요. 지역을 누르면 그 지역 공고가 열려요.';$('s2').textContent=Object.keys(cnt).length;$('s2l').textContent='지역';$('hint').textContent='지역 클릭 = 공고 보기 · 파란 점 = 공고가 있는 곳'}
   h.classList.remove('fade');p.classList.remove('fade')},260);
  var ch=$('chips');
  if(mode===0)ch.innerHTML=FL.map(function(f,i){return '<button data-k="'+i+'">'+f[1]+'<b>'+fc[i]+'</b></button>'}).join('');
  else{var ks=Object.keys(cnt).sort(function(a,b){return cnt[b]-cnt[a]}).slice(0,10);ch.innerHTML=ks.map(function(k){return '<button data-p="'+k+'">'+(k==='전국'?'전국·해외':k)+'<b>'+cnt[k]+'</b></button>'}).join('')}
  markChips()}
 function markChips(){[].forEach.call($('chips').children,function(b){var on=sel&&((sel.t==='k'&&b.dataset.k!==undefined&&Number(b.dataset.k)===sel.v)||(sel.t==='p'&&b.dataset.p===sel.v));b.classList.toggle('on',!!on)})}
 $('s1').textContent=total;$("s3").textContent=A.ALL.filter(function(x){return x._d!==null&&x._d>=0&&x._d<=7}).length;
 var more=false;
 function rowHTML(x){var d=x._d,dl=d===null?'상시 접수':A.md(x.deadline)+' 마감';return '<a class="row" href="'+A.href(x)+'" target="_blank" rel="noopener"><span class="t">'+A.esc(A.clean(x.title))+'</span><span class="o">'+A.esc(x.org)+'</span><span class="d">'+dl+(d!==null&&d<=7?'<i>D-'+d+'</i>':'')+'</span></a>'}
 function drawPanel(){var pn=$('panel');if(!sel){pn.classList.remove('show');layout();return}
  var items=A.ALL.filter(function(x){return sel.t==='k'?fieldOf(x)===sel.v:grp(x)===sel.v});
  $('pt').textContent=sel.t==='k'?FL[sel.v][1]:(sel.v==='전국'?'전국·해외·기타':sel.v);$('pc').textContent='N='+items.length;
  var shown=more?items:items.slice(0,12);$('list').innerHTML=(items.length?'':'<div class="row"><span class="t">이 지역은 아직 올라온 공고가 없어요</span><span class="o">공고가 생기면 바로 채워져요</span></div>')+shown.map(rowHTML).join('')+(items.length>12&&!more?'<button class="more" id="mb">'+(items.length-12)+'건 더 보기</button>':'');
  $('list').scrollTop=0;pn.classList.add('show');layout()}
 $('list').addEventListener('click',function(e){if(e.target.id==='mb'){more=true;drawPanel()}});
 function select(s){if(sel&&s&&sel.t===s.t&&sel.v===s.v)s=null;sel=s;more=false;markChips();drawPanel()}
 $('px').addEventListener('click',function(){select(null)});
 $('chips').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.k!==undefined)select({t:'k',v:Number(b.dataset.k)});else select({t:'p',v:b.dataset.p})});
 function setMode(i){if(mode===i)return;mode=i;target=i;sel=null;drawPanel();setText();cv.classList.toggle('map',i===1);[].forEach.call(document.querySelectorAll('.top button'),function(b){b.classList.toggle('on',Number(b.dataset.m)===i)});hideTip()}
 document.querySelector('.top').addEventListener('click',function(e){var b=e.target.closest('button');if(b)setMode(Number(b.dataset.m))});
 document.addEventListener('keydown',function(e){if(e.key==='m'||e.key==='M')setMode(mode?0:1)});

 // ── 툴팁/조작 ──
 var tip=$('tip');function showTip(e,t){tip.textContent=t;tip.style.left=Math.min(innerWidth-310,e.clientX+14)+'px';tip.style.top=(e.clientY-38)+'px';tip.classList.add('show')}function hideTip(){tip.classList.remove('show')}
 var drag=null;
 var hovK=-1,CC=[],hovP=null,PR={},LAB={서울:[146,458],인천:[100,520],경기:[252,468],강원:[338,466],충남:[150,594],충북:[290,570],세종:[98,566],대전:[104,640],전북:[214,676],광주:[98,734],전남:[212,774],경북:[356,594],대구:[440,654],울산:[442,700],부산:[424,750],경남:[290,730],제주:[176,880],전국:[NATX,NATY-70]};
 function nearest(x,y){if(mode===1&&m>.6){for(var pk in PR){var rc=PR[pk];if(x>=rc.x-3&&x<=rc.x+rc.w+3&&y>=rc.y-3&&y<=rc.y+rc.h+3)return {pill:pk}}}
  var best=null,bd=1e9,lim=mode===0?26:14,arr=mode===0?NP:NP.concat(DP);
  for(var i=0;i<arr.length;i++){var p=arr[i];if(p.dx===undefined)continue;var dx=p.dx-x,dy=p.dy-y,d=dx*dx+dy*dy;if(d<bd){bd=d;best=p}}
  if(best&&bd<lim*lim)return best;
  if(mode===0&&m<.5){var bk=-1,kd=1e9;for(var k=0;k<7;k++){if(!CC[k])continue;var ex=CC[k].x-x,ey=CC[k].y-y,dd=ex*ex+ey*ey;if(dd<kd){kd=dd;bk=k}}if(bk>=0&&kd<70*70)return {cluster:bk}}
  return null}
 function pos(e){var r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]}
 cv.addEventListener('pointerdown',function(e){drag={x:e.clientX,y:e.clientY,a:R.a,t:R.tilt,mv:0};cv.setPointerCapture(e.pointerId)});
 cv.addEventListener('pointermove',function(e){
  if(drag){var dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.mv=Math.max(drag.mv,Math.abs(dx)+Math.abs(dy));if(mode===0&&drag.mv>4){R.a=drag.a+dx*.006;R.tilt=Math.max(-.2,Math.min(.9,drag.t+dy*.004))}}
  var q=pos(e),h=nearest(q[0],q[1]);hovP=h&&h.pill?h.pill:null;if(hovP){hov=null;hovK=-1;cv.classList.add('hit');hideTip();return}hov=h&&h.cluster===undefined?h:null;hovK=h&&h.cluster!==undefined?h.cluster:(h&&h.notice&&mode===0?h.k:-1);cv.classList.toggle('hit',!!h);
  if(!h){hideTip();return}
  if(h.cluster!==undefined)showTip(e,FL[h.cluster][1]+' '+fc[h.cluster]+'건 · 눌러서 보기');else if(h.notice)showTip(e,A.clean(h.n.title)+' · '+h.n.org);else showTip(e,h.prov+'  N='+(cnt[h.prov]||0))});
 cv.addEventListener('pointerup',function(e){var was=drag;drag=null;if(was&&was.mv<5){var q=pos(e),h=nearest(q[0],q[1]);if(h){if(mode===0&&h.cluster!==undefined)select({t:'k',v:h.cluster});else if(mode===0&&h.notice)select({t:'k',v:h.k});else if(mode===1)select({t:'p',v:h.pill?h.pill:(h.notice?h.G:h.prov)})}else if(sel)select(null)}});
 cv.addEventListener('pointerleave',function(){hov=null;hovK=-1;hovP=null;hideTip()});

 // ── 그리기 ──
 var last=0,TWO=Math.PI*2;
 function frame(t){requestAnimationFrame(frame);if(document.hidden||window.scrollY>H+80){last=t;return}var dt=Math.min(50,t-(last||t));last=t;
  var d=target-m;if(d!==0){var st=dt/2000;m=d>0?Math.min(target,m+st):Math.max(target,m-st)}
  if(!RM&&!drag)R.a+=dt*.00012*(1-Math.min(1,m*1.5));
  var ca=Math.cos(R.a),sa=Math.sin(R.a),ct=Math.cos(R.tilt),stl=Math.sin(R.tilt),cx=L.cx,cy=L.cy,sc=L.esc;
  ctx.clearRect(0,0,W,H);
  function place(p){var x=p.ex*ca+p.ez*sa,z=-p.ex*sa+p.ez*ca,y=p.ey*ct-z*stl;z=p.ey*stl+z*ct;var f=2.6/(2.6-z);p.z=z;p.f=f;p.px=cx+x*sc*f;p.py=cy+y*sc*f;
   var lp=Math.max(0,Math.min(1,m*1.55-p.dl*.55)),e=lp*lp*(3-2*lp);p.e=e;var w=Math.sin(Math.PI*e);p.dx=p.px+(p.tx-p.px)*e+w*p.wx;p.dy=p.py+(p.ty-p.py)*e+w*p.wy;p.ea=Math.max(.15,Math.min(1,(z+1.2)/2.2))}
  var i,p,n=NP.length;
  for(i=0;i<NP.length;i++)place(NP[i]);for(i=0;i<DP.length;i++)place(DP[i]);
  // 북한(연한 점) — 지도에서만
  if(m>0){ctx.fillStyle=C.ink;ctx.globalAlpha=.09*m;for(i=0;i<NK.length;i++){p=NK[i];ctx.fillRect(p.tx-1,p.ty-1,2,2)}}
  // 이웃 선 (임베딩)
  if(m<.85){ctx.lineWidth=.8;for(i=0;i<n;i++){p=NP[i];for(var q=0;q<2;q++){var b=NP[p.nb[q]],al=Math.max(0,(p.z+b.z)/2+1)/2.4*(1-Math.min(1,m*1.3));if(al<.01)continue;var on=!sel||(sel.t==='k'&&(p.k===sel.v));ctx.strokeStyle=(sel&&sel.t==='k'&&p.k===sel.v)?C.sig:C.ink;ctx.globalAlpha=al*(on?.45:.12);ctx.beginPath();ctx.moveTo(p.dx,p.dy);ctx.lineTo(b.dx,b.dy);ctx.stroke()}}}
  // 먼지 점 (지도 칸 / 임베딩 후광)
  var selP=sel&&sel.t==='p'?sel.v:null,fl=-1;
  for(i=0;i<DP.length;i++){p=DP[i];var e=p.e,hot=PM[p.prov]&&cnt[p.prov],heat=cnt[p.prov]?Math.min(1,cnt[p.prov]/maxC):0;
   var ma=hot?(selP===p.prov?.95:.34+.5*heat):.13,al=(.2*p.ea+.1)*(1-e)+ma*e;if(selP&&selP!==p.prov&&e>.5)al*=.55;
   var useSig=e>.5&&hot,col=useSig?C.sig:C.ink;if(col!==fl){ctx.fillStyle=col;fl=col}
   ctx.globalAlpha=al;var sz=(1+p.f*.55)*(1-e)+1.9*e;ctx.fillRect(p.dx-sz/2,p.dy-sz/2,sz,sz)}
  // 공고 점
  var ord=NP.slice();if(m<.5)ord.sort(function(a,b){return a.z-b.z});
  for(i=0;i<ord.length;i++){p=ord[i];var e2=p.e,dim=sel&&((sel.t==='k'&&p.k!==sel.v)||(sel.t==='p'&&p.G!==sel.v)),al2=(p.ea*(1-e2)+e2)*(dim?.2:1),r2=(3.3+p.f*2.1)*(1-e2)+4.4*e2;
   if(e2<.6){ctx.globalAlpha=al2*.16*(1-e2);ctx.fillStyle=C.sig;ctx.beginPath();ctx.arc(p.dx,p.dy,r2+6,0,TWO);ctx.fill()}ctx.globalAlpha=al2;ctx.fillStyle=C.sig;ctx.beginPath();ctx.arc(p.dx,p.dy,r2,0,TWO);ctx.fill();
   if(!dim&&(sel||hov===p)){ctx.globalAlpha=al2*.45;ctx.strokeStyle=C.sig;ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.dx,p.dy,r2+4+(hov===p?2:0),0,TWO);ctx.stroke()}}
  ctx.globalAlpha=1;
  // 임베딩: 분야 이름표
  if(m<.7){var lab=[0,0,0,0,0,0,0],lx=[0,0,0,0,0,0,0],ly=[0,0,0,0,0,0,0];for(i=0;i<n;i++){p=NP[i];lab[p.k]++;lx[p.k]+=p.px;ly[p.k]+=p.py}
   ctx.font='800 14px "Pretendard Variable",Pretendard,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
   for(var k=0;k<7;k++){if(!lab[k])continue;var X=lx[k]/lab[k],Y=ly[k]/lab[k]-30*(L.esc/300),txt=FL[k][1]+'  '+fc[k],on2=!sel||(sel.t==='k'&&sel.v===k)||hovK===k;CC[k]={x:X,y:Y+30*(L.esc/300)};ctx.globalAlpha=(1-Math.min(1,m*1.5))*(on2?1:.35);ctx.lineWidth=4;ctx.strokeStyle=C.bg;ctx.strokeText(txt,X,Y);ctx.fillStyle=((sel&&sel.t==='k'&&sel.v===k)||hovK===k)?C.sig:C.ink;ctx.fillText(txt,X,Y)}ctx.globalAlpha=1}
  // 지도: 지역 이름표 + 조준선
  if(m>.35){var a2=Math.min(1,(m-.35)/.65);ctx.font='700 10.5px "JetBrains Mono",ui-monospace,monospace';ctx.textAlign='center';ctx.textBaseline='middle';
   var keys=Object.keys(LAB);ctx.font='800 13.5px "Pretendard Variable",Pretendard,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
   keys.forEach(function(k){var pv=PM[k];if(!pv)return;var x=L.mx(LAB[k][0]),y=L.my(LAB[k][1]),cx2=L.mx(pv.cx),cy2=L.my(pv.cy);if(Math.hypot(x-cx2,y-cy2)<14)return;ctx.globalAlpha=a2*.5;ctx.strokeStyle=C.ink;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(cx2,cy2);ctx.stroke();ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(cx2,cy2,2.4,0,TWO);ctx.fill()});
   keys.forEach(function(k){var n=cnt[k]||0,txt=(k==='전국'?'전국·해외':k)+(n?'  '+n:''),x=L.mx(LAB[k][0]),y=L.my(LAB[k][1]),w=ctx.measureText(txt).width+18,h=24,on=selP===k,hv=hovP===k;
    PR[k]={x:x-w/2,y:y-h/2,w:w,h:h};ctx.globalAlpha=a2*(n||on?.97:.6);ctx.fillStyle=on?C.sig:'#fff';ctx.strokeStyle=on||hv?C.sig:C.ink;ctx.lineWidth=hv||on?2:1.3;
    ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x-w/2,y-h/2,w,h,12);else ctx.rect(x-w/2,y-h/2,w,h);ctx.fill();ctx.stroke();
    ctx.globalAlpha=a2;ctx.fillStyle=on?'#fff':(n?C.ink:C.sub);ctx.fillText(txt,x,y+.5)});
   if(selP&&PM[selP]){var pv=PM[selP],X=L.mx(pv.cx),Y=L.my(pv.cy);ctx.globalAlpha=a2*.7;ctx.strokeStyle=C.sig;ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(0,Y);ctx.lineTo(W,Y);ctx.moveTo(X,0);ctx.lineTo(X,H);ctx.stroke();ctx.setLineDash([]);ctx.lineWidth=2;ctx.beginPath();ctx.arc(X,Y,13,0,TWO);ctx.stroke();ctx.globalAlpha=1}
   ctx.globalAlpha=1}
 }
 resize();setText();
 (function(){var d=window.TODAY||'';var m2=/^(\d{4})-(\d\d)-(\d\d)$/.exec(d);var wk=A.ALL.filter(function(x){return x._d!==null&&x._d>=0&&x._d<=7}).length;$('liveT').innerHTML=(m2?m2[1]+'.'+m2[2]+'.'+m2[3]+' 기준':'')+'<br>접수 중 '+open+'건 · 이번 주 마감 '+wk+'건';
  var soon=A.ALL.filter(function(x){return x._d!==null&&x._d>=0&&x._d<=14}).sort(function(a,b){return a._d-b._d}).slice(0,16);
  var h2=soon.map(function(x){return '<a href="'+A.href(x)+'" target="_blank" rel="noopener"><em>D-'+x._d+'</em>'+A.esc(x.org)+' · '+A.esc(A.clean(x.title))+'</a>'}).join('');$('tk').innerHTML=h2+h2})();
 var mq=/[?&]mode=(\d)/.exec(location.search);if(mq&&mq[1]==='1'){mode=1;m=1;target=1;cv.classList.add('map');[].forEach.call(document.querySelectorAll('.top button'),function(b){b.classList.toggle('on',b.dataset.m==='1')});setText()}
 var sq=/[?&]sel=(.+?)(&|$)/.exec(location.search);if(sq){var v=decodeURIComponent(sq[1]);if(mode===0)select({t:'k',v:Number(v)});else select({t:'p',v:v})}
 requestAnimationFrame(frame);
})();

};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",_go);else _go()})();
