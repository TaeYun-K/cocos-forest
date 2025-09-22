// App.tsx
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
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
