import React from "react";
import { View, ActivityIndicator } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";
import WelcomeScreen from "../screens/WelcomeScreen";
import DetailScreen from "../screens/DetailScreen";
import SettingScreen from "../screens/SettingScreen";
import ActivityLogScreen from "../screens/ActivityLogScreen";
import AvatarCustomisationScreen from "../screens/AvatarCustomisationScreen";
import LocationScreen from "../screens/LocationScreen";
import ShopScreen from "../screens/ShopScreen";
import UsernameScreen from "../screens/UsernameScreen";
import AddFriendScreen from "../screens/AddFriendScreen";
import FriendRequestScreen from "../screens/FriendRequestScreen";
import FriendProfileScreen from "../screens/FriendProfileScreen";

const Stack = createNativeStackNavigator();

export default function RootStack() {
  const { session, profile } = useAuth(); 
  const isAuthenticated = !!session;
  

  const isLoadingProfile = isAuthenticated && !profile;
  const shouldShowBuffer = isAuthenticated && profile?.is_first_time === true;

  if (isLoadingProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2E8B57" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      ) : shouldShowBuffer ? (
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
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
              headerShown: false,
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
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Add Friends"
            component={AddFriendScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Friend Requests"
            component={FriendRequestScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Friend Profile"
            component={FriendProfileScreen}
            options={{ headerShown: true }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}