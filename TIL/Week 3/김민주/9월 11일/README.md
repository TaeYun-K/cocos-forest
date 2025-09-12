## 9/11 (목) - Android 개발 환경 설정 및 빌드 에러 해결

### 오늘 한 일
최종 디렉토리 구조에 코드를 적용하여 테스트를 진행하던 중 빌드 에러가 발생하여 Android Studio 개발 환경을 재설정했다.

### 발생한 문제들
- Java 버전 호환성 문제 (JDK 24 → 17 다운그레이드)
- Gradle 빌드 실패
- Android SDK 경로 설정 오류
- 환경변수 설정 누락

### 해결 과정
1. **Java JDK 버전 변경**: JDK 24에서 17로 다운그레이드
   - Gradle과의 호환성 문제 해결
   - JAVA_HOME 환경변수 재설정

2. **Android SDK 설정**: API 34 (Android 14) 설치
   - ANDROID_HOME 환경변수 설정
   - PATH에 platform-tools 추가
   - local.properties 파일 생성

3. **Gradle 캐시 정리**: 손상된 빌드 캐시 삭제

### 배운 점
React Native CLI 개발 시 환경 설정의 중요성을 체감했다. 특히 Java 버전 호환성과 Android SDK 경로 설정이 빌드 성공의 핵심이다. 에러 로그를 꼼꼼히 분석하는 습관이 중요하다.