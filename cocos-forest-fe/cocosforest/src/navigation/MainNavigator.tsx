// src/navigation/MainNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';

// 탭바 아이콘만 추가
import { Ionicons } from '@expo/vector-icons';

// 메인 화면 컴포넌트들
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import ProfileScreen from '../screens/ProfileScreen';
// import BenchmarkTestScreen from '../screens/BenchmarkTestScreen'; 

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Dashboard': iconName = focused ? 'analytics' : 'analytics-outline'; break;
            case 'Challenge': iconName = focused ? 'trophy' : 'trophy-outline'; break;
            case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
            // case 'Benchmark': iconName = focused ? 'person' : 'person-outline'; break;
            default: iconName = 'home-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#15803d',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      })}
    > 

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: '대시보드',
        }}
      />
      <Tab.Screen
        name="Challenge"
        component={ChallengeScreen}
        options={{
          tabBarLabel: '챌린지',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '프로필',
        }}
      />
      {/* <Tab.Screen
        name="Benchmark"
        component={BenchmarkTestScreen}
        options={{
          tabBarLabel: '벤치마크',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'flask' : 'flask-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      /> */}
    </Tab.Navigator>
  );
};