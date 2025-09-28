# TIL - 2025년 9월 24일

## React Native 컴포넌트 마운트, 렌더링 순서와 생명주기

### 컴포넌트 생명주기 순서

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

const MyComponent = () => {
  const [data, setData] = useState(null);

  // 1. 컴포넌트 마운트 시 실행
  useEffect(() => {
    console.log('Component mounted');

    // API 호출 등 초기화 작업
    fetchData();

    // 클린업 함수 (언마운트 시 실행)
    return () => {
      console.log('Component unmounted');
    };
  }, []); // 빈 배열: 마운트 시 한 번만 실행

  // 2. 특정 상태 변경 시 실행
  useEffect(() => {
    console.log('Data changed:', data);
  }, [data]); // data가 변경될 때마다 실행

  const fetchData = async () => {
    // 데이터 로딩...
    setData('loaded data');
  };

  // 3. 렌더링
  return (
    <View>
      <Text>{data || 'Loading...'}</Text>
    </View>
  );
};
```

### 렌더링 최적화

```typescript
import React, { memo, useMemo, useCallback } from 'react';

const OptimizedComponent = memo(({ items, onItemPress }) => {
  // 비용이 큰 계산을 메모이제이션
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  // 함수를 메모이제이션하여 불필요한 리렌더링 방지
  const handlePress = useCallback((id) => {
    onItemPress(id);
  }, [onItemPress]);

  return (
    <View>
      <Text>Total: {expensiveValue}</Text>
      {items.map(item => (
        <TouchableOpacity key={item.id} onPress={() => handlePress(item.id)}>
          <Text>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});
```

### 부모-자식 컴포넌트 렌더링 순서

```
1. 부모 컴포넌트 렌더링 시작
2. 자식 컴포넌트들 순차적 렌더링
3. 자식 컴포넌트들의 useEffect 실행
4. 부모 컴포넌트의 useEffect 실행
```

## 느낀점

React Native의 생명주기를 이해하니 성능 최적화와 메모리 누수 방지에 대한 개념이 명확해졌다. 특히 useEffect의 의존성 배열과 클린업 함수의 중요성을 깨달았고, memo와 useMemo를 적절히 사용하면 불필요한 리렌더링을 방지할 수 있다는 것을 확인했다.