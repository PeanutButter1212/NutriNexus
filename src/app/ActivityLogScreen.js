import "../../global.css";

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

import { AntDesign } from "@expo/vector-icons";
import { Image } from "react-native";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function ActivityLogScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const { session } = useAuth();

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", session.user.id)
        .order("inserted_at", { ascending: false });

      if (error) {
        console.error("Error fetching logs:", error);
      } else {
        setEntries(data);
      }
    };
    fetchEntries();
  }, []);

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
          source={require("../../assets/Folder.png")}
          className="w-40 h-40"
        />
      </View>
      {entries.map((item) => (
        <View
          key={item.id}
          className="flex-row justify-between w-full bg-white px-4 py-2 mb-2 rounded-md"
        >
          <Text className="w-1/3 text-black">{item.food}</Text>
          <Text className="w-1/3 text-black text-center">{item.calories}</Text>
          <Text className="w-1/3 text-black text-right text-xs">
            {new Date(item.inserted_at).toLocaleString()}
          </Text>
        </View>
      ))}
      <TouchableOpacity
        onPress={() => navigation.navigate("Profile")}
        className="flex-row items-center justify-center w-full bg-green-600 rounded-xl mt-6 py-3"
      >
        <Text className="text-white text-base font-medium font-bold">Back</Text>
      </TouchableOpacity>
    </View>
  );
}
