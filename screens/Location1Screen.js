import "../global.css";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ImageBackground,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Image } from "react-native";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import useProfileData from "../hooks/useProfileData";
import { supabase } from "../lib/supabase";
import japaneseKoreanImg from "../assets/Japanese_Korean_Stall.jpeg";
import roastedDelightImg from "../assets/Chicken_Rice_Stall.jpg";
import fishBallNoodlesImg from "../assets/FishBallNoodle_Stall.jpg";
import fishNoodlesImg from "../assets/FishNoodle_Stall.jpg";

const stalls = [
  {
    name: "Roasted Delights",
    foods: ["Roasted Chicken Rice", "Steamed Chicken Rice", "Char Siew Rice"],
    pic: roastedDelightImg,
  },
  {
    name: "Japanese Korean",
    foods: ["Saba Fish Set", "Chicken Cutlet Rice", "Bibimbap ✅ "],
    pic: japaneseKoreanImg,
  },
  {
    name: "Fish Noodles",
    foods: ["Sliced Fish Noodle ✅ ", "Fried Fish Noodles", "Bittergourd Soup"],
    pic: fishNoodlesImg,
  },
  {
    name: "FishBall Noodles",
    foods: ["Dry FishBall Noodles", "Bak Kut Teh", "Soup FishBall Noodles"],
    pic: fishBallNoodlesImg,
  },
];

export default function Location1Screen() {
  const { visited1, points } = useProfileData();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const navigation = useNavigation();

  const handleFirstVisit = async () => {
    if (!visited1) {
      const { error: updatePointsError } = await supabase
        .from("profile_page")
        .update({
          points: points + 200,
          visited1: true,
        })
        .eq("id", userId);

      if (updatePointsError) {
        console.error(
          "Failed to update points or visited1:",
          updatePointsError
        );
        return;
      }
    }
    navigation.goBack();
  };

  return (
    <ScrollView className="bg-green-200">
      <View className="items-center justify-start  pt-16 px-6 space-y-10">
        <Text className="text-4xl font-extrabold text-black mb-8">
          Happy Hawker
        </Text>
        <View className="bg-green-200 p-4 rounded-2xl shadow-md w-full mb-8">
          <Text className="text-xl font-semibold text-gray-800 mb-1">
            📍 Address
          </Text>
          <Text className="text-base text-black leading-6">
            632 Bukit Batok Central, Singapore 650632
          </Text>
        </View>
        <Image
          source={require("../assets/happyHawker.jpg")}
          className="w-full h-64 rounded-2xl object-cover mb-8"
        />
        <Text className="text-xl font-bold mb-2">Food Options:</Text>
        {/*<View className="flex-row flex-wrap justify-between"> */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="w-full mb-6"
        >
          {stalls.map((stall, index) => (
            <TouchableOpacity
              key={index}
              className="w-[48%] bg-white rounded-2xl  mb-4 shadow-md  overflow-hidden"
              style={{ minHeight: 140 }} /*onPress={{}}*/
            >
              <ImageBackground
                source={stall.pic}
                className=" flex-1 h-full w-full justify-end rounded-2xl overflow-hidden"
                imageStyle={{ borderRadius: 16 }}
              >
                <Text className="text-lg font-bold text-gray-900 mb-2 bg-white/80 text-center">
                  {stall.name}
                </Text>
              </ImageBackground>
              /*
              <Text className="text-lg font-bold text-gray-900 mb-2">
                {stall.name}
              </Text>
              {stall.foods.map((food, i) => (
                <Text key={i} className="text-sm text-gray-700">
                  {food}
                </Text>
              ))}{" "}
              */
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          className="flex-row items-center justify-center rounded-xl mt-6 py-3"
          onPress={handleFirstVisit}
        >
          <Text className="text-black text-lg font-bold mb-16">Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
