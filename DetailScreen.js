import "./global.css";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import Slider from "@react-native-community/slider";

export default function DetailScreen({ navigation }) {
  const [weight, setWeight] = useState(80);
  const [height, setHeight] = useState(150);
  const [age, setAge] = useState(70);
  const [calories, setCalories] = useState(70);

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View className="items-center px-6 pt-32">
        {/* Details header */}
        <Text className="text-5xl font-bold text-black">Details</Text>

        {/* Slider Weight*/}
        <Text className="text-2xl font-semibold mb-4 text-black text-center pt-12">
          Weight: {weight} kg
        </Text>

        <View className="self-stretch px-6 mt-4">
          <Slider
            value={weight}
            onValueChange={setWeight}
            minimumValue={0.0}
            maximumValue={200.0}
            step={1}
            minimumTrackTintColor="#10b981"
            maximumTrackTintColor="#4b5563"
            thumbTintColor="#10b981"
            style={{ height: 40 }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 8,
            }}
          >
            <Text className="text-sm  text-gray-500">0 kg</Text>
            <Text className="text-sm text-gray-500">200 kg</Text>
          </View>
        </View>

        {/* Slider Height*/}
        <Text className="text-2xl font-semibold mb-4 text-black text-center pt-12">
          Height: {height} cm
        </Text>

        <View className="self-stretch px-6 mt-4">
          <Slider
            value={height}
            onValueChange={setHeight}
            minimumValue={50}
            maximumValue={200}
            step={1}
            minimumTrackTintColor="#10b981"
            maximumTrackTintColor="#4b5563"
            thumbTintColor="#10b981"
            style={{ height: 40 }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 8,
            }}
          >
            <Text className="text-sm  text-gray-500">50 cm</Text>
            <Text className="text-sm text-gray-500">200 cm</Text>
          </View>
        </View>

        {/* Slider Age*/}
        <Text className="text-2xl font-semibold mb-4 text-black text-center pt-12">
          Age: {age}
        </Text>

        <View className="self-stretch px-6 mt-4">
          <Slider
            value={age}
            onValueChange={setAge}
            minimumValue={0}
            maximumValue={100}
            step={1}
            minimumTrackTintColor="#10b981"
            maximumTrackTintColor="#4b5563"
            thumbTintColor="#10b981"
            style={{ height: 40 }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 8,
            }}
          >
            <Text className="text-sm  text-gray-500">0</Text>
            <Text className="text-sm text-gray-500">100</Text>
          </View>
        </View>

        {/* Slider Calories*/}
        <Text className="text-2xl font-semibold mb-4 text-black text-center pt-12">
          Calorie Goal: {calories} kcal
        </Text>

        <View className="self-stretch px-6 mt-4">
          <Slider
            value={calories}
            onValueChange={setCalories}
            minimumValue={1000}
            maximumValue={4000}
            step={1}
            minimumTrackTintColor="#10b981"
            maximumTrackTintColor="#4b5563"
            thumbTintColor="#10b981"
            style={{ height: 40 }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 8,
            }}
          >
            <Text className="text-sm  text-gray-500">1000 kcal</Text>
            <Text className="text-sm text-gray-500">4000 kcal</Text>
          </View>
        </View>

        <TouchableOpacity className="flex-row items-center justify-center w-full bg-green-600 rounded-xl mt-6 py-3">
          <Text className="text-white text-base font-medium font-bold">
            Submit
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
