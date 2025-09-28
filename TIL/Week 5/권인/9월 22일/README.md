# TIL - 2025년 9월 22일

## React Native에서 파이차트 라이브러리 사용

### react-native-gifted-charts 설치 및 설정

```bash
npm install react-native-gifted-charts react-native-svg
```

```typescript
import { PieChart } from 'react-native-gifted-charts';

const MyPieChart = () => {
  const pieData = [
    { value: 54, color: '#177AD5', text: '54%' },
    { value: 30, color: '#79D2DE', text: '30%' },
    { value: 26, color: '#ED6665', text: '26%' },
  ];

  return (
    <PieChart
      data={pieData}
      showText
      textColor="black"
      radius={120}
      textSize={16}
      showTextBackground
      textBackgroundRadius={26}
    />
  );
};
```

## React Native Calendar 라이브러리 사용

### react-native-calendars 설치 및 설정

```bash
npm install react-native-calendars
```

```typescript
import { Calendar } from 'react-native-calendars';

const MyCalendar = () => {
  return (
    <Calendar
      onDayPress={(day) => {
        console.log('selected day', day);
      }}
      markedDates={{
        '2025-09-22': { selected: true, selectedColor: 'blue' },
        '2025-09-23': { marked: true, dotColor: 'red' }
      }}
      theme={{
        backgroundColor: '#ffffff',
        calendarBackground: '#ffffff',
        textSectionTitleColor: '#b6c1cd',
        selectedDayBackgroundColor: '#00adf5',
        selectedDayTextColor: '#ffffff',
        todayTextColor: '#00adf5',
        dayTextColor: '#2d4150',
      }}
    />
  );
};
```

## 느낀점

파이차트와 달력 라이브러리를 적용하면서 React Native의 다양한 UI 라이브러리들이 웹과 비슷한 수준의 기능을 제공한다는 것을 확인했다. 특히 데이터 시각화와 날짜 선택 UI는 사용자 경험 향상에 큰 도움이 되었다.