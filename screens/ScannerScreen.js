import "../global.css";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useState, useRef } from "react";
import { fetchProfileCalories, fetchWeeklyCalories, updateCaloriesConsumed } from "../services/profileService";
import { CameraView, useCameraPermissions } from "expo-camera";
import { AntDesign } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
import { predictFoodFromImage, fetchCaloriesByFood, insertFoodEntry } from "../services/scannerService"

export default function ScannerScreen({ navigation }) {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const { session } = useAuth();
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("0");
  const [loading, setLoading] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center px-5">
        <Text className="text-center text-base mb-5">
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }
  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const handleTakePhoto = async () => {
    // Process photo with ML model
    setLoading(true);
    try {
      options = {
        quality: 1,
        base64: true,
        exif: false
      };

      const takenPhoto = await cameraRef.current.takePictureAsync(options);
      const foodDetected = await predictFoodFromImage(takenPhoto);
      setFood(foodDetected);

      const foodCalories = await fetchCaloriesByFood(foodDetected);
      setCalories(calories);

      await logActivity({ userId: session.user.id, food: foodDetected, calories });

    } catch (err) {
      console.error(err.message)
    } finally {
      setLoading(false); 
    }
  };

  const handleSubmit = async () => {
    console.log("Submit pressed", { food, calories });

    if (!food || !calories || calories === "0") {
      Alert.alert("Please take a photo first to identify the food");
      return;
    }

    if (!session || !session.user) {
      console.error("Not authenticated");
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    const userId = session.user.id 

    
    const { error } = await insertFoodEntry({ userId, food, calories }); 

    if (error) {
      console.error(error);
      Alert.alert("Error", "Could not log activity.");
    } else {
      Alert.alert("Success", "Activity logged!");
      setFood("");
      setCalories("0");
    }

    await updateCaloriesConsumed(userId);
    await fetchProfileCalories(userId);
    await fetchWeeklyCalories(userId);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Camera Section - Square with margins */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 8,
          paddingTop: 70,
        }}
      >
        <View
          style={{
            width: "100%",
            aspectRatio: 1,
            backgroundColor: "black",
            borderRadius: 16,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Camera */}
          <CameraView style={{ flex: 1 }} type={facing} ref={cameraRef} />

          {/* Overlay button */}
          <View className="absolute top-4 right-4 z-10">
            <TouchableOpacity
              className="bg-black/60 p-3 rounded-full"
              onPress={toggleCameraFacing}
            >
              <AntDesign name="retweet" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Upload Button  */}
        <View className="items-center mt-6 mb-4">
          <TouchableOpacity
            className="w-32 bg-blue-600 rounded-xl py-4 items-center"
            onPress={handleTakePhoto}
          >
            <Text className="text-white text-base font-semibold">Upload</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 bg-white mt-20">
        <View className="px-5 flex-1">
          <View className="mb-4">
            <Text className="text-base font-bold text-black mb-2">Food</Text>
            <View className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-100">
              <Text className="text-base text-gray-700">
                {food || "Take a photo to identify food"}
              </Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-base font-bold text-black mb-2">
              Calories
            </Text>
            <View className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-100">
              <Text className="text-base text-gray-700">{calories} kcal</Text>
            </View>
          </View>

          {/* Submit Button */}
          <View className="items-center">
            <TouchableOpacity
              className="w-32 bg-green-600 rounded-xl py-4 items-center"
              onPress={handleSubmit}
            >
              <Text className="text-white text-base font-semibold">Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* loading circle for upload*/}
      {loading && (
        <View
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: [{ translateX: -25 }, { translateY: -25 }],
          }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
}
