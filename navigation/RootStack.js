import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";
import DetailScreen from "../screens/DetailScreen";
import SettingScreen from "../screens/SettingScreen";
import ActivityLogScreen from "../screens/ActivityLogScreen";
import OTPScreen from "../screens/OTPScreen";
import Location1Screen from "../screens/Location1Screen";
const Stack = createNativeStackNavigator();

export default function RootStack() {
  const { session, isOtpVerified } = useAuth();
  const isAuthenticated = !!session;

    return (
    <Stack.Navigator screenOptions={{ headerShown: false }}> 
        { !isAuthenticated || !isOtpVerified 
        ? (
           <Stack.Screen name="AuthStack" component={AuthStack} />
        ) : (
            <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }}/>
            <Stack.Screen name="Detail" component={DetailScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="Activity Log" component={ActivityLogScreen} options={{ headerShown: false }}/>
            <Stack.Screen
            name="Location1"
            component={Location1Screen}
            options={{ headerShown: false }}
          />
            <Stack.Screen
            name="Setting"
            component={SettingScreen}
            options={{
              headerShown: true,
              title: "Settings",
              headerBackTitle: "Back",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
