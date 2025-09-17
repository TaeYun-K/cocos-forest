// App.tsx
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";

// ✅ 반드시 네비게이터/스크린 임포트보다 "먼저" 실행되게 사이드이펙트 임포트
import "./src/mocks/setupMocks";

import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  useEffect(() => {
    if (__DEV__) {
      console.log("✅ axios-mock-adapter initialized");
    }
  }, []);

  return (
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
