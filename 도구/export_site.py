"""구글시트 '공고' 탭 → 공개 사이트가 읽는 자료/공고.json 으로 내보낸다.

조사 봇(art-support-bot)이 수집·요약·지원내용을 채운 뒤에 이 스크립트를 돌리면 된다.
사이트 쪽은 이 파일만 읽는다. 시트 구조가 바뀌어도 여기만 고치면 사이트는 그대로다.

사용
  봇 저장소 안에서 (시트 연결: 환경변수 SHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON)
      python export_site.py --out ../site-data/공고.json
  이 PC에서 시험할 때 (내려받은 엑셀로)
      python export_site.py --xlsx 예술지원사업_봇.xlsx --out 자료/공고.json

사이트에 올리는 기준 (영감 결정 2026-09-28: 확인된 것만)
  - 마감일이 날짜이거나 '상시' 여야 한다. '확인 필요'·빈칸은 뺀다.
  - 이미 마감일이 지난 것은 뺀다.
  - 원문 링크(http...)가 있어야 한다.
  - 같은 공고(키가 같은 것)는 한 번만 싣는다.

내보내는 칸(공고.json 의 한 건)
  id        시트의 '키'로 만든 8자리 번호 (주소에 쓰인다. 같은 공고는 늘 같은 번호)
  cat       분류          org      기관        region   권역(없으면 빈 글자)
  title     공고 제목     deadline 마감일(YYYY-MM-DD 또는 '상시')
  target    지원대상      link     원문 링크   posted   게시일(없으면 빈 글자)
  summary   요약       한두 문장. 어떤 사업인지, 누구를 위한 것인지.
  benefit   지원내용   한 줄. 지원금액·혜택·기간 (예: "최대 500만 원 · 창작준비금 지급")
"""
import argparse
import datetime as dt
import hashlib
import json
import re
import sys

날짜형 = re.compile(r"\d{4}-\d{2}-\d{2}")


def 글(v):
    if v is None:
        return ""
    if isinstance(v, (dt.datetime, dt.date)):
        return v.strftime("%Y-%m-%d")
    return str(v).strip()


def 표에서_공고만(값들, 기준일=None):
    """값들: 머리글 한 줄 + 데이터 줄들 (시트의 get_values 결과와 같은 모양)."""
    기준일 = 기준일 or dt.date.today().isoformat()
    머리 = [글(h) for h in 값들[0]]
    칸 = {이름: i for i, 이름 in enumerate(머리)}

    def 꺼내기(줄, 이름):
        i = 칸.get(이름)
        return 글(줄[i]) if i is not None and i < len(줄) else ""

    나감, 뺀, 본키 = [], {"지난 공고": 0, "마감일 확인 필요": 0, "링크 없음": 0, "중복": 0}, set()
    for 줄 in 값들[1:]:
        if not any(글(c) for c in 줄):
            continue
        마감, 링크 = 꺼내기(줄, "마감일"), 꺼내기(줄, "링크")
        if 마감 != "상시" and not 날짜형.fullmatch(마감):
            뺀["마감일 확인 필요"] += 1
            continue
        if 날짜형.fullmatch(마감) and 마감 < 기준일:
            뺀["지난 공고"] += 1
            continue
        if not re.match(r"https?://", 링크):
            뺀["링크 없음"] += 1
            continue
        키 = 꺼내기(줄, "키") or (꺼내기(줄, "기관") + 꺼내기(줄, "공고 제목"))
        번호 = hashlib.sha1(키.encode("utf-8")).hexdigest()[:8]
        if 번호 in 본키:
            뺀["중복"] += 1
            continue
        본키.add(번호)
        나감.append({
            "id": 번호, "cat": 꺼내기(줄, "분류"), "org": 꺼내기(줄, "기관"), "region": 꺼내기(줄, "권역"),
            "title": 꺼내기(줄, "공고 제목"), "deadline": 마감, "target": 꺼내기(줄, "지원대상"),
            "link": 링크, "posted": 꺼내기(줄, "게시일"),
            "summary": 꺼내기(줄, "요약"), "benefit": 꺼내기(줄, "지원내용"),
        })
    나감.sort(key=lambda x: (x["deadline"] == "상시", x["deadline"]))
    return 나감, 뺀


def 보고서(나감, 뺀, 기준일):
    n = len(나감)
    요약 = sum(1 for x in 나감 if x["summary"])
    혜택 = sum(1 for x in 나감 if x["benefit"])
    print(f"기준일 {기준일} · 사이트에 올릴 공고 {n}건 (상시 {sum(1 for x in 나감 if x['deadline'] == '상시')}건)")
    print(f"  요약 있음 {요약}/{n}   지원내용 있음 {혜택}/{n}")
    print(f"  뺀 것 {뺀}")
    if n and (요약 < n or 혜택 < n):
        print("  ※ 비어 있는 요약·지원내용은 사이트에 '준비 중'으로 나온다. 마감이 가까운 것부터 채우는 것이 좋다.")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--out", required=True, help="만들어질 공고.json 경로")
    p.add_argument("--xlsx", help="시트를 내려받은 엑셀(시험용). 없으면 구글시트에서 바로 읽는다")
    a = p.parse_args()

    if a.xlsx:
        import openpyxl
        값들 = [list(r) for r in openpyxl.load_workbook(a.xlsx, data_only=True)["공고"].iter_rows(values_only=True)]
    else:
        from store import open_store          # 봇 저장소 안에서 돌릴 때
        값들 = open_store().get_values("공고")

    기준일 = dt.date.today().isoformat()
    나감, 뺀 = 표에서_공고만(값들, 기준일)
    with open(a.out, "w", encoding="utf-8") as f:
        json.dump(나감, f, ensure_ascii=False, indent=1)
    보고서(나감, 뺀, 기준일)


if __name__ == "__main__":
    sys.exit(main())
