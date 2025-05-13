import "../../global.css";
import { StatusBar } from "expo-status-bar";
import {  StyleSheet,  Text,  ScrollView,  View,  TextInput,  TouchableOpacity,} from "react-native";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile({ navigation }) {    
     const { username, logout, getUserData } = useAuth();

     useEffect(() => {
          getUserData();
        }, []);
      
     const handleLogout = () => {
          logout(navigation);
        };
      
     return (   
     <View className="items-center justify-start bg-white-500 pt-32 px-6 flex-1">      
     <Text className="text-3xl font-bold text-green-600" 
          style= {{textAlign: "center"}} >
        Welcome Back, {username ? username  : "User"}!
      </Text>

      <TouchableOpacity 
      onPress = {handleLogout}
      className="flex-row items-center justify-center w-full bg-red-500 rounded-xl mt-6 py-3">
        <Text className="text-white text-base font-medium">
          Log Out
        </Text>
      </TouchableOpacity>

      </View> 
      
     
     );}
