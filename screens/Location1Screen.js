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
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import japaneseKoreanImg from "../assets/Japanese_Korean_Stall.jpeg";
import roastedDelightImg from "../assets/Chicken_Rice_Stall.jpg";
import fishBallNoodlesImg from "../assets/FishBallNoodle_Stall.jpg";
import fishNoodlesImg from "../assets/FishNoodle_Stall.jpg";
import useProfileData from "../hooks/useProfileData";
import handleCheckboxes from "../services/profileService";

//to center the horizontal scroll
const screenWidth = Dimensions.get("window").width;
const cardWidth = 256;
const margin = 12;
const totalAlign = cardWidth - (screenWidth - cardWidth) / 2 - margin;

export default function Location1Screen() {
  const { visited1, points, checkBoxes } = useProfileData();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStall, setSelectedStall] = useState(null);
  const [claimedStalls, setClaimedStalls] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  //checks which alr claimed so cannot claim again
  useEffect(() => {
    const claimed = checkBoxes.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setClaimedStalls(claimed);
  }, [checkBoxes]);

  //save this to database?
  const stalls = [
    {
      name: "Roasted Delights",
      foods: [
        "Vegetarain Char Siew Rice",
        "Steamed Chicken Rice",
        "Wonton Noodles",
      ],
      pic: roastedDelightImg,
    },
    {
      name: "Japanese Korean",
      foods: ["Saba Fish Set", "Chicken Cutlet Rice", "Bibimbap "],
      pic: japaneseKoreanImg,
    },
    {
      name: "Fish Noodles",
      foods: ["Sliced Fish Noodle ", "Bittergourd Soup"],
      pic: fishNoodlesImg,
    },
    {
      name: "FishBall Noodles",
      foods: ["Dry FishBall Noodles", "Bak Kut Teh", "Soup FishBall Noodles"],
      pic: fishBallNoodlesImg,
    },
  ];

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
      {/* popup screen showing list of healthy food */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-4/5 p-6 rounded-2xl shadow-lg">
            {/* jic got undefined */}
            {selectedStall && (
              <>
                <Text className="text-lg font-bold text-green-800 mb-4 text-center">
                  {selectedStall.name}
                </Text>
                {selectedStall.foods.map((food, i) => (
                  <Text key={i} className="text-gray-700 text-center mb-1">
                    - {food}
                  </Text>
                ))}
                {showPopup && (
                  <Text className="text-green-600 text-sm text-center mb-2">
                    +10 points!
                  </Text>
                )}
                <TouchableOpacity
                  onPress={async () => {
                    const key = selectedStall.name;
                    //console.log("Clicked checkbox for:", key);
                    const result = await handleCheckboxes(userId, key);
                    console.log("Result from handleCheckboxes:", result);

                    if (result?.success || result?.alreadyClaimed) {
                      setClaimedStalls((prev) => ({ ...prev, [key]: true }));

                      if (result.success) {
                        setShowPopup(true);
                        setTimeout(() => setShowPopup(false), 2000);
                      }
                    }
                  }}
                  //disabled={claimedStalls[selectedStall.name]}
                  className="flex-row items-center justify-center mt-4"
                >
                  <View
                    className={`w-6 h-6 rounded border-2 mr-2 ${
                      claimedStalls[selectedStall.name]
                        ? "bg-green-500 border-green-700"
                        : "bg-white border-gray-400"
                    } items-center justify-center`}
                  >
                    {claimedStalls[selectedStall.name] && (
                      <Text className="text-white text-xs">✔️</Text>
                    )}
                  </View>
                  <Text className="text-sm">
                    I have eaten healthy food at this place
                  </Text>
                </TouchableOpacity>
              </>
            )}

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
                onPress={() => {
                  setModalVisible(true);
                  setSelectedStall(stall);
                }}
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
