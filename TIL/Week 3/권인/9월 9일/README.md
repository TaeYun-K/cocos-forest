# TIL - 2025년 9월 9일

## 컴포넌트 구조화 전략

### 1. 기본 컴포넌트 분류
```
src/
├── components/
│   ├── common/          # 재사용 가능한 공통 컴포넌트
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Modal/
│   ├── ui/              # UI 전용 컴포넌트
│   └── layout/          # 레이아웃 컴포넌트
├── screens/             # 화면 단위 컴포넌트
├── navigation/          # 네비게이션 관련
└── hooks/              # 커스텀 훅
```

### 2. 컴포넌트별 파일 구조
```
Button/
├── index.ts             # export 전용
├── Button.tsx           # 메인 컴포넌트
├── Button.styles.ts     # 스타일 정의
├── Button.types.ts      # 타입 정의
└── Button.test.tsx      # 테스트 파일
```

### 3. 컴포넌트 작성 패턴
```tsx
// Button.types.ts
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

// Button.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#F2F2F7',
  },
  // ...
});

// Button.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { ButtonProps } from './Button.types';
import { styles } from './Button.styles';

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant]]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};

// index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
```


## 느낀점

React Native 프로젝트를 여러 개 진행하면서 가장 중요하다고 느낀 것은 초기 구조 설계였다. 웹과 달리 모바일 앱은 화면 전환이 빈번하고, 컴포넌트 재사용성이 더욱 중요하기 때문에 처음부터 체계적으로 구조를 잡는 것이 핵심이었다.