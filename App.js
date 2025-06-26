import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./contexts/AuthContext";
import { DistanceProvider } from "./contexts/DistanceTrackingContext";
//import { AntDesign, FontDesign, Ionicons, FontAwesome } from '@expo/vector-icons';
import RootStack from "./navigation/RootStack";
import { getCustomFonts } from "./utils/loadFonts";
export default function App() {

  const [fontsLoaded] = getCustomFonts();

  // Ensure we wait for the fonts
  if (!fontsLoaded) {
    return null;
  }

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
