### 2025-09-26

Expo/Gradle - 빌드 오류 트러블슈팅

오늘은 React Native(Expo) 프로젝트를 Android 빌드할 때 발생하는 Gradle 오류를 확인했다.

환경 변수 로드: .env에서 EXPO_PUBLIC_API_BASE_URL 등 환경 변수를 정상적으로 불러와야 한다.

Gradle 버전 충돌: build.gradle에서 buildTools, compileSdk, targetSdk 버전이 맞지 않으면 빌드가 실패한다.

problems-report.html 파일이 생성되어 원인 분석에 도움을 준다.

👉 빌드 오류가 나면 먼저 .env 로드 여부와 Gradle SDK 버전 호환성을 확인해야 한다.
