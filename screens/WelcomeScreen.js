import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import useProfileData from "../hooks/useProfileData";
import { supabase } from "../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function WelcomeScreen({ navigation }) {
  const { session, setProfile } = useAuth();
  const {
    userDemographics,
    username,
    loading,
    points,
    profilePic,
    visited,
    stepsData,
    totalCalories,
    calorieGoal,
    caloriesData,
  } = useProfileData();

  const [processing, setProcessing] = useState(false);

  const handleNext = async () => {
    if (!session?.user?.id) return;

    try {
      setProcessing(true);

      // Update is_first_time flag
      await supabase
        .from("profile_page")
        .update({ is_first_time: false })
        .eq("id", session.user.id);

      // Set all profile data in AuthContext
      setProfile({
        id: session.user.id,
        username,
        userDemographics,
        points,
        profilePic,
        visited,
        stepsData,
        totalCalories,
        calorieGoal,
        caloriesData,
        is_first_time: false,
      });

      // Navigate to main app
      navigation.replace("Maintabs");
    } catch (error) {
      console.error("Error in handleNext:", error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !userDemographics) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-gray-500">Preparing your profile...</Text>
      </View>
    );
  }
  return (
    <LinearGradient
      colors={["#2E8B57", "#90EE90", "#006400"]}
      className="flex-1 px-6"
    >
      <View className="flex-1 justify-center items-center">
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="w-full items-center mb-12 space-y-2"
        >
          <Image
            source={require("../assets/WhiteLogo.png")}
            className="w-40 h-40 mb-4"
            resizeMode="contain"
          />
          <Text className="text-white text-4xl font-semibold text-center">
            Welcome to
          </Text>
          <Text className="text-white text-6xl font-extrabold text-center">
            NutriNexus
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400)}
          className="w-full items-center"
        >
          <TouchableOpacity
            onPress={handleNext}
            className="bg-orange-500 px-10 py-4 rounded-xl shadow-lg mt-16"
          >
            <Text className="text-white text-lg font-bold">Begin Journey</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}
