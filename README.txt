artistcoach 공개 사이트 (정적)
=============================

바탕화면 폴더의 '사이트-미리보기.bat' 을 더블클릭하면
  1) 사이트를 새로 만들고  2) 브라우저가 http://localhost:4000 으로 열린다.

폴더 구조
  자료/공고.json   조사 봇이 구글시트에서 내보낸 '확인된 공고' (마감일·원문 링크가 있는 것만)
  도구/export_site.py   시트 → 공고.json 내보내기. 조사 봇 저장소에서 돌린다 (0000_조사봇 요청서.txt 참고)
  색.json          브랜드 색 두 개 (bg, brand). 이것만 바꾸면 로고·아이콘·전체 색이 같이 바뀐다.
  만들기.js        사이트 생성기 (노드만 있으면 됨, 설치할 것 없음)
  미리보기.js      이 PC에서 미리 보는 작은 서버
  원본/            아이콘 PNG 등 그대로 복사되는 파일
  결과/            ★ 완성된 사이트. 이 폴더를 인터넷에 올리면 된다. (기록에는 남기지 않음)

자료가 만들어지는 길
  조사 봇이 수집 → 요약·지원내용 채움 → export_site.py 로 공고.json 내보냄 → 여기서 만들기.js 로 사이트 생성

앞으로 이어서 할 것
  1. 조사 봇이 공고.json 을 매일 자동으로 내보내게 묶기 (요청서를 보냈음, 2026-10-01)
  2. 인터넷에 올리기: artistcoach.kr 에 연결 (가비아 DNS 에 레코드만 추가, 메일은 건드리지 않는다)
  3. 요약·지원내용 채우기 (조사 봇 담당. 지금 228건 중 요약 12건, 지원내용 0건) · 분야 칸은 아직 없음
  4. 개인정보처리방침·이용약관, 알림 신청(이메일 받기)

규칙
  - 마감일과 원문 링크가 확인된 공고만 올린다.
  - 요약은 위아츠 문장이 아니라 기관 원문에서 새로 쓴다.
  - 색은 주황이 아니라 마젠타 한 톤. 노랑·파랑·초록은 쓰지 않는다.


인터넷에 올리기 (2026-10-01 시작)
================================
  저장소   https://github.com/bbobbo79sh-bot/artistcoach-site  (공개)
  임시 주소 https://bbobbo79sh-bot.github.io/artistcoach-site/
  진짜 주소 https://artistcoach.kr  (가비아 DNS 연결 뒤)

  자동으로 돌아가는 때
    - 이 저장소에 올릴 때마다 (자료/공고.json 이나 사이트 파일)
    - 매일 아침 7시 30분 (한국시간). 마감 지난 공고를 정리하고 D-day 를 오늘 기준으로 새로 만든다.
    - 손으로: GitHub 의 Actions 탭 → '사이트 만들어 올리기' → Run workflow

  도메인을 연결하는 순서
    1) 가비아 DNS 에 레코드 추가
         A      @     185.199.108.153
         A      @     185.199.109.153
         A      @     185.199.110.153
         A      @     185.199.111.153
         CNAME  www   bbobbo79sh-bot.github.io
       (메일용 MX·TXT 레코드는 그대로 둔다. 건드리지 않는다.)
    2) 주소가 열리면 저장소에 도메인을 알린다
         gh api -X PUT repos/bbobbo79sh-bot/artistcoach-site/pages -f cname=artistcoach.kr
    3) 임시 주소용 기준 경로를 지운다 (지워야 진짜 주소에서 링크가 맞는다)
         gh variable delete SITE_BASE -R bbobbo79sh-bot/artistcoach-site
    4) 다시 올린다 (Actions → Run workflow) 그리고 HTTPS 강제
         gh api -X PUT repos/bbobbo79sh-bot/artistcoach-site/pages -F https_enforced=true

  공고 자료는 조사 봇이 자료/공고.json 을 이 저장소에 올리는 것으로 갱신한다.
  (봇이 이 저장소에 올릴 수 있는 권한(토큰)은 영감이 GitHub 금고에 직접 넣는다. 채팅에 받지 않는다.)
