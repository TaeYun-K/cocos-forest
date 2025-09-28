# TIL - 2025년 9월 26일

## 내려서 새로고침(Pull to Refresh) 기능 원리

### React Native의 RefreshControl

```typescript
import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, View, Text } from 'react-native';

const RefreshableScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // API 호출로 데이터 새로고침
      const newData = await fetchLatestData();
      setData(newData);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#9Bd35A', '#689F38']} // Android
          tintColor="#689F38" // iOS
        />
      }
    >
      {data.map(item => (
        <View key={item.id}>
          <Text>{item.title}</Text>
        </View>
      ))}
    </ScrollView>
  );
};
```

### FlatList에서 Pull to Refresh

```typescript
import { FlatList } from 'react-native';

const RefreshableFlatList = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const refreshedData = await apiCall();
      setData(refreshedData);
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }) => (
    <View>
      <Text>{item.name}</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};
```

### 커스텀 Pull to Refresh 애니메이션

```typescript
import { Animated, PanGestureHandler, GestureHandlerRootView } from 'react-native-reanimated';

const CustomPullToRefresh = () => {
  const translateY = useSharedValue(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      // 아래로 당길 때만 동작
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    },
    onEnd: (event) => {
      // 임계값(80px) 이상 당겼을 때 새로고침 실행
      if (event.translationY > 80) {
        runOnJS(triggerRefresh)();
      } else {
        translateY.value = withSpring(0);
      }
    },
  });

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    translateY.value = withSpring(0);
  };

  return (
    <GestureHandlerRootView>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.container, animatedStyle]}>
          {/* 새로고침 인디케이터 */}
          {isRefreshing && <ActivityIndicator />}
          {/* 콘텐츠 */}
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};
```

### 최적화된 새로고침 패턴

```typescript
const useRefreshWithCache = (fetchFunction) => {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(0);

  const refresh = useCallback(async (force = false) => {
    const now = Date.now();
    // 5초 내 중복 새로고침 방지
    if (!force && now - lastRefresh < 5000) {
      return;
    }

    setRefreshing(true);
    try {
      const newData = await fetchFunction();
      setData(newData);
      setLastRefresh(now);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchFunction, lastRefresh]);

  return { data, refreshing, refresh };
};
```

## 느낀점

Pull to Refresh 기능의 내부 동작 원리를 이해하니 사용자 경험을 개선할 수 있는 다양한 방법들이 보였다. 특히 스크롤 위치 감지, 제스처 처리, 애니메이션 연동이 어떻게 조합되는지 알게 되었고, 중복 호출 방지나 적절한 로딩 상태 표시 등 세심한 부분까지 고려해야 한다는 것을 배웠다.