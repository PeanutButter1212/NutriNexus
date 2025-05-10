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
import { AntDesign } from "@expo/vector-icons";
import {useAuth} from '../context/AuthContext';
import React, { useState } from 'react';

export default function SignUpScreen({ navigation }) {

  const { signUp } = useAuth(); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail]  = useState("");
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !email.trim()) {
      Alert.alert('Please fill in all fields!')
      return;
    } 

    signUp(username, email, password); 

  }
  return (
    <View className="flex-1 items-center bg-white pt-32 px-6">
      {/* New Account */}
      <Text className="text-3xl font-bold text-green-600 font-semibold ">
        Create a new account
      </Text>

      {/* Username Field*/}
      <View className="flex-row items-center space-x-12 pt-12">
        <Text className="text-base font-bold text-black">Username:</Text>
        <TextInput
          placeholder="Username"
          className="ml-4 border border-gray-300 rounded-xl mt-2 px-4 py-3 text-base w-80"
          onChangeText = {(text) => setUsername(text)}
        />
      </View>

      {/* Email Field */}

      <View className="flex-row items-center space-x-12 pt-8">
        <Text className="text-base font-bold text-black">Email:</Text>
        <TextInput
          placeholder="Email"
          className="ml-12 border border-gray-300 rounded-xl mt-2 px-4 py-3 text-base w-80"
          onChangeText = {(text) => setEmail(text)}
        />
      </View>

      {/* Password Field */}

      <View className="flex-row items-center space-x-12 pt-8">
        <Text className="text-base font-bold text-black">Password:</Text>
        <TextInput
          placeholder="Password"
          className="ml-4 border border-gray-300 rounded-xl mt-2 px-4 py-3 text-base w-80"
          onChangeText = {(text) => setPassword(text)}
          secureTextEntry
        />
      </View>

      {/* Google Login Button */}

      <TouchableOpacity className="flex-row items-center justify-center w-full bg-red-500 rounded-xl mt-12 py-3">
        <AntDesign name="google" size={20} color="white" className="mr-2" />
        <Text className="text-white text-base font-medium">
          Continue with Google
        </Text>
      </TouchableOpacity>

      {/* Sign Up Button*/}

      <TouchableOpacity 
        onPress = {handleRegister}
        className="flex-row items-center justify-center w-full bg-green-600 rounded-xl mt-6 py-3">
        <Text className="text-white text-base font-medium font-bold">
          Sign Up
        </Text>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="flex-row items-center justify-center w-full bg-white-600 rounded-xl mt-6 py-3"
      >
        <Text className="text-green-600 text-base font-medium underline">
          Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}