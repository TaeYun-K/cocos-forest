
import { StyleSheet, Text, View } from 'react-native';
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";

// Mock 설정 제거 (실제 API 연동 시)
// import "./src/mocks/setupMocks";

import { RootNavigator } from "./src/navigation/RootNavigator";
import { validateEnv } from "./src/config/env";
import { queryClient } from "./src/config/queryClient";

export default function App() {
  useEffect(() => {
    // 환경변수 검증
    validateEnv();
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
