import "./global.css";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function OTPScreen({ navigation }) {
  return (
    <View className="flex-1 items-center justify-start bg-white pt-32 px-6">
      {/* 6 digit code text */}
      <Text className="text-5xl font-bold text-black">
        Enter the 6-digit code sent to your Email
      </Text>

      {/* Code Input*/}
      <TextInput
        placeholder="6 digit code"
        className="w-full border border-gray-300 rounded-xl mt-4 px-4 py-3 text-base"
      />

      {/* Authenticate button */}

      <TouchableOpacity className="flex-row items-center justify-center w-full bg-green-600 rounded-xl mt-6 py-3">
        <Text className="text-white text-base font-medium font-bold">
          Authenticate
        </Text>
      </TouchableOpacity>
    </View>
  );
}
