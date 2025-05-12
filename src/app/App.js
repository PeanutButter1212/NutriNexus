import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./LoginScreen";
import SignUpScreen from "./SignUpScreen";
import OTPScreen from "./OTPScreen";
import DetailScreen from "./DetailScreen";
import ProfileScreen from "./ProfileScreen"
import { AuthProvider } from "../context/AuthContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider> 
      <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OTP"
          component={OTPScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </AuthProvider>
    
  );
}
