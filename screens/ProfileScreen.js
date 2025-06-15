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
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import CircularProgress from "react-native-circular-progress-indicator";
import { Canvas, Group } from "@shopify/react-native-skia";
import * as d3 from "d3";
import BarPath from "../components/BarPath";
import XAxisText from "../components/XAxisText";
import DropdownComponent from "../components/Dropper";
import { supabase } from "../lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import useProfileData from "../hooks/useProfileData";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useDistance } from "../contexts/DistanceTrackingContext";

export default function Profile({ navigation }) {
  const { session, profile, authMethod } = useAuth();

  const SCREEN_HEIGHT = Dimensions.get("window").height;

  const { distance } = useDistance();

  const { totalCalories, calorieGoal, caloriesData, points } = useProfileData();

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
        <Text className="text-3xl font-bold text-white p-16 text-center">
          Welcome Back, {profile ? profile.username : "User"}!
        </Text>
        <View className="flex-1 justify-center items-center mb-24">
          <View className="relative items-center">
            <View className="absolute left-6 -top-16">
              <CircularProgress
                value={Math.floor(progressPercentage)}
                valueSuffix={"%"}
                radius={60}
                progressValueColor={"blue"}
                titleFontSize={10}
                title={"Calories Limit"}
                titleColor={"white"}
                titleStyle={{ fontWeight: "bold" }}
                activeStrokeColor={"#2465FD"}
                activeStrokeSecondaryColor={"#C3305D"}
                inActiveStrokeColor={"white"}
              />
            </View>

            {/* image */}
            <View className="mt-8">
              <Image
                source={require("../assets/AvatarResized.png")}
                className="w-80 h-80"
                resizeMode="contain"
              />
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
                  {points}
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-xl p-4 flex-1 shadow-md mr-2">
              <View className="flex-row items-center">
                <Ionicons name="footsteps" size={20} color="black" />
                <Text className="text-stone-500 text-sm text-xl font-bold">
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
