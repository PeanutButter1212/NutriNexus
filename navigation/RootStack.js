import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";
import DetailScreen from "../screens/DetailScreen";
import SettingScreen from "../screens/SettingScreen";
import ActivityLogScreen from "../screens/ActivityLogScreen";
import OTPScreen from "../screens/OTPScreen";
const Stack = createNativeStackNavigator();

export default function RootStack() {
    const { session, isOtpVerified } = useAuth();
    const hasSession = !!session; 
   // const needsOtpVerification = false;
    //hasSession;
    //!isOtpVerified;
   // const isFullyAuthenticated = hasSession;
    //&& isOtpVerified;
    /*
    {!hasSession && (
      <Stack.Screen name="AuthStack" component={AuthStack} />
  )}
  
  {needsOtpVerification && (
      <Stack.Screen name="OTP" component={OTPScreen} />
  )}
      */

    return (
    <Stack.Navigator screenOptions={{ headerShown: false }}> 
        
  
                <>
                <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }}/>
                <Stack.Screen name="Detail" component={DetailScreen} options={{ headerShown: false }}/>
                <Stack.Screen name="Activity Log" component={ActivityLogScreen} options={{ headerShown: false }}/>
                <Stack.Screen
                name="Setting"
                component={SettingScreen}
                options={{ 
                  headerShown: true,
                  title: "Settings",
                  headerBackTitle: "Back"
                }}
              />
              </>
                
    </Stack.Navigator>
    );

}