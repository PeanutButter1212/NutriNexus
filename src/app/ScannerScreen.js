import "../../global.css";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Image } from "react-native";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ScannerScreen({ navigation }) {
  return (
    <View className="flex-1 items-center justify-start bg-white pt-28 px-4">
      {/* Scanner */}
      <Text className="text-3xl font-semibold text-black text-center">
        Scanner
      </Text>
      {/* Input to test log */}
      <View>
        <Text className="text-base font-bold text-black">Calories</Text>
        <TextInput
          placeholder="Calories"
          className="ml-4 border border-gray-300 rounded-xl mt-2 px-4 py-3 text-base w-80"
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity className="flex-row items-center justify-center w-full bg-green-600 rounded-xl mt-6 py-3">
        <Text className="text-white text-base font-medium font-bold">
          Submit
        </Text>
      </TouchableOpacity>
    </View>
  );
}
