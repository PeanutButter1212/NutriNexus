<<<<<<<< HEAD:src/app/LoginScreen.js
import "../../global.css";
========
//import "../global.css";
>>>>>>>> main:Screens/LoginScreen.js
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Image } from "react-native";
import { useState } from "react"
import { useAuth } from "../context/AuthContext"


export default function LoginScreen({ navigation }) {
  const { googleSignIn, signInWithEmail } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Please fill in all fields!')
      return;
    } 

    signInWithEmail(username, password, navigation);  

  }

  const handleGoogleLogIn = async () => {
    console.log("Google Login Button Pressed");
    try {
      const user = await googleSignIn();
      if (user) {
        console.log("Google Sign-In Successful:", user);
        Alert.alert("Success", "You are now signed in with Google");
      } 
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
      Alert.alert("Error", error.message || "An unknown error occurred");
    }
  };


  return (
    <View className="flex-1 items-center justify-start bg-white pt-32 px-6">
      {/* Logo */}
<<<<<<<< HEAD:src/app/LoginScreen.js
      <Image source={require("../../assets/Logo.png")} className="w-40 h-40 mb-4" />
========
      <Image
        source={require("../assets/Logo.png")}
        className="w-40 h-40 mb-4"
      />
>>>>>>>> main:Screens/LoginScreen.js

      {/* NutriNuxus */}
      <Text className="text-5xl font-bold text-green-600">NutriNuxus</Text>

      {/* Login */}
      <Text className="text-2xl mt-2 text-green-600">Login</Text>

      {/* Username Input */}
      <TextInput
        onChangeText = {(text) => setUsername(text)}
        placeholder="Username"
        className="w-full border border-gray-300 rounded-xl mt-6 px-4 py-3 text-base"
      />
      {/* Password Input */}
      <TextInput
        onChangeText = {(text) => setPassword(text)}
        placeholder="Password"
        className="w-full border border-gray-300 rounded-xl mt-4 px-4 py-3 text-base"
      />
      {/* Google Login Button */}
      <TouchableOpacity 
      onPress = {handleGoogleLogIn}
      className="flex-row items-center justify-center w-full bg-red-500 rounded-xl mt-6 py-3">
        <AntDesign name="google" size={20} color="white" className="mr-2" />
        <Text className="text-white text-base font-medium">
          Continue with Google
        </Text>
      </TouchableOpacity>
      {/* Login Button */}
      <TouchableOpacity onPress = {handleLogin} className="flex-row items-center justify-center w-full bg-green-600 rounded-xl mt-6 py-3">
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
