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
import AddFriendScreen from "../screens/AddFriendScreen";
import FriendRequestScreen from "../screens/FriendRequestScreen";
import FriendProfileScreen from "../screens/FriendProfileScreen";
const Stack = createNativeStackNavigator();

export default function RootStack() {
  const { session } = useAuth();
  const isAuthenticated = !!session;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {false ? (
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
