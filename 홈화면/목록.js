// 공고 목록 화면(/notices/): 기관 순서(중앙 → 광역 → 시·군·구 → 민간), 장르·지역·마감·검색으로 좁힌다.
(function(){
 var go=function(){
 var A=AC,$=function(i){return document.getElementById(i)};
 var F=[['','전체'],['연극','연극·공연'],['무용','무용·전통춤'],['음악','음악·국악'],['미술','미술·전시'],['문학','문학·출판'],['영상','영상·미디어']];
 var R=['전체','서울','경기','인천','부산','대구','광주','대전','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주'];
 var P=[['','전체'],['0','오늘 마감'],['3','3일 이내'],['7','7일 이내'],['30','30일 이내'],['상시','상시 접수']];
 var st={f:'',r:'전체',p:'',q:'',open:{}};
 function chips(id,arr,key,get){$(id).innerHTML=arr.map(function(a){var val=get?get(a):a,lab=get?a[1]:a;return '<button class="chip'+(st[key]===val?' on':'')+'" data-k="'+key+'" data-v="'+val+'">'+lab+'</button>'}).join('')}
 function periodOk(x){var v=st.p;if(!v)return true;if(v==='상시')return x._d===null;if(x._d===null)return false;return v==='0'?x._d===0:x._d<=Number(v)}
 var ICON=['','🏛️','🗺️','🏘️','🎪'];
 function build(){chips('fF',F,'f',function(a){return a[0]});chips('fR',R,'r');chips('fP',P,'p',function(a){return a[0]});
  var items=A.ALL.filter(function(x){if(x._d!==null&&x._d<0)return false;if(!A.fieldMatch(x,st.f))return false;if(st.r!=='전체'&&!A.regionMatch(x,st.r))return false;if(!periodOk(x))return false;if(st.q&&(A.clean(x.title)+' '+x.org).toLowerCase().indexOf(st.q.toLowerCase())<0)return false;return true});
  var gs=A.groups(items),out='',last=0,tc={};items.forEach(function(x){tc[x._t]=(tc[x._t]||0)+1});
  gs.forEach(function(g){if(g.t!==last){if(last)out+='</div>';last=g.t;var tn=A.TIERS.filter(function(t){return t.t===g.t})[0];out+='<div class="tier" id="tier-'+g.t+'"><span><span class="ic">'+ICON[g.t]+'</span><b>'+tn.name+'</b></span><small>'+tc[g.t]+'건</small></div><div class="tbody">'}
   var key=g.key,lim=st.open[key]?999:5;
   out+='<div class="grp"><h3>'+A.esc(g.g)+'<small>'+g.items.length+'건</small></h3>'+g.items.slice(0,lim).map(function(x){var d=x._d,dl=d===null?'상시 접수':A.md(x.deadline)+' 마감';return '<a class="row" href="'+A.href(x)+'"><span class="t">'+A.esc(A.clean(x.title))+'</span><span class="o">'+A.esc(x.org)+'</span><span class="d">'+dl+(d!==null&&d<=7?'<i>D-'+d+'</i>':'')+'</span></a>'}).join('')+(g.items.length>5&&!st.open[key]?'<button class="more" data-more="'+key+'">'+(g.items.length-5)+'건 더 보기</button>':'')+'</div>'});
  if(last)out+='</div>';
  $('fJ').innerHTML=A.TIERS.filter(function(t){return tc[t.t]}).map(function(t){return '<a class="chip" style="text-decoration:none;display:inline-block" href="#tier-'+t.t+'">'+t.short+' '+tc[t.t]+'</a>'}).join('');
  $('list').innerHTML=out||'<div class="없음글">조건에 맞는 공고가 없어요.</div>';$('cn').textContent='총 '+items.length+'건 · 기관 순서(중앙 → 광역 → 시·군·구 → 민간), 같은 기관 안에서는 마감이 빠른 순서'}
 document.addEventListener('click',function(e){var c=e.target.closest('.새목록 .chip[data-k]');if(c){st[c.dataset.k]=c.dataset.v;build();return}var m=e.target.closest('.새목록 [data-more]');if(m){st.open[m.dataset.more]=1;build()}});
 $('q').addEventListener('input',function(){st.q=this.value.trim();build()});
 var qs=/[?&]r=([^&]+)/.exec(location.search);if(qs){var r=decodeURIComponent(qs[1]);if(R.indexOf(r)>=0)st.r=r}
 var fs=/[?&]f=([^&]+)/.exec(location.search);if(fs){var f=decodeURIComponent(fs[1]);if(F.some(function(a){return a[0]===f}))st.f=f}
 build();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
