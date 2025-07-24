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

  const handleNext = async () => {
    try {
      if (session?.user?.id) {
        await supabase
          .from("profile_page")
          .update({ is_first_time: false })
          .eq("id", session.user.id);

        setProfile((prev) => ({ ...prev, is_first_time: false }));
      }
    } catch (error) {
      console.error("Error updating first time flag:", error);
      setProfile((prev) => ({ ...prev, is_first_time: false }));
    }
  };
  return (
    <LinearGradient
      colors={["#2E8B57", "#90EE90", "#006400"]}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}
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