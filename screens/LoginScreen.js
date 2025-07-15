import "../global.css";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  ActivityIndicator
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Image } from "react-native";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import LottieView from "lottie-react-native";

export default function LoginScreen({ navigation }) {
  const { googleSignIn, signInWithOTP } = useAuth();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      setErrorMessage("Please fill in all fields!");
      return;
    }
    try {
      setLoading(true)
      setErrorMessage("");
      console.log(email);
      const error = await signInWithOTP(email, navigation);
      setLoading(false)
      if (error) {
        setErrorMessage(error);
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleGoogleLogIn = async () => {
    try {
      const user = await googleSignIn();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <View className="flex-1 items-center justify-start bg-white pt-32 px-6">
      {/* Logo */}
      <Image
        source={require("../assets/Logo.png")}
        className="w-40 h-40 mb-4"
      />

      {/* NutriNuxus */}
      <Text className="text-5xl font-bold text-green-600">NutriNexus</Text>

      {/* Login */}
      <Text className="text-2xl mt-2 text-green-600">Login</Text>

      {/* Username Input */}
      <TextInput
        value={email}
        onChangeText={(text) => setEmail(text)}
        placeholder="Email"
        autoCapitalize="none"
        className="w-full border border-gray-300 rounded-xl mt-6 px-4 py-3 text-base"
      />
      {/*

      <TextInput
        onChangeText = {(text) => setPassword(text)}
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
        className="w-full border border-gray-300 rounded-xl mt-4 px-4 py-3 text-base"
      /> 
      */}

      {/* Error Message */}
      {errorMessage ? (
        <Text className="text-red-500 font-semibold mt-3">{errorMessage}</Text>
      ) : null}

      {/* Google Login Button */}
      <TouchableOpacity
        onPress={handleGoogleLogIn}
        className="flex-row items-center justify-center w-full bg-red-500 rounded-xl mt-6 py-3"
        disabled={loading}
      >
        <AntDesign name="google" size={20} color="white" className="mr-2" />
        <Text className="text-white text-base font-medium">
          Continue with Google
        </Text>
      </TouchableOpacity>
   
      {/* Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        className="flex-row items-center justify-center w-full bg-green-600 rounded-xl mt-6 py-3"
        disabled={loading}
      >
        <Text className="text-white text-base font-medium font-bold">
          Login
        </Text>
      </TouchableOpacity>

      {loading && (
      <View className="justify-center items-center">
        {Platform.OS === "ios" ? (
          <LottieView
            source={require("../assets/loading.json")}
            autoPlay
            loop
            style={{ width: 80, height: 80, marginTop: 15 }}
          />
        ) : (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 15 }} />
        )}
      </View>
    )}

      {/*

      <Text className="text-xl mt-2 textm-green-600 pt-8">
        Dont have an account?
      </Text>
   
      <TouchableOpacity
        className="flex-row items-center justify-center w-full bg-white-600 rounded-xl mt-6 py-3"
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text className="text-green-600 text-base font-medium underline">
          Sign Up
        </Text>
      </TouchableOpacity>
      */}
    </View>
  );
}
