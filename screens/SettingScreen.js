import "../global.css";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Modal
} from "react-native";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import settingsBackground from '../assets/backgrounds/SettingsFinalBackground.png'
import AccessoryPopUp from '../components/AccessoryPopup'

export default function SettingScreen({ navigation }) {
  const { session, profile, logout, authMethod } = useAuth();

  const [showPopup, setShowPopup] = useState("false")


  const handleLogout = () => {
    logout(authMethod, navigation);
  };

  return (
    <ImageBackground
    source={settingsBackground}
    className="flex-1"
    resizeMode="cover"
  >
    <View className="flex-1 items-center justify-center  px-4">
      <TouchableOpacity
        onPress={() => navigation.navigate("Detail")}
        className="items-center justify-center bg-blue-500 w-3/4 rounded-xl py-3"
      >
        <Text className="text-white text-base font-medium">Edit Details</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("Username Settings")}
        className="items-center justify-center bg-blue-500 w-3/4 rounded-xl mt-6 py-3"
      >
        <Text className="text-white text-base font-medium">Edit Profile Information</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogout}
        className="items-center justify-center bg-red-500 w-3/4 rounded-xl mt-6 py-3 "
      >
        <Text className="text-white text-base font-medium">Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="items-center justify-center bg-red-500 w-3/4 rounded-xl mt-6
        py-3 mt-3"
      >
        <Text className="text-white text-base font-medium">Back</Text>
      </TouchableOpacity>

    </View>
    </ImageBackground>
  );
}