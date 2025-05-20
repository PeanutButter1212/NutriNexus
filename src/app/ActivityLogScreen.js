import "../../global.css";

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

import { AntDesign } from "@expo/vector-icons";
import { Image } from "react-native";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ActivityLogScreen({ navigation }) {
  return (
    <View className="flex-1 items-center justify-start bg-green-300 pt-28 px-4">
      {/* Activity Log*/}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          marginTop: 3,
        }}
      >
        <Text className="text-3xl font-semibold text-black text-center">
          Activity Log
        </Text>
        {/* Folder image*/}
        <Image
          source={require("../../assets/Folder.png")}
          className="w-40 h-40"
        />
      </View>
      <View style={{ flexDirection: "row", gap: 36 }}>
        <Text className="text-2xl font-semibold mb-4 text-black text-center ">
          Food
        </Text>
        <Text className="text-2xl font-semibold mb-4 text-black text-center">
          Calories
        </Text>
        <Text className="text-2xl font-semibold mb-4 text-black text-center">
          Date/Time
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate("Profile")}
        className="flex-row items-center justify-center w-full bg-green-600 rounded-xl mt-6 py-3"
      >
        <Text className="text-white text-base font-medium font-bold">Back</Text>
      </TouchableOpacity>
      Scanner
    </View>
  );
}
