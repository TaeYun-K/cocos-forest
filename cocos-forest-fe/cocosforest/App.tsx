// App.tsx
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";

// ❌ Mock 비활성화 - 실제 백엔드 API 사용
// import "./src/mocks/setupMocks";

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
