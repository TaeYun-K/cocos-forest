// App.tsx
import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { validateEnv } from "./src/config/env";
import { queryClient } from "./src/config/queryClient";
import firebaseService from './src/config/firebaseConfig';
import { useFonts } from 'expo-font';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Hakgyoansim_EohangkkumigiOTFB': require('./assets/fonts/Hakgyoansim_EohangkkumigiOTFB.otf'),
    'Jalnan2': require('./assets/fonts/Jalnan2.otf'),
    'Hakgyoansim_DunggeunmisoOTFB': require('./assets/fonts/Hakgyoansim Dunggeunmiso OTF B.otf'),
  });

  useEffect(() => {
    // 환경변수 검증
    validateEnv();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
