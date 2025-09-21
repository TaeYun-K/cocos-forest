# Dashboard Components

대시보드 관련 컴포넌트들의 문서입니다.

## 컴포넌트 구조

```
src/components/dashboard/
├── AIAnalysisCard.tsx          # AI 분석 결과 카드
├── CategoryDetailModal.tsx     # 카테고리 상세 정보 모달
├── CategoryItem.tsx           # 카테고리 항목 컴포넌트
├── CategoryPieChart.tsx       # 카테고리별 파이차트
├── CategoryReport.tsx         # 카테고리별 리포트 메인
├── CategorySummary.tsx        # 카테고리 요약 정보
├── DayDetailCard.tsx          # 일별 상세 정보 카드
├── MonthlyCalendar.tsx        # 월별 달력 컴포넌트
├── PaymentButton.tsx          # 결제 버튼
├── PaymentSuccessModal.tsx    # 결제 성공 모달
├── TodayEmissionStatus.tsx    # 오늘 배출량 상태
└── index.ts                   # 컴포넌트 export
```

## 주요 기능

### MonthlyCalendar
- 📅 월별 탄소 배출량을 달력 형태로 시각화
- 🎨 배출량에 따른 색상 구분 (낮음/보통/높음)
- 🔄 월 네비게이션 기능
- 📊 날짜별 상세 정보 제공

### CategoryReport
- 📊 카테고리별 탄소 배출량 분석
- 🥧 파이차트로 비율 시각화
- 📋 정렬된 카테고리 리스트
- 💰 결제 금액 및 배출량 표시

### DayDetailCard
- 📈 선택된 날짜의 상세 정보
- 💳 거래 내역 리스트
- 📊 일일 총계 정보
- 🔄 실시간 동기화 상태

## 성능 최적화

### Memoization
- `React.memo()` 적용으로 불필요한 리렌더링 방지
- `useMemo()` 활용한 계산 결과 캐싱
- 최적화된 데이터 구조 활용

### 데이터 최적화
- Map 객체를 활용한 O(1) 데이터 조회
- 정렬된 카테고리 데이터 캐싱
- 이미지 프리로딩

## 사용 예시

```tsx
import {
  MonthlyCalendar,
  CategoryReport,
  DayDetailCard
} from './components/dashboard';

// 탭 기반 대시보드
const DashboardTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View>
      {activeTab === 0 ? (
        <MonthlyCalendar />
      ) : (
        <CategoryReport />
      )}

      {showDetailCard && (
        <DayDetailCard />
      )}
    </View>
  );
};
```

## 테스트

### 단위 테스트
- React Native Testing Library 사용
- 각 컴포넌트별 테스트 파일 제공
- Mock 데이터 활용한 시나리오 테스트

### 통합 테스트
- 사용자 플로우 기반 테스트
- API 모킹을 통한 실제 사용 시나리오
- 성능 테스트 포함

## 의존성

### 주요 라이브러리
- `@tanstack/react-query`: 데이터 페칭 및 캐싱
- `zustand`: 상태 관리
- `react-native-svg`: 차트 렌더링

### 내부 의존성
- `hooks/useDashboard`: 통합 비즈니스 로직
- `store/dashboardStore`: 대시보드 상태 관리
- `api/dashboard`: API 통신
- `types/dashboard`: 타입 정의

## 스타일링

### 색상 시스템
```typescript
// 탄소 배출량 색상
LOW: '#15803d'     // 낮음 (초록)
MEDIUM: '#eab308'  // 보통 (노랑)
HIGH: '#ef4444'    // 높음 (빨강)
```

### 공통 스타일
- `commonStyles`: 재사용 가능한 스타일
- `tabStyles`: 탭 관련 스타일
- `gaugeStyles`: 게이지 관련 스타일

## 접근성

- 적절한 `accessibilityLabel` 제공
- 색상 외 추가 시각적 단서 제공
- 키보드 네비게이션 지원
- 스크린 리더 호환성