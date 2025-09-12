// index.ts (최종 버전)
import { registerRootComponent } from 'expo';

// 앱이 실행되기 전에 웹 API 폴리필을 먼저 적용합니다.
import './msw.polyfills';

// MSW 로직 없이 App 컴포넌트를 바로 등록합니다.
import App from './App';

registerRootComponent(App);