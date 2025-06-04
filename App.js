import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./contexts/AuthContext";
import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
//import { AntDesign, FontDesign, Ionicons, FontAwesome } from '@expo/vector-icons';
import RootStack from "./navigation/RootStack"

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootStack /> 
      </NavigationContainer>

    </AuthProvider>
  )
}