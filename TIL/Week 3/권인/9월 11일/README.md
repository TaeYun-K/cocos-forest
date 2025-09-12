# TIL - 2025년 9월 11일


## React Native Navigation & Header 구현

### React Navigation v7과 Bottom Tab Navigator

cocos-forest-fe 프로젝트에서 헤더와 네비게이션 바 구현

#### 주요 기술 스택
- **React Navigation v7**: 네비게이션 라이브러리
- **Bottom Tab Navigator**: 하단 탭 네비게이션 구현
- **Expo**: React Native 개발 플랫폼

#### 구현 특징

**1. 통합된 네비게이션 설정**
```typescript
const Tab = createBottomTabNavigator();

<NavigationContainer>
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#15803d',
      tabBarInactiveTintColor: '#6b7280',
      headerStyle: { backgroundColor: '#15803d' },
      headerTintColor: '#ffffff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
```

**2. 스크린별 개별 설정**
```typescript
<Tab.Screen 
  name="Dashboard" 
  component={DashboardScreen}
  options={{
    tabBarLabel: '대시보드',
    headerTitle: '대시보드',
  }}
/>
```

**3. StatusBar 연동**
```typescript
<StatusBar style="light" />
```

#### 핵심 인사이트

- **헤더와 탭바를 하나의 Navigator로 통합 관리**: 별도 컴포넌트 없이 React Navigation의 `screenOptions`로 일관된 헤더 스타일 적용
- **테마 색상 통일**: 브랜드 컬러(`#15803d`)를 헤더와 탭의 활성 상태에 동일하게 적용
- **StatusBar 연동**: `expo-status-bar`로 헤더 색상과 일치하는 상태바 설정

#### 장점
- 📦 **간결한 구조**: 별도의 헤더/네비게이션 컴포넌트 불필요
- 🎨 **일관된 디자인**: `screenOptions`로 모든 화면에 동일한 헤더 스타일 적용  
- 🔧 **유지보수성**: 색상/폰트 변경 시 중앙 집중식 관리 가능

#### 다른 방식과의 차이점
- **커스텀 헤더 컴포넌트** 방식 대신 React Navigation 내장 헤더 활용
- **복잡한 상태 관리** 없이 Navigation 옵션만으로 UI 구성

#### 프로젝트 의존성
```json
"@react-navigation/bottom-tabs": "^7.4.7",
"@react-navigation/native": "^7.1.17", 
"expo-status-bar": "~3.0.7",
"react-native-safe-area-context": "^5.6.1"
```

## 💡 배운 점
React Navigation은 단순한 라우팅 도구를 넘어 **앱 전체의 UI 구조를 결정하는 핵심 라이브러리**라는 것을 깨달았다. 특히 헤더와 탭바를 Navigator 레벨에서 관리하면 코드 복잡도를 크게 줄일 수 있다.

## 🔍 다음에 더 알아볼 것
- Stack Navigator와 Bottom Tab Navigator 중첩 사용법
- 커스텀 탭바 구현 방법
- React Navigation v7의 새로운 기능들