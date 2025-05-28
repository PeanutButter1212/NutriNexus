import "../../global.css";
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
} from "react-native";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import CircularProgress from "react-native-circular-progress-indicator";
import { Canvas, Group } from "@shopify/react-native-skia";
import * as d3 from "d3";
import BarPath from "../components/BarPath";
import XAxisText from "../components/XAxisText";
import DropdownComponent from "../components/Dropper";
import { supabase } from "../lib/supabase";

{
  /*Method to update total calories which is updated when submit is pressd 
  in scanner*/
}
export const updateCaloriesConsumed = async (userId) => {
  console.log("updateCaloriesConsumed CALLED with:", userId);
  try {
    const { data, error } = await supabase
      .from("activity_log")
      .select("calories")
      .eq("user_id", userId);

    if (error) {
      console.log("Error fetching entries:", error);
      return;
    }

    let totalCalories = data.reduce((sum, entry) => sum + entry.calories, 0);

    const { error: updateError } = await supabase
      .from("profile_page")
      .update({ calories_consumed: totalCalories })
      .eq("id", userId);

    if (updateError) {
      console.log("Error updating calories:", updateError);
      return;
    }

    console.log("Updated calories_consumed in profiles:", totalCalories);
  } catch (err) {
    console.log("Unexpected error:", err);
  }
};

export default function Profile({ route, navigation }) {
  /* Calculating the calories consumed based on goal to update circular bar*/
  const [totalCalories, setTotalCalories] = useState(0);
  const [calorieGoal, setCaloriesGoal] = useState(100);

  useEffect(() => {
    const fetchTotalCalories = async () => {
      const { data, error } = await supabase
        .from("profile_page")
        .select("calories_consumed, calorie_goal") // or whatever your goal column is called
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.log("Error fetching profile:", error);
        return;
      }

      setTotalCalories(data.calories_consumed || 0);
      setCaloriesGoal(data.calorie_goal || 100);
    };

    fetchTotalCalories();
  }, []);

  const progressPercentage =
    calorieGoal > 0 ? Math.min((totalCalories / calorieGoal) * 100, 100) : 0;
  const { session, profile, authMethod } = route.params;

  //const { logout } = useAuth();

  const { width } = useWindowDimensions();

  const [selectedDataType, setSelectedDataType] = useState("Steps");

  const weeklyStepsData = [
    { day: "MON", value: 3000 },
    { day: "TUES", value: 5500 },
    { day: "WED", value: 10000 },
    { day: "THURS", value: 8000 },
    { day: "FRI", value: 9000 },
    { day: "SAT", value: 4000 },
    { day: "SUN", value: 3500 },
  ];
  const weeklyCaloriesData = [
    { day: "MON", value: 10000 },
    { day: "TUES", value: 3500 },
    { day: "WED", value: 1300 },
    { day: "THURS", value: 8000 },
    { day: "FRI", value: 4030 },
    { day: "SAT", value: 3700 },
    { day: "SUN", value: 8640 },
  ];

  const [referenceData, setReferenceData] = useState(weeklyStepsData);

  useEffect(() => {
    if (selectedDataType === "Steps") {
      setReferenceData(weeklyStepsData);
    } else {
      setReferenceData(weeklyCaloriesData);
    }
  }, [selectedDataType]);

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

  /*const handleLogout = () => {
    logout(authMethod, navigation);
  };
  */

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={["#2E8B57", "#90EE90", "#006400"]}
        style={{
          width: "100%",
          height: "40%",
          flexDirection: "column",
          padding: 30,
        }}
      >
        <Text
          className="text-3xl font-bold text-white mt-6 mb-8"
          style={{ textAlign: "center" }}
        >
          Welcome Back, {profile ? profile.username : "User"}!
        </Text>
        <View className="flex-row items-center">
          <View style={{ flex: 0.9, paddingRight: 10 }} className="flex-1">
            <View className="mb-6">
              <CircularProgress
                value={Math.floor(progressPercentage)}
                valueSuffix={"%"}
                radius={50}
                progressValueColor={"blue"}
                titleFontSize={16}
                titleColor={"#333"}
                titleStyle={{ fontWeight: "bold" }}
                activeStrokeColor={"#2465FD"}
                activeStrokeSecondaryColor={"#C3305D"}
                inActiveStrokeColor={"white"}
              />
            </View>
            {/* settings button */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Setting", { authMethod })}
              className="bg-blue-700 mb-5 rounded-md"
            >
              <Text className="text-center text-white py-3 w-auto font-bold">
                Settings
              </Text>
            </TouchableOpacity>

            {/* change character button */}
            <TouchableOpacity className="bg-blue-700 w-auto rounded-md">
              <Text className="text-center text-white py-3 font-bold">
                Change Character
              </Text>
            </TouchableOpacity>
          </View>

          {/* image */}
          <View className="flex-1 items-center justify-center px-5">
            <Image
              source={require("../../assets/Avatar.png")}
              className="justify-center mb-4"
            />
          </View>

          <View
            style={{ flex: 0.9, paddingLeft: 10 }}
            className="flex-column flex-1"
          >
            <View className="bg-violet-700 rounded-md py-2 mb-7">
              <Text className="text-white text-center text-sm">Points</Text>
              <Text className="text-white text-center text-xl">1111</Text>
            </View>

            <View className="bg-violet-700 rounded-md py-2 mb-7">
              <Text className="text-white text-center text-sm">Steps </Text>
              <Text className="text-white text-center text-xl">8973</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("Activity Log")}
              className="bg-violet-700 rounded-md py-2 mb-7"
            >
              <Text className="text-white text-center text-sm">
                Calories Burnt
              </Text>
              <Text className="text-white text-center text-xl">111</Text>
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

      {/*Bottom Bar */}

      <View style={{ flexDirection: "row", marginTop: 24 }}>
        <TouchableOpacity
          className="px-6 py-3 rounded-xl border"
          onPress={() => navigation.navigate("Profile")}
        >
          <Text className={"text-base font-medium text-black"}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Scanner")}
          className="px-6 py-3 rounded-xl border"
        >
          <Text className={`text-base font-medium text-black`}>Scanner</Text>
        </TouchableOpacity>

        <TouchableOpacity className="px-6 py-3 rounded-xl border">
          <Text className={"text-base font-medium text-black"}>Garden</Text>
        </TouchableOpacity>

        <TouchableOpacity className="px-6 py-3 rounded-xl border">
          <Text className={"text-base font-medium text-black"}>Map</Text>
        </TouchableOpacity>

        <TouchableOpacity className="px-6 py-3 rounded-xl border">
          <Text className={"text-base font-medium text-black"}>Socials</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  /*
     (   
     <View className="items-center justify-start bg-white-500 pt-32 px-6 flex-1">      
     <Text className="text-3xl font-bold text-green-600" 
          style= {{textAlign: "center"}} >
        Welcome Back, {profile ? profile.username : "User"}!
      </Text>

      
      <TouchableOpacity 
      onPress = {handleLogout}
      className="flex-row items-center justify-center w-full bg-red-500 rounded-xl mt-6 py-3">
@@ -35,4 +249,7 @@ export default function Profile({ route, navigation }) {
      </View> 
      
     
     );}
     );
  */
}
