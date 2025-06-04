import "../global.css";

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";

import { Image } from "react-native";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";
import { fetchActivityLog } from "../services/profileService";
import useActivityLog from "../hooks/useActivityLog"

export default function ActivityLogScreen({ navigation }) {
  const entries = useActivityLog();
  const { session, refreshFlag } = useAuth();


  useEffect(() => {
    const loadEntries = async () => {
      try {
        const userId = session?.user?.id
        userLog = await fetchActivityLog(userId)
        setEntries(logs || [])
      } catch (err) {
        console.error(err)
      }
    };
    loadEntries(); 
  }, [refreshFlag, session])
   //whenever the refresh flag changes(ie when updated table then it updates log)

  return (
    <View className="flex-1 items-center justify-start bg-green-300 pt-28 px-4">
      {/* Activity Log*/}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          marginTop: 3,
        }}
      >
        <Text className="text-3xl font-semibold text-black text-center">
          Activity Log
        </Text>
        {/* Folder image*/}
        <Image
          source={require("../assets/Folder.png")}
          className="w-40 h-40"
        />
      </View>

      {/*Headings*/}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 40,
          marginTop: 3,
        }}
      >
        <Text className="text-xl font-semibold text-black">Food</Text>
        <Text className="text-xl font-semibold text-black">Calories(kcal)</Text>
        <Text className="text-xl font-semibold text-black">Date</Text>
        <Text className="text-xl font-semibold text-black">Time </Text>
      </View>
      <ScrollView>
        {entries.map((item) => (
          <View
            key={item.id}
            className="flex-row w-full bg-white px-2 py-2 mb-1 rounded-md"
          >
            <Text className="w-1/4 text-black">{item.food}</Text>
            <Text className="w-1/4 text-black text-center">
              {item.calories}
            </Text>
            <Text className="w-1/4 text-black text-right text-xs">
              {new Date(item.date).toLocaleDateString()}
            </Text>
            <Text className="w-1/4 text-black text-right text-xs">
              {item.time
                ? new Date(`1970-01-01T${item.time}Z`).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : ""}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/*Back Button*/}
      <TouchableOpacity
        onPress={() => navigation.navigate("MainTabs")}
        className="flex-row items-center justify-center w-full bg-green-600 rounded-xl mt-6 py-3"
      >
        <Text className="text-white text-base font-medium font-bold">Back</Text>
      </TouchableOpacity>
    </View>
  );
}
