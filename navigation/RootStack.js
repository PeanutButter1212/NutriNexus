import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";
import DetailScreen from "../screens/DetailScreen";
import SettingScreen from "../screens/SettingScreen";
import ActivityLogScreen from "../screens/ActivityLogScreen";
import AvatarCustomisationScreen from "../screens/AvatarCustomisationScreen";
import LocationScreen from "../screens/LocationScreen";
import ShopScreen from "../screens/ShopScreen";
import UsernameScreen from "../screens/UsernameScreen"
const Stack = createNativeStackNavigator();

export default function RootStack() {
  const { session } = useAuth();
  const isAuthenticated = !!session;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      ) : (
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Activity Log"
            component={ActivityLogScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Avatar Customisation"
            component={AvatarCustomisationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Location Details"
            component={LocationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Setting"
            component={SettingScreen}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="Shop"
            component={ShopScreen}
            options={{
              headerShown: false,
              title: "Shop",
              headerBackTitle: "Back",
            }}
          />
           <Stack.Screen
            name="Username Settings"
            component={UsernameScreen}
            options={{
              headerShown: false
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
