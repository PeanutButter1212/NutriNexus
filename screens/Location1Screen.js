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
  Dimensions,
  Image,
  Modal,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import useProfileData from "../hooks/useProfileData";
import { supabase } from "../lib/supabase";
import japaneseKoreanImg from "../assets/Japanese_Korean_Stall.jpeg";
import roastedDelightImg from "../assets/Chicken_Rice_Stall.jpg";
import fishBallNoodlesImg from "../assets/FishBallNoodle_Stall.jpg";
import fishNoodlesImg from "../assets/FishNoodle_Stall.jpg";

//to center the horizontal scroll
const screenWidth = Dimensions.get("window").width;
const cardWidth = 256;
const margin = 12;
const totalAlign = cardWidth - (screenWidth - cardWidth) / 2 - margin;

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
  const [modalVisible, setModalVisible] = useState(false);

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
  console.log("MODAL STATE:", modalVisible);
  return (
    <>
      {/* popup screen */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-4/5 p-6 rounded-2xl shadow-lg">
            <Text className="text-lg font-bold text-green-800 mb-4 text-center">
              Stall Details
            </Text>
            <Text className="text-gray-700 text-center mb-6">
              More info about the selected stall here.
            </Text>
            <TouchableOpacity
              className="bg-green-600 py-2 rounded-full"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white font-semibold text-center">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ScrollView className="bg-[#f6fdf4]">
        <View className="items-center justify-start pt-16 px-6 space-y-10">
          <Text className="text-4xl font-extrabold text-green-800 mb-8">
            Happy Hawker
          </Text>
          <View className="bg-white p-4 rounded-2xl shadow-md w-full mb-8">
            <Text className="text-xl font-semibold text-green-700 mb-1">
              📍 Address
            </Text>
            <Text className="text-base text-grey-700">
              632 Bukit Batok Central, Singapore 650632
            </Text>
          </View>
          <Image
            source={require("../assets/happyHawker.jpg")}
            className="w-full h-64 rounded-2xl object-cover mb-8"
          />
          <Text className="text-xl font-bold mb-2 text-green-800">
            Food Options:
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="w-full mb-6"
            contentOffset={{ x: totalAlign, y: 0 }} //to start at middle so can scroll left/right
          >
            {stalls.map((stall, index) => (
              <TouchableOpacity
                key={index}
                className="w-64 mr-4 bg-white rounded-2xl  mb-4 shadow-md  overflow-hidden"
                style={{ minHeight: 140 }}
                onPress={() => setModalVisible(true)}
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
    </>
  );
}
