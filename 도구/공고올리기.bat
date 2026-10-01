@echo off
chcp 65001 >nul
rem 조사 봇이 export_site.py 로 자료/공고.json 을 새로 만든 뒤에 부른다.
rem 공고.json 하나만 올리고, 달라진 것이 없으면 아무것도 올리지 않는다.
rem 올리면 GitHub 가 알아서 사이트를 다시 만들어 인터넷에 반영한다 (1~2분).
cd /d "%~dp0.."
node 도구\점검.js
if errorlevel 1 (
  echo 점검에 걸려 올리지 않았습니다. 위의 이유를 고친 뒤 다시 하세요.
  exit /b 1
)
git add 자료/공고.json
git diff --cached --quiet
if %errorlevel%==0 (
  echo 공고 자료가 달라진 것이 없어 올리지 않습니다.
  exit /b 0
)
git commit -q -m "공고 자료 갱신 (조사 봇)"
git push -q origin main
if %errorlevel%==0 (
  echo 올렸습니다. 1~2분 뒤 사이트에 반영됩니다.
) else (
  echo 올리지 못했습니다. GitHub 로그인 상태를 확인하세요.
  exit /b 1
)
