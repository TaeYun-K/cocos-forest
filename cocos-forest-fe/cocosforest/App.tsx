// App.tsx
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from "./src/navigation/RootNavigator";

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    if (__DEV__) {
      console.log("✅ axios-mock-adapter initialized");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style="light" />
    </NavigationContainer>
    </QueryClientProvider>
  );
}
