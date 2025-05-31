import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./LoginScreen";
import SignUpScreen from "./SignUpScreen";
import OTPScreen from "./OTPScreen";
import DetailScreen from "./DetailScreen";
import ActivityLogScreen from "./ActivityLogScreen";
import ProfileScreen from "./ProfileScreen";
import ScannerScreen from "./ScannerScreen";
import SettingScreen from "./SettingScreen";
import GardenScreen from "./GardenScreen";
import MapScreen from "./MapScreen";
import SocialScreen from "./SocialScreen";
import { AuthProvider } from "../context/AuthContext";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AntDesign, FontDesign, Ionicons, FontAwesome } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator(); 

function MainTabs ({ route }) {
  return (

        <Tab.Navigator
        initialRouteName={"Profile"}
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let iconName;
            let rn = route.name;

            if (rn === "Profile") {
              return <AntDesign name={focused ? "user" : "user"} size={size} color={color} />;
            } else if (rn === "Scanner") {
              return <FontAwesome name={focused ? "camera" : "camera"} size={size} color={color} />;
            } else if (rn === "Garden") {
              return <Ionicons name={focused ? "leaf" : "leaf-outline"} size={size} color={color} />;
            } else if (rn === "Map") {
              return <FontAwesome name={focused ? "map-marker" : "map-marker"} size={size} color={color} />;
            } else if (rn === "Social") {
              return <AntDesign name="questioncircleo" size={size} color={color} />;
            }
          },
          tabBarActiveTintColor: "#27ae60",
          tabBarInactiveTintColor: "#cccccc",


        })} >
          <Tab.Screen name="Profile" options={{ headerShown: false }} component = {ProfileScreen} /> 
          <Tab.Screen name="Scanner" options={{ headerShown: false }} component = {ScannerScreen} /> 
          <Tab.Screen name="Garden" options={{ headerShown: false }} component = {GardenScreen} /> 
          <Tab.Screen name="Map" options={{ headerShown: false }} component = {MapScreen} /> 
          <Tab.Screen name="Social" options={{ headerShown: false }} component = {SocialScreen} /> 
          


        </Tab.Navigator>

  )}


export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      }
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .limit(1);

      if (error) {
        throw error;
      }
      setProfile(data);
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={session ? "MainTabs" : "Login"}>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OTP" component={OTPScreen} options={{ headerShown: true }} />
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
            name="Setting"
            component={SettingScreen}
            options={{ 
              headerShown: true,
              title: "Settings",
              headerBackTitle: "Back"
            }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}