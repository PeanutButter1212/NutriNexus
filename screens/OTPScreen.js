import "../global.css";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import React, { useEffect, useState } from "react";

export default function OTPScreen({ navigation, route }) {
  const { session, verifyOtp } = useAuth();

  const [otp, setOtp] = useState("");

  const { email } = route.params;

  const [errorMessage, setErrorMessage] = useState("");

  const handleOtpVerification = async () => {
    try {
      setErrorMessage("");
      await verifyOtp(email, otp, navigation);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <View className="flex-1 bg-white pt-20 px-6 items-center">
      <Text className="text-4xl font-bold text-black text-center">
        Enter the 6-digit code sent to your Email
      </Text>

      {/* Error Message */}
      {errorMessage ? (
        <Text className="text-red-500 mb-4 font-semibold mt-4">
          {errorMessage}
        </Text>
      ) : null}

      {/* Code Input*/}
      <TextInput
        onChangeText={(text) => setOtp(text)}
        placeholder="6 digit code"
        className="w-full border border-gray-300 rounded-xl mt-4 px-4 py-3 text-base"
      />

      {/* Authenticate button */}

      <TouchableOpacity
        onPress={handleOtpVerification}
        className="flex-row items-center justify-center w-full bg-green-600 rounded-xl mt-6 py-3"
      >
        <Text className="text-white text-base font-medium font-bold">
          Authenticate
        </Text>
      </TouchableOpacity>
    </View>
  );
}
