import "../global.css";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Settings,
  Dimensions,
  ImageBackground,
} from "react-native";
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import CircularProgress from "react-native-circular-progress-indicator";
import { Canvas, Group } from "@shopify/react-native-skia";
import * as d3 from "d3";
import BarPath from "../components/BarPath";
import XAxisText from "../components/XAxisText";
import DropdownComponent from "../components/Dropper";
import useProfileData from "../hooks/useProfileData";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useDistance } from "../contexts/DistanceTrackingContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import avatarImage from "../assets/MaleCharacter.png";
import { fetchEquippedItems } from "../services/avatarService";
import { fetchPoints } from "../services/profileService";
import stoneImage from "../assets/stone_texture.png";

export default function Profile() {
  const navigation = useNavigation();
  const { session, profile, authMethod, logout } = useAuth();

  const SCREEN_HEIGHT = Dimensions.get("window").height;

  const { distance } = useDistance();

  const [localPoints, setLocalPoints] = useState(0)

  

  const handleLogout = () => {
    logout(authMethod, navigation);
  };

  //avatar accessories
  const [equipped, setEquipped] = useState({
    head: null,
    body: null,
    hand: null,
  });

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        console.log("profile upon load of screen: " + JSON.stringify(profile, null, 2))
        if (!session?.user?.id) return;
        const fresh = await fetchEquippedItems(session.user.id);
        setEquipped(fresh);

        const userPoints = await fetchPoints(session.user.id);
        setLocalPoints(userPoints);
      };

      loadData();
    }, [session?.user?.id])
  );

  const { totalCalories, calorieGoal, caloriesData} = useProfileData();


  const [referenceData, setReferenceData] = useState([]);
  const [selectedDataType, setSelectedDataType] = useState("Steps");

  const { width } = useWindowDimensions();

  const weeklyStepsData = [
    { day: "MON", value: 3000 },
    { day: "TUES", value: 5500 },
    { day: "WED", value: 10000 },
    { day: "THURS", value: 8000 },
    { day: "FRI", value: 9000 },
    { day: "SAT", value: 4000 },
    { day: "SUN", value: 3500 },
  ];

  useEffect(() => {
    if (selectedDataType === "Steps") {
      setReferenceData(weeklyStepsData);
    } else if (selectedDataType === "Calories") {
      setReferenceData(caloriesData);
    }
  }, [selectedDataType, caloriesData]);

  const progressPercentage =
    calorieGoal > 0 ? Math.min((totalCalories / calorieGoal) * 100, 100) : 0;

  const canvasWidth = width;
  const canvasHeight = 350;

  const graphWidth = width;
  const graphMargin = 20;
  const graphHeight = canvasHeight - graphMargin;

  const xRange = [0, graphWidth];
  const xDomain = referenceData.map((dataPoint) => dataPoint.day);

  const x = d3.scalePoint().domain(xDomain).range(xRange).padding(1);

  const yRange = [0, graphHeight];

  const yDomain = [0, d3.max(referenceData, (yDataPoint) => yDataPoint.value)];

  const y = d3.scaleLinear().domain(yDomain).range(yRange);

  const barWidth = 35;

  const handleDebug = () => {
    console.log(profile)
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <LinearGradient
        colors={["#2E8B57", "#90EE90", "#006400"]}
        style={{
          width: "100%",
          minHeight: SCREEN_HEIGHT * 0.8,
          flexDirection: "column",
          padding: 20,
        }}
      >
        <TouchableOpacity
          className="absolute top-28 left-6  rounded-lg z-10 mt-6"
          onPress={() => navigation.navigate("Setting")}
        >
          <ImageBackground
            source={stoneImage}
            className="px-2 py-2"
            resizeMode="cover"
          >
            <Ionicons name="settings" size={36} color="white" />
          </ImageBackground>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-white text-center mt-12 mb-4">
          Welcome Back, {profile ? profile.username : "User"}!
        </Text>

        <View className="flex-1 justify-center items-center mb-16">
          <View className="relative items-center">
            <CircularProgress
              value={Math.floor(progressPercentage)}
              valueSuffix={"%"}
              radius={70}
              progressValueColor={"blue"}
              titleFontSize={10}
              title={"Calories Limit"}
              titleColor={"white"}
              titleStyle={{ fontWeight: "bold" }}
              activeStrokeColor={"#2465FD"}
              activeStrokeSecondaryColor={"#C3305D"}
              inActiveStrokeColor={"white"}
            />

            {/* Avatar view*/}
            <View className="w-56 h-96 relative items-center justify-center">
              <Image source={avatarImage} className="w-full h-full absolute" />
              {/* for each equppied item we render image onto avatar*/}
              {Object.values(equipped).map((item, index) =>
                item ? (
                  <Image
                    key={index}
                    source={{ uri: item.image_url }}
                    className="w-full h-full absolute"
                    resizeMode="contain"
                    style={{
                      //i converted position to percenatges and store in backend so it will not be misaligned for different device sizes
                      position: "absolute",
                      top: item.position?.topPct * 384,
                      left: item.position?.leftPct * 224,
                      width: item.position?.widthPct * 224,
                      height: item.position?.heightPct * 384,
                    }}
                  />
                ) : null
              )}
            </View>
          </View>

          <View className="flex-row justify-between">
            <View className="bg-white rounded-xl p-4 flex-1 shadow-md mr-2">
              <View className="flex-row items-center">
                <Image
                  source={require("../assets/Points.png")}
                  className="w-8 h-8"
                />

                <Text className="text-stone-500 text-sm text-xl font-bold">
                  Points
                </Text>
              </View>
              <View>
                <Text className="text-black text-3xl font-extrabold">
                  {localPoints === undefined ? (profile 
                  ? profile.points
                  : 0)
                  : localPoints}
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-xl p-4 flex-1 shadow-md mr-2">
              <View className="flex-row items-center">
                <Ionicons name="footsteps" size={20} color="black" />
                <Text
                  testID="steps-label"
                  className="text-stone-500 text-sm text-xl font-bold"
                >
                  Steps
                </Text>
              </View>
              <View>
                <Text className="text-black text-3xl font-extrabold">
                  {(distance / 0.75).toFixed(0)}{" "}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("Activity Log")}
              className="bg-white rounded-xl p-4 flex-1 shadow-md"
            >
              <View className="flex-row items-center mb-1">
                <FontAwesome5 name="fire" size={20} color="black" />
                <Text className="text-stone-500 text-m font-bold"> Burnt </Text>
                <Text className="text-stone-500 text-m font-bold">Kcal</Text>
              </View>

              <Text className="text-black text-3xl font-extrabold">
                {Math.round(distance * 0.05)} kcal
              </Text>
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={["#FF7A00", "#E85A2B"]}
            style={{
              padding: 10,
              marginTop: 16,
              borderRadius: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              paddingHorizontal: 35,
            }}
          >
            <TouchableOpacity onPress={() => navigation.navigate("Shop")}>
              <Text className="text-3xl text-white"> Shop </Text>
            </TouchableOpacity>
          </LinearGradient>
          <LinearGradient
            colors={["#FF7A00", "#E85A2B"]}
            style={{
              padding: 10,
              marginTop: 16,
              borderRadius: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              paddingHorizontal: 35,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate("Avatar Customisation")}
            >
              <Text className="text-3xl text-white"> Avatar </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </LinearGradient>

      <View>
        <View className="bg-white py-5 px-4 flex-row justify-between items-center">
          <Text className="text-xl font-bold"> Statistics</Text>
          <View style={{ width: "40%" }}>
            <DropdownComponent
              value={selectedDataType}
              onChange={setSelectedDataType}
            />
          </View>
        </View>

        <Canvas
          style={{
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: "white",
          }}
        >
          {referenceData.map((dataPoint, index) => (
            <Group key={index}>
              <BarPath
                x={x(dataPoint.day)}
                y={y(dataPoint.value)}
                barWidth={barWidth}
                graphHeight={graphHeight}
              />
              <XAxisText
                x={x(dataPoint.day)}
                y={canvasHeight}
                text={dataPoint.day}
              />
            </Group>
          ))}
        </Canvas>
      </View>
    </ScrollView>
  );
}
