import "./global.css";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Image } from "react-native";

export default function LoginScreen({ navigation }) {
  return (
    <View className="flex-1 items-center justify-start bg-white pt-32 px-6">
      {/* Logo */}
      <Image source={require("./assets/Logo.png")} className="w-40 h-40 mb-4" />

      {/* NutriNuxus */}
      <Text className="text-5xl font-bold text-green-600">NutriNuxus</Text>

      {/* Login */}
      <Text className="text-2xl mt-2 text-green-600">Login</Text>

      {/* Username Input */}
      <TextInput
        placeholder="Username"
        className="w-full border border-gray-300 rounded-xl mt-6 px-4 py-3 text-base"
      />
      {/* Password Input */}
      <TextInput
        placeholder="Password"
        className="w-full border border-gray-300 rounded-xl mt-4 px-4 py-3 text-base"
      />
      {/* Google Login Button */}
      <TouchableOpacity className="flex-row items-center justify-center w-full bg-red-500 rounded-xl mt-6 py-3">
        <AntDesign name="google" size={20} color="white" className="mr-2" />
        <Text className="text-white text-base font-medium">
          Continue with Google
        </Text>
      </TouchableOpacity>
      {/* Login Button */}
      <TouchableOpacity className="flex-row items-center justify-center w-full bg-green-600 rounded-xl mt-6 py-3">
        <Text className="text-white text-base font-medium font-bold">
          Login
        </Text>
      </TouchableOpacity>
      {/* Dont have account? */}
      <Text className="text-xl mt-2 text-green-600 pt-8">
        Dont have an account?
      </Text>
      {/* Sign Up button */}
      <TouchableOpacity
        className="flex-row items-center justify-center w-full bg-white-600 rounded-xl mt-6 py-3"
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text className="text-green-600 text-base font-medium underline">
          Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}
