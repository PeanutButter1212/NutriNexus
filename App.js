import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./contexts/AuthContext";
import { DistanceProvider } from "./contexts/DistanceTrackingContext";
//import { AntDesign, FontDesign, Ionicons, FontAwesome } from '@expo/vector-icons';
import RootStack from "./navigation/RootStack";

export default function App() {
  return (
    <AuthProvider>
      <DistanceProvider>
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </DistanceProvider>
    </AuthProvider>
  );
}
