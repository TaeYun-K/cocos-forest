// App.tsx (최종 버전)
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect } from 'react'; // useEffect를 다시 사용합니다.
import HomeScreen from './src/screens/HomeScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ChallengeScreen from './src/screens/ChallengeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
// server를 여기서 import 합니다.
import { server } from './src/mocks/server';

const Tab = createBottomTabNavigator();

export default function App() {
  // ❗ 컴포넌트가 마운트된 후에 MSW 서버를 시작합니다.
  useEffect(() => {
    if (__DEV__) {
      server.listen({ onUnhandledRequest: 'warn' });
      console.log('✅ MSW server started from App.tsx');
    }

    // 앱이 종료될 때 서버를 정리합니다.
    return () => {
      if (__DEV__) {
        server.close();
      }
    };
  }, []);

  return (
    <NavigationContainer>
      {/* ... 기존의 Tab.Navigator 코드 ... */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#15803d',
          tabBarInactiveTintColor: '#6b7280',
          headerStyle: {
            backgroundColor: '#15803d',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            tabBarLabel: '홈',
            headerTitle: '홈',
          }}
        />
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{
            tabBarLabel: '대시보드',
            headerTitle: '대시보드',
          }}
        />
        <Tab.Screen 
          name="Challenge" 
          component={ChallengeScreen}
          options={{
            tabBarLabel: '챌린지',
            headerTitle: '챌린지',
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            tabBarLabel: '프로필',
            headerTitle: '프로필',
          }}
        />
      </Tab.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}