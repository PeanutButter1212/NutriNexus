import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./contexts/AuthContext";
import { DistanceProvider } from "./contexts/DistanceTrackingContext";
//import { AntDesign, FontDesign, Ionicons, FontAwesome } from '@expo/vector-icons';
import RootStack from "./navigation/RootStack";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <DistanceProvider>
          <NavigationContainer>
            <RootStack />
          </NavigationContainer>
        </DistanceProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
