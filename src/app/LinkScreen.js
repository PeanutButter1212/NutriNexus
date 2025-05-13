import "../../global.css";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import React, { useEffect, useState} from "react"; 

export default function LinkScreen({ navigation }) {

  const route = useRoute(); 
  const { access_token } = route.params; 
  
  useEffect(() => {
    const verifyLink = async () => {
      try {
        if (!access_token) {
          console.warn("No access token provided.");
          return;
        }

        const { data, error } = await supabase.auth.setSession({ access_token });

        if (error) {
          console.error("Token verification failed:", error.message);
          return;
        }

        console.log("Token verified. Proceeding to Detail Screen...");
        navigation.navigate("Detail");

      } catch (err) {
        console.error("Error in link verification:", err.message);
      }
    };

    verifyLink();
  }, [access_token]);



  return (
   
    
    <View className="flex-1 bg-white pt-20 px-6 items-center">
    
        <Text className="text-4xl font-bold text-black text-center">
         A verification link has been sent to your email. Please click on it to create your account. 
        </Text>

     
    </View>
  );
}
