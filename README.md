# iM브릿지 · iM뱅크 설문 사이트

정적 HTML/CSS/JS 한 파일(`index.html`)로 만든 설문 웹사이트입니다.
프레임워크나 빌드 과정이 필요 없어서 바로 Vercel에 올릴 수 있어요.

## 배포 방법 (가장 쉬운 방법 — GitHub 연동)

1. **GitHub에 저장소 만들기**
   - github.com 에서 New repository (예: `im-bridge-survey`)
   - 이 폴더의 `index.html` 파일을 업로드 (드래그 앤 드롭으로 가능)

2. **Vercel 가입 및 연결**
   - vercel.com → GitHub 계정으로 로그인
   - "Add New Project" → 방금 만든 저장소 선택
   - Framework Preset은 "Other" (또는 자동 감지된 대로) 그대로 두고 Deploy 클릭
   - 별도 빌드 설정 필요 없음 — 정적 파일이라 그대로 배포됨

3. **1분 후 완료**
   - `프로젝트명.vercel.app` 형태의 URL이 생성됩니다
   - 이후 GitHub에 새로 push할 때마다 자동으로 재배포됩니다

## 배포 방법 (더 빠른 방법 — CLI, GitHub 없이)

터미널에 Node.js가 설치되어 있다면:

```bash
npm install -g vercel
cd im-bridge-survey
vercel
```

질문에 엔터만 눌러 기본값으로 진행하면 몇 초 안에 URL이 발급됩니다.
이후 수정하고 다시 배포하려면 `vercel --prod` 실행.

## 파일 구성

- `index.html` — 랜딩 페이지 + 6단계 설문 흐름 + 완료 페이지가 모두 담긴 단일 파일
  (CSS와 JS가 내부에 포함되어 있어 파일 하나만 있으면 동작합니다)

## 다음에 추가하면 좋은 것

- 응답 저장: 지금은 응답이 브라우저에만 남고 서버로 전송되지 않습니다.
  실제 데이터 수집이 필요하면 Google Sheets API, Supabase, 또는 Vercel의
  서버리스 함수(`/api` 폴더)를 연결해서 응답을 저장하는 로직을 추가해야 합니다.
- 커스텀 도메인: Vercel 프로젝트 설정 → Domains 에서 무료로 연결 가능합니다.
