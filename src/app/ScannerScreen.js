import "../../global.css";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useState } from "react";

export default function ScannerScreen({ navigation }) {
  const { session } = useAuth();
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");

  const handleSubmit = async () => {
    console.log("Submit pressed", { food, calories });
    if (!food || !calories) {
      Alert.alert("Please fill in both values");
      return;
    }
    if (!session || !session.user) {
      console.error("Not authenticated");
      Alert.alert("Error", "You must be logged in.");
      return;
    }
    console.log("Trying to insert", {
      food,
      calories: parseInt(calories),
      user_id: session.user.id,
    });
    const { error } = await supabase.from("activity_log").insert([
      {
        food,
        calories: parseInt(calories),
        user_id: session.user.id,
      },
    ]);

    if (error) {
      console.error(error);
      Alert.alert("Error", "Could not log activity.");
    } else {
      Alert.alert("Success", "Activity logged!");
      setFood("");
      setCalories("");
    }

    await supabase.from("activity_log").insert(newEntry);
    triggerRefresh();
  };
  return (
    <View className="flex-1 items-center justify-start bg-white pt-28 px-4">
      {/* Scanner */}
      <Text className="text-3xl font-semibold text-black text-center">
        Scanner
      </Text>
      {/* Input to test log */}
      <View>
        <Text className="text-base font-bold text-black">Food</Text>
        <TextInput
          value={food}
          onChangeText={setFood}
          placeholder="Food"
          className="ml-4 border border-gray-300 rounded-xl mt-2 px-4 py-3 text-base w-80"
        />
      </View>

      <View>
        <Text className="text-base font-bold text-black">Calories</Text>
        <TextInput
          value={calories}
          onChangeText={setCalories}
          placeholder="Calories"
          className="ml-4 border border-gray-300 rounded-xl mt-2 px-4 py-3 text-base w-80"
        />
      </View>

      <TouchableOpacity
        className="flex-row items-center justify-center w-full bg-green-600 rounded-xl mt-6 py-3"
        onPress={handleSubmit}
      >
        <Text className="text-white text-base font-medium font-bold">
          Submit
        </Text>
      </TouchableOpacity>

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
}
