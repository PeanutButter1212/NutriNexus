import "../../global.css";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function SettingScreen({ route, navigation }) {
  const { session, profile, authMethod } = route.params;

  const { logout } = useAuth();

  const handleLogout = () => {
    logout(authMethod, navigation);
  };

  return (
    <View className="flex-1 items-center justify-start bg-white pt-28 px-4">
      <TouchableOpacity
        onPress={handleLogout}
        className="items-center justify-center bg-red-500 w-3/4 rounded-xl mt-6 py-3 mt-3"
      >
        <Text className="text-white text-base font-medium">Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Profile")}
        className="items-center justify-center bg-red-500 w-3/4 rounded-xl mt-6
        py-3 mt-3"
      >
        <Text className="text-white text-base font-medium">Back</Text>
      </TouchableOpacity>
    </View>
  );
}
