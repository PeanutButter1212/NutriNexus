import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./LoginScreen";
import SignUpScreen from "./SignUpScreen";
import OTPScreen from "./OTPScreen";
import DetailScreen from "./DetailScreen";
import ProfileScreen from "./ProfileScreen"
import { AuthProvider } from "../context/AuthContext";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const Stack = createNativeStackNavigator();


export default function App() {

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user?.id) {
        fetchProfile(session.user.id); 
      }
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null); 
      }
    })
  }, [])

  const fetchProfile = async(userId) => {
    try {
      const {data, error} = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)   
      .limit(1)
      
      if (error) {
        throw error;
      }
      setProfile(data);
    } catch (err) {
      throw err;
    }

  }

  return (

    <AuthProvider> 
      <NavigationContainer>
      <Stack.Navigator initialRouteName={session && session.user ? "Profile" : "Login"} >
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
        initialParams={{ session, profile }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
        initialParams={{ session, profile }}
      />
      </Stack.Navigator>
    </NavigationContainer>
    </AuthProvider>
    
  );
}
