# TIL - 2025년 9월 8일

## React Native vs React 차이점과 디자인패턴

### 1. 플랫폼과 렌더링
- **React**: DOM을 사용하여 웹 브라우저에 렌더링
- **React Native**: 네이티브 컴포넌트로 변환되어 iOS/Android에 렌더링

### 2. 컴포넌트 차이
```jsx
// React
<div>
  <h1>제목</h1>
  <p>내용</p>
</div>

// React Native
<View>
  <Text style={{fontSize: 20, fontWeight: 'bold'}}>제목</Text>
  <Text>내용</Text>
</View>
```

### 3. 스타일링
- **React**: CSS, CSS-in-JS, SCSS 등 다양한 방식
- **React Native**: StyleSheet API 또는 인라인 스타일 (Flexbox 기반)

```jsx
// React Native 스타일링
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
```

### 4. 네비게이션
- **React**: React Router DOM
- **React Native**: React Navigation 또는 네이티브 네비게이션

## 느낀점

React Native를 처음 접했을 때 가장 놀라웠던 것은 웹 개발 경험을 그대로 모바일로 가져올 수 있다는 점이었다. 하지만 실제로 사용해보니 네이티브 특성상 성능 최적화나 플랫폼별 차이점을 고려해야 하는 부분이 많았다.