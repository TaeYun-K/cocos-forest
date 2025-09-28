# TIL - 2025년 9월 23일

## Expo 프로젝트에서 폰트 적용

### expo-font 라이브러리 사용

```bash
npx expo install expo-font
```

### 폰트 파일 추가 및 로드

```typescript
// App.tsx
import { useFonts } from 'expo-font';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Hakgyoansim_EohangkkumigiOTFB': require('./assets/fonts/Hakgyoansim_EohangkkumigiOTFB.otf'),
    'Jalnan2': require('./assets/fonts/Jalnan2.otf'),
  });

  return <YourApp />;
}
```

## 느낀점

Expo에서 폰트를 적용하는 과정이 웹보다 훨씬 간단했다. useFonts 훅을 사용하면 폰트 로딩 상태를 쉽게 관리할 수 있고, 한글 폰트도 문제없이 적용되어 앱의 시각적 완성도를 높일 수 있었다.