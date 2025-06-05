import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import ProfileScreen from "../screens/ProfileScreen";
import ScannerScreen from "../screens/ScannerScreen";
import GardenScreen from "../screens/GardenScreen";
import MapScreen from "../screens/MapScreen";
import SocialScreen from "../screens/SocialScreen";

const Tab = createBottomTabNavigator(); 

export default function MainTabs() {
    return (
  
          <Tab.Navigator
          initialRouteName="Profile"
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