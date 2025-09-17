// App.tsx
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomeScreen from './src/screens/HomeScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ChallengeScreen from './src/screens/ChallengeScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    if (__DEV__) {
      console.log('✅ axios-mock-adapter initialized');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}