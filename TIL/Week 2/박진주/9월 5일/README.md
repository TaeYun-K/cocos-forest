오늘 목표
- 프로젝트 README 초안 작성.
- 팀/역할/기술스택/개발 컨벤션 문서화.

수행
- 프로젝트 소개: 코코의 숲(Coco’s Forest) README 초안 작성.
- 금융 소비 분석 × 탄소 발자국 환산 × 챌린지 × 게임화 구조 설명.
- 선순환 구조: 소비 내역 → 탄소 발자국 → 챌린지 → 포인트 → 숲 성장.
- 팀 구성 표 작성: 팀원 이름, 역할(백엔드/프론트/디자인/인프라) 정리.
- 기술 스택 정리: Kotlin, Jetpack Compose, Coroutines, Hilt, Retrofit, Room, DataStore. 추가로 React - Native, Figma, Docker, Jenkins, AWS 등 팀 차원의 툴도 정리.

메인 화면 기능 정의:
- 숲을 2D 아이소메트릭 뷰로 표현.
- 초기 버전: 나무 1종.
- 챌린지 성공 → 포인트 사용법(씨앗 심기, 물주기).
- HP 기반 나무 상태 관리(건강/약간 시듦/심각).

코코 캐릭터: 왼쪽 상단 위치(랜덤 이동 확장 가능). 이벤트 발생 시 말풍선 피드백.

주요 기능 정리: 금융 연동/소비 분석, 챌린지/보상, 탄소 발자국 리포트, 스마트워치 연동.

안드로이드 개발팀 컨벤션 작성:
- 프로젝트 구조(패키지 분리: data, domain, presentation 등).
- 네이밍 규칙(클래스 PascalCase, 함수 camelCase, 상수 UPPER_SNAKE_CASE 등).
- Compose 컨벤션(Composable 함수명, Preview, UiState/UiEvent 패턴).
- ViewModel 패턴(UiState, Event, Effect 분리).
- Git 컨벤션(브랜치명 feature/…, 커밋 메시지 규칙).
- 파일명 컨벤션(Screen, ViewModel, Repository 등 접미사 일관화).
- 공통 컴포넌트 및 테마 관리.
- Hilt 모듈/Qualifier 규칙.
- 코드 리뷰 체크리스트.
- 공통 규칙(변수명 영어, 주석 최소, 리소스 통합 관리, 테스트 작성).

산출물/링크
- README.md 초안
- 기술 스택 배지 리스트
- 안드로이드 개발 컨벤션 문서

배운 점/메모
-README는 “처음 접하는 사람에게 프로젝트를 이해·실행시키는 문서” 역할. 핵심은 소개, 설치/실행, 기술 스택, 팀 구성.
- 공통 컨벤션을 개발 시작 전에 합의하면 협업 효율성↑.
- Git 브랜치/커밋 규칙 통일은 필수.

이슈/결정
- 플랫폼 표기 혼동: Kotlin+Compose vs React Native. 프론트 실제 구현 스택 확정 필요.
- 숲 표현 방식 확실한 결정 필요.

내일 할 일
- README 실행 방법 섹션 작성.
- 스크린샷/와이어프레임 이미지 추가.
- GitHub 저장소 초기 커밋 반영.