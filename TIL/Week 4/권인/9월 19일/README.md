# TIL - 2025년 9월 19일

## Expo(EAS CLI)를 사용한 React Native 앱 빌드(배포)방식과 React 웹프로젝트 배포와의 방식 차이

### React Native (Expo/EAS CLI) 빌드 과정

#### 1. EAS CLI 설치 및 설정
```bash
npm install -g eas-cli
eas login
eas build:configure
```

#### 2. 빌드 프로파일 설정 (eas.json)
```json
{
  "build": {
    "development": {
      "developmentClient": true
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

#### 3. 플랫폼별 빌드 실행
```bash
# Android APK/AAB 빌드
eas build --platform android --profile production

# iOS IPA 빌드 (Apple Developer 계정 필요)
eas build --platform ios --profile production
```


### React 웹프로젝트 배포 과정

#### 1. 빌드 실행
```bash
npm run build
# 또는
yarn build
```

#### 2. 정적 파일 생성
- HTML, CSS, JS 파일들이 `/build` 또는 `/dist` 폴더에 생성
- 브라우저에서 직접 실행 가능한 정적 파일들

#### 3. 웹 서버에 배포
```bash
# 다양한 배포 옵션
netlify deploy --prod
vercel --prod
aws s3 sync build/ s3://bucket-name
```

### 주요 차이점

| 구분 | React Native (Expo/EAS) | React Web |
|------|-------------------------|-----------|
| **빌드 결과물** | 네이티브 앱 파일 (APK, IPA) | 정적 웹 파일 (HTML, CSS, JS) |
| **배포 대상** | 앱스토어 (Google Play, App Store) | 웹 서버 (CDN, 호스팅 서비스) |
| **빌드 환경** | 클라우드 빌드 서버 필요 | 로컬 또는 CI/CD 환경 |
| **배포 승인** | 스토어 심사 과정 필요 | 즉시 배포 가능 |
| **업데이트** | 스토어 업데이트 또는 OTA 업데이트 | 서버 파일 교체로 즉시 반영 |
| **플랫폼** | iOS, Android 각각 빌드 | 모든 브라우저에서 동일 |
| **인증서** | Apple Developer, Android Keystore | SSL 인증서 (HTTPS) |

### EAS Build의 장점

1. **클라우드 빌드**: 로컬 환경 설정 불필요
2. **자동화**: CI/CD 파이프라인 통합 가능
3. **크로스 플랫폼**: 하나의 명령으로 양쪽 플랫폼 빌드
4. **OTA 업데이트**: JavaScript 코드 즉시 업데이트 가능

### 웹 배포의 장점

1. **즉시 배포**: 빌드 후 바로 사용자에게 제공
2. **간단한 과정**: 정적 파일 업로드만 필요
3. **비용 효율성**: 무료 호스팅 서비스 다수
4. **디버깅 용이**: 브라우저 개발자 도구 활용

## 느낀점

React Native와 웹 프로젝트의 배포 방식을 비교해보니, 각각의 플랫폼 특성에 맞는 고유한 프로세스가 있다는 것을 깨달았다. 웹은 즉시성과 단순함이 장점이지만, 모바일 앱은 더 복잡한 빌드 과정을 거치는 대신 네이티브 성능과 사용자 경험을 제공한다. EAS CLI를 사용하면 복잡한 네이티브 빌드 환경을 클라우드에서 처리할 수 있어 개발자 경험이 크게 개선된다는 점이 인상적이었다.