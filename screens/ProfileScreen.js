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
  Platform
} from "react-native";
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import CircularProgress from "react-native-circular-progress-indicator";
import { add, Canvas, Group } from "@shopify/react-native-skia";
import * as d3 from "d3";
import BarPath from "../components/BarPath";
import XAxisText from "../components/XAxisText";
import DropdownComponent from "../components/Dropper";
import useProfileData from "../hooks/useProfileData";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useDistance } from "../contexts/DistanceTrackingContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import maleAvatarImage from "../assets/MaleCharacter.png";
import femaleAvatarImage from "../assets/FemaleEdited.png";
import { fetchEquippedItems } from "../services/avatarService";
import { fetchPoints, fetchUsername } from "../services/profileService";
import stoneImage from "../assets/stone_texture.png";
import { updateCaloriesConsumed } from "../services/profileService";
import { useIsFocused } from "@react-navigation/native";
import { addGoalPoints } from "../services/profileService";
import { useSharedValue, withTiming } from "react-native-reanimated";
import AnimatedText from "../components/AnimatedText";
import FoodLog from "../components/FoodLog";
import BottomTabNav from "../components/BottomTabNav";
import {
  estimateStepCount,
  estimateCaloriesBurnt,
} from "../utils/calorieBurnt";

export default function Profile() {
  const navigation = useNavigation();
  const { session, profile, authMethod, logout } = useAuth();

  const userId = session?.user?.id;

  const SCREEN_HEIGHT = Dimensions.get("window").height;

  const { distance } = useDistance();

  const [localPoints, setLocalPoints] = useState(0);

  const [username, setUsername] = useState("User");

  const { userDemographics } = useProfileData();

  const [activeBottomTab, setActiveBottomTab] = useState("statistics");


 

  const avatarImage =
    userDemographics.gender === "Female" ? femaleAvatarImage : maleAvatarImage;

  useEffect(() => {
    console.log("User demographics:", userDemographics);
  }, [userDemographics]);

  //avatar accessories
  const [equipped, setEquipped] = useState({
    head: null,
    body: null,
    hand: null,
  });

  const dayLabelMap = {
    MON: "Monday",
    TUES: "Tuesday",
    WED: "Wednesday",
    THURS: "Thursday",
    FRI: "Friday",
    SAT: "Saturday",
    SUN: "Sunday",
    Total: "Total",
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        if (!session?.user?.id) return;

        setIsLoadingPoints(true);

        const fresh = await fetchEquippedItems(session.user.id);
        setEquipped(fresh);

        const userPoints = await fetchPoints(session.user.id);
        setLocalPoints(userPoints);
        setIsLoadingPoints(false);



        const username = await fetchUsername(session.user.id);
        setUsername(username);
      };

      loadData();
    }, [session?.user?.id])
  );

  const {
    totalCalories,
    calorieGoal,
    caloriesData,
    setTotalCalories,
    stepsData,
    setCalorieGoal,
  } = useProfileData();

  const [referenceData, setReferenceData] = useState([]);
  const [selectedDataType, setSelectedDataType] = useState("Steps");

  const { width } = useWindowDimensions();

  const selectedValue = useSharedValue(0);
  const progress = useSharedValue(0);
  const selectedBar = useSharedValue(null);
  const totalValue = referenceData.reduce((acc, curr) => acc + curr.value, 0);

  const [selectedDay, setSelectedDay] = useState("Total");

  const [isLoadingCalories, setIsLoadingCalories] = useState(true);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true); 
  const [isLoadingSteps, setIsLoadingSteps] = useState(true);

  const shouldShowLoadingPoints = isLoadingPoints || localPoints === undefined;
  const shouldShowLoadingSteps = isLoadingSteps || !userDemographics || Object.keys(userDemographics).length === 0;


// Use the loading state instead of checking for NaN
const shouldShowLoading = isLoadingCalories || !userDemographics || Object.keys(userDemographics).length === 0;


  useEffect(() => {
    if (referenceData.length > 0) {
      progress.value = withTiming(1, { duration: 1000 });
      selectedValue.value = withTiming(totalValue, { duration: 1000 });
    }
  }, [referenceData, totalValue]);
  useEffect(() => {
    if (selectedDataType === "Steps") {
      setReferenceData(stepsData);
    } else if (selectedDataType === "Calories Consumed") {
      setReferenceData(caloriesData);
    } else if (selectedDataType === "Calories Burnt") {
      const caloriesBurntData = stepsData.map(stepLog => {
        return {
          day: stepLog.day,
          value: estimateCaloriesBurnt(stepLog.value, userDemographics.weight) || null
        } 
      } 
    )
    console.log(caloriesBurntData)
    setReferenceData(caloriesBurntData)
    }
  }, [selectedDataType, caloriesData]);

  //fetch calories daily which refreshes whenever enter page

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && userId && userDemographics) {
      setIsLoadingCalories(true); 
      setIsLoadingSteps(true); 
      updateCaloriesConsumed(userId).then((profileRow) => {
        const { calories_consumed, calorie_goal } = profileRow;
  
        const steps = estimateStepCount(
          distance,
          userDemographics.height,
          userDemographics.gender
        );
        const burnt = estimateCaloriesBurnt(steps, userDemographics.weight);
  
        const netCalories = calories_consumed - burnt;
  
        setTotalCalories(netCalories);
        setCalorieGoal(calorie_goal);
        setIsLoadingSteps(false)
        setIsLoadingCalories(false);
      });
    }
  }, [isFocused, userId, userDemographics]);
  

  //console.log("totalCalories:", totalCalories);
  //console.log("calorieGoal:", calorieGoal);
  //console.log("progressPercentage:", progressPercentage);

  console.log('=== DEBUG ===');
  console.log('totalCalories:', totalCalories, 'type:', typeof totalCalories);
  console.log('calorieGoal:', calorieGoal, 'type:', typeof calorieGoal);
  console.log('userDemographics:', userDemographics);
  console.log('=============');
  
  const progressPercentage = 
  (!calorieGoal || calorieGoal === 0 || !totalCalories && totalCalories !== 0) 
    ? NaN 
    : Math.min((totalCalories / calorieGoal) * 100, 100);
  

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

  const touchHandler = (e) => {
    const touchX = e.nativeEvent.locationX;
    const touchY = e.nativeEvent.locationY;

    const step = x.step(); // spacing between points
    const index = Math.floor((touchX - barWidth / 2) / step);

    if (index >= 0 && index < referenceData.length) {
      const { day, value } = referenceData[index];

      const barCenter = x(day);

      if (barCenter != null) {
        if (
          touchX > barCenter - barWidth / 2 &&
          touchX < barCenter + barWidth / 2 &&
          touchY > graphHeight - y(value) &&
          touchY < graphHeight
        ) {
          setSelectedDay(day);
          selectedBar.value = day;
          selectedValue.value = withTiming(value);
          console.log({ value, day });
        } else {
          setSelectedDay("Total");
          selectedBar.value = null;
          selectedValue.value = withTiming(totalValue);
          console.log("outside range of bars");
        }
      }
    }
  };

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
          Welcome Back,{" "}
          {username === "User" ? (profile ? profile.username : "") : username}!
        </Text>

        <View className="flex-1 justify-center items-center mb-16">
          <View className="relative items-center">
          {shouldShowLoading  ? (
          <View style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            borderWidth: 10,
            borderColor: '#FFFFFF',
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ color: 'blue', fontSize: 40, fontWeight: 'bold' }}>...</Text>
          </View>
        ) : (
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
        )}

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
                  className={`${
                    Platform.OS === 'ios' ? 'w-8 h-8' : 'w-6 h-6'
                  }`}
                />

              <Text className={`text-stone-500 font-bold ml-1 ${
                  Platform.OS === 'ios' ? 'text-xl' : 'text-lg'
                }`}>
                  Points
                </Text>
              </View>
              <View>
                <Text className="text-black text-3xl font-extrabold">
                {shouldShowLoadingPoints
                  ? "..."
                  : (localPoints === undefined
                      ? (profile ? profile.points : 0)
                      : localPoints)
                }
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-xl p-4 flex-1 shadow-md mr-2">
              <View className="flex-row items-center">
                <Ionicons name="footsteps" size={Platform.OS === "ios" ? 20 : 16} color="black" />
                <Text
                  testID="steps-label"
                  className={`text-stone-500 font-bold ml-1 ${
                    Platform.OS === 'ios' ? 'text-xl' : 'text-lg'
                  }`}
                >
                  Steps
                </Text>
              </View>
              <View>
                <Text className="text-black text-3xl font-extrabold">
                {shouldShowLoadingSteps
                  ? "..."
                  : (userDemographics
                      ? estimateStepCount(
                          distance,
                          userDemographics.height,
                          userDemographics.gender
                        )
                      : "0")
                }
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-xl p-4 flex-1 shadow-md">
              <View className="flex-row items-center mb-1">
                <FontAwesome5 name="fire" size={Platform.OS === "ios" ? 20 : 16} color="black" />
                <Text className={`text-stone-500 font-bold ml-1 ${
                  Platform.OS === 'ios' ? 'text-base' : 'text-sm'
                }`}>Burnt </Text>
                <Text className={`text-stone-500 font-bold ${
                  Platform.OS === 'ios' ? 'text-base' : 'text-sm'
                }`}>Kcal</Text>
              </View>

              <Text className="text-black text-3xl font-extrabold">
              {userDemographics && 
                !isNaN(estimateCaloriesBurnt(
                  estimateStepCount(distance, userDemographics.height, userDemographics.gender),
                  userDemographics.weight
                ))
                  ? estimateCaloriesBurnt(
                      estimateStepCount(distance, userDemographics.height, userDemographics.gender),
                      userDemographics.weight
                    )
                  : "..."
                }
              </Text>
            </View>
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
              paddingHorizontal: 28,
              matginBottom: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Avatar Customisation");
              }}
            >
              <Text className="text-3xl text-white"> Avatar </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </LinearGradient>

      <BottomTabNav
        activeTab={activeBottomTab}
        onTabChange={setActiveBottomTab}
      />
      <View style={{ height: 550 }}>
        {activeBottomTab === "statistics" ? (
          <>
            <View className="bg-white flex-row justify-between items-center px-3 mt-2 mb-8">
              <Text className="text-xl font-bold ml-3">Statistics</Text>
              <View style={{ width: "45%"}}>
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
              onTouchStart={touchHandler}
            >
              {referenceData.map((dataPoint, index) => (
                <Group key={index}>
                  <BarPath
                    x={x(dataPoint.day)}
                    y={y(dataPoint.value)}
                    barWidth={barWidth}
                    graphHeight={graphHeight}
                    progress={progress}
                    label={dataPoint.day}
                    selectedBar={selectedBar}
                  />
                  <XAxisText
                    x={x(dataPoint.day)}
                    y={canvasHeight}
                    text={dataPoint.day}
                  />
                </Group>
              ))}
            </Canvas>

            <AnimatedText selectedValue={selectedValue} />

            <View className="justify-center items-center flex-row">
              {selectedDataType === "Steps" ? (
                <Ionicons name="footsteps-sharp" size={52} color="#ba4a00" />
              ) : selectedDataType === "Calories Burnt" ? (
                <FontAwesome5 name="fire" size={52} color="#FF7F50" />
              ) : <Ionicons name="nutrition" size={52} color="#f21127" /> }

              <Text className="text-lg text-black font-semibold ml-3 ">
                {dayLabelMap[selectedDay] || selectedDay}{" "}
                {selectedDataType === "Steps"
                  ? "Steps Taken"
                  : selectedDataType === "Calories Consumed" 
                  ? "Consumed Calories"
                  : "Burnt Calories"}
              </Text>
            </View>
          </>
        ) : (
          <View>
            <View className="bg-white">
              <View className="flex-row items-center px-3">
                <Text className="text-xl font-bold ml-3">Food Log</Text>
                <Image
                  source={require("../assets/Folder.png")}
                  className="w-12 h-12"
                />
              </View>
            </View>
            <FoodLog />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
