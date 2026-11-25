// 시안 공통: 공고를 기관 단계(중앙→광역→시군구→민간)로 분류하고 정렬한다. (시안 B 이후 모든 시안이 같이 쓴다)
(function(){
  var N=window.NOTICES||[], TODAY=window.TODAY;
  var CENTRAL=['문화체육관광부','한국문화예술위원회','한국예술인복지재단','예술경영지원센터','한국콘텐츠진흥원','영화진흥위원회','국립아시아문화전당','한국장애인문화예술원','한국문화예술회관연합회'];
  var CENTRAL_RE=/문화체육관광부|한국문화예술위원회|한국예술인복지재단|예술경영지원센터|한국콘텐츠진흥원|영화진흥위원회|국립|한국장애인문화예술원|한국문화예술회관연합회|문화원연합회|진흥원/;
  var METRO=['서울','경기','인천','부산','대구','대전','광주','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주'];
  var KW={연극:/연극|공연|극단|배우|뮤지컬|오디션|무대|연희|퍼포먼스/,무용:/무용|춤|댄스|안무|전통춤|발레/,음악:/음악|국악|연주|콘서트|합창|작곡|밴드|뮤지션|소리|가야금/,미술:/미술|전시|작가|조형|회화|조각|사진|갤러리|아트|공예|디자인/,문학:/문학|도서|시인|소설|출판|글쓰기|책|원고/,영상:/영상|영화|미디어|다큐|애니|웹툰|콘텐츠|방송/};
  var TIERS=[{t:1,name:'중앙 정부·공공기관',short:'중앙·공공'},{t:2,name:'광역 지자체·재단',short:'광역'},{t:3,name:'시·군·구 지자체와 재단',short:'시·군·구'},{t:4,name:'민간·협회·기타',short:'민간·기타'}];
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function clean(t){return String(t).replace(/<[^>]*>/g,'')}
  function dday(d){ if(!/^\d{4}-\d\d-\d\d$/.test(d)) return null; return Math.round((new Date(d+'T00:00:00')-new Date(TODAY+'T00:00:00'))/864e5) }
  function md(d){var m=/^\d{4}-(\d\d)-(\d\d)$/.exec(d);return m?Number(m[1])+'/'+Number(m[2]):d}
  var PROVS='서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주';
  var DO_FULL=/^(경상북도|경상남도|충청북도|충청남도|전라북도|전라남도|강원특별자치도|강원도|경기도|제주특별자치도|전북특별자치도)/;
  var DO_MAP={경상북도:'경북',경상남도:'경남',충청북도:'충북',충청남도:'충남',전라북도:'전북',전라남도:'전남',강원특별자치도:'강원',강원도:'강원',경기도:'경기',제주특별자치도:'제주',전북특별자치도:'전북'};
  var CITY={마포:'서울',중랑:'서울',강남:'서울',종로:'서울',강북:'서울',구로:'서울',은평:'서울',안산:'경기',군포:'경기',광명:'경기',오산:'경기',하남:'경기',과천:'경기',용인:'경기',수원:'경기',성남:'경기',고양:'경기',구리:'경기',파주:'경기',시흥:'경기',안성:'경기',부평:'인천',남동:'인천',미추홀:'인천',영도:'부산',전주:'전북',남원:'전북',완주:'전북',충주:'충북',청주:'충북',공주:'충남',아산:'충남',천안:'충남',보령:'충남',김해:'경남',창원:'경남',의령:'경남',삼척:'강원',강릉:'강원',춘천:'강원',영주:'경북',포항:'경북',경주:'경북',문경:'경북',칠곡:'경북',울진:'경북',달서:'대구',순천:'전남',여수:'전남',나주:'전남',보성:'전남',강진:'전남',진도:'전남'};
  function sido(o){var m=DO_FULL.exec(o);if(m)return DO_MAP[m[1]];var r=new RegExp('^('+PROVS+')').exec(o);return r?r[1]:null}
  function cityOf(o){for(var k in CITY){if(o.indexOf(k)>=0)return CITY[k]}return null}
  // 광역(시·도) 단위 기관인지: 광역 지자체, 도청, 광역 소속 재단·공단·위원회·시립 시설
  function metroOf(x){var o=x.org,m=sido(o);if(!m)return null;
    if(/^(경상북도|경상남도|충청북도|충청남도|전라북도|전라남도|강원특별자치도|강원도|경기도|제주특별자치도|전북특별자치도)(청)?(\s|$)/.test(o)&&!/시청|군청|구청/.test(o.replace(/^.{3,8}도(청)?/, ''))) return m;
    if(/^(서울|부산|대구|인천|광주|대전|울산|세종)(시|특별시|광역시)?$/.test(o)) return m;
    if(/^(서울|부산|대구|인천|광주|대전|울산)(특별시|광역시)?\s?\S+구(청)?$/.test(o)) return null;
    if(/구청|군청/.test(o)) return null;
    if(/문화재단|문화관광재단|문화예술재단|문화예술진흥원|특별|광역|시설공단|예술인의 집|영상위원회|시립|도청|시청$|문화원$/.test(o)){
      if(/시청$/.test(o)&&!/^(제주|서울|부산|대구|인천|광주|대전|울산|세종)/.test(o))return null;
      return m}
    return null}
  function classify(x){var o=x.org;
    if(/^(CJ|NC|KT|㈜|\(주\)|주식회사)/.test(o)) return {t:4,g:'민간·기타',ord:0};
    if(CENTRAL_RE.test(o)&&!sido(o)){var ci=CENTRAL.indexOf(o);return {t:1,g:o,ord:ci<0?50:ci}}
    if(/아트센터/.test(o)&&!cityOf(o)&&!sido(o)) return {t:4,g:'민간·기타',ord:0};
    var m=metroOf(x);if(m) return {t:2,g:m,ord:METRO.indexOf(m)};
    if(/시청|구청|군청|문화재단|문화관광재단|문화예술회관|예술회관|아트센터|평생학습|문화원|^.{2,4}시$|^.{2,4}군$|^.{2,4}구$|\S+구$/.test(o)){
      var r=x.region&&x.region!=='전국'&&METRO.indexOf(x.region)>=0?x.region:(sido(o)||cityOf(o)||'기타 지역');var ri=METRO.indexOf(r);return {t:3,g:r,ord:ri<0?99:ri}}
    return {t:4,g:'민간·기타',ord:0}}
  // 구분: 채용·구인 / 위원 모집 / 기관·사업자 대상 / 오디션 / 그 밖(지원·공모). 제목 글자로 가른다(앞에서부터 맞는 첫 번째).
  var KINDS=[['지원','지원·공모'],['오디션','오디션'],['채용','채용·구인'],['위원','위원 모집'],['기관','기관·사업자 대상']];
  var KRX=[['채용',/채용|구인|직원\s*(모집|공개)|인력\s*(모집|채용)|스태프\s*모집|계약직|기간제|인턴|공무직|사무직|강사\s*(모집|채용|공개)|서비스인력|운영요원|근로자/],['위원',/위원\s*(모집|위촉|공모|추천|선정)|(심사|자문|평가|운영|선정|추진|전문)\s*위원|위원단|서포터즈\s*모집/],['기관',/수탁|위탁\s*(운영|기관|사업)|운영\s*(자|기관|법인|단체)\s*(모집|선정|공모)|징수단체|협력\s*(기관|전시|단체)|배급사|참여\s*기관|사업자\s*(모집|선정)|입점|업체\s*(모집|선정)|용역|제안서|대행사|운영자\s*공모|보조사업자|수행기관|참여기업|참가기업|기업\s*(모집|공모)/],['오디션',/오디션|단원\s*(모집|공개)|(배우|출연자|출연진|연주자|합창단원|모델)\s*(모집|공개)|캐스팅/]];
  function kindOf(x){var t=clean(x.title);for(var i=0;i<KRX.length;i++){if(KRX[i][1].test(t))return KRX[i][0]}return '지원'}
  N.forEach(function(x){var c=classify(x);x._t=c.t;x._g=c.g;x._o=c.ord;x._d=dday(x.deadline);x._k=kindOf(x)});
  function cmp(a,b){if(a._t!==b._t)return a._t-b._t;if(a._o!==b._o)return a._o-b._o;if(a._g!==b._g)return a._g<b._g?-1:1;var da=a._d===null?9999:a._d,db=b._d===null?9999:b._d;return da-db}
  var ALL=N.slice().sort(cmp);
  function groups(items){var order=[],map={};items.forEach(function(x){var k=x._t+'|'+x._g;if(!map[k]){map[k]={key:k,t:x._t,g:x._g,items:[]};order.push(k)}map[k].items.push(x)});return order.map(function(k){return map[k]})}
  function fieldMatch(x,f){return !f||KW[f].test(clean(x.title)+' '+x.org)}
  function regionMatch(x,r){return !r||x._t===1||x.region===r||x._g===r||x.region==='전국'}
  function deadlineText(x){return x._d===null?'상시 접수':md(x.deadline)+' 마감'}
  window.AC={ALL:ALL,TIERS:TIERS,KW:KW,METRO:METRO,esc:esc,clean:clean,md:md,groups:groups,fieldMatch:fieldMatch,KINDS:KINDS,regionMatch:regionMatch,deadlineText:deadlineText,href:function(x){return (window.__BASE||'')+'/notice/'+x.id+'/'}};
})();
