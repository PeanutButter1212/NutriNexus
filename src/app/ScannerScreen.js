import "../../global.css";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useState, useRef } from "react";
import { updateCaloriesConsumed } from "./ProfileScreen";
import { fetchTotalCalories } from "./ProfileScreen";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AntDesign } from '@expo/vector-icons';

export default function ScannerScreen({ navigation }) {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const { session } = useAuth();
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("0");

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
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleTakePhoto = async () => {
    // Process photo with ML model (simulated for now)
    if (cameraRef.current) {
      const options = {
        quality: 1,
        base64: true,
        exif: false, 
      };
      const takenPhoto = await cameraRef.current.takePictureAsync(options);
      console.log("Photo taken for ML processing:", takenPhoto.uri);
      //fpr marcus: simulated, can remove once u successfully integrated - eerson) 
      setFood("Fish Noodle");
      setCalories("450");
      
      Alert.alert("Success", "Photo processed! Food identified.");
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
      setCalories("0");
    }

    await updateCaloriesConsumed(session.user.id);
    await fetchTotalCalories();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Camera Section - Square with margins */}
      <View className="flex-1 justify-center items-center px-8 pt-20">
        <View className="w-full aspect-square bg-black rounded-2xl overflow-hidden">
          <CameraView className="flex-1" facing={facing} ref={cameraRef}>
            {/* CHANGED: Only flip camera button inside camera view - moved to top-right */}
            <View className="absolute top-4 right-4">
              <TouchableOpacity 
                className="bg-black/60 p-3 rounded-full"
                onPress={toggleCameraFacing}
              >
                <AntDesign name='retweet' size={20} color='white' />
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
        
        {/* NEW: Upload Button - Outside camera, between camera and Scanner title */}
        <View className="items-center mt-6 mb-4">
          <TouchableOpacity 
            className="w-32 bg-blue-600 rounded-xl py-4 items-center"
            onPress={handleTakePhoto}
          >
            <Text className="text-white text-base font-semibold">Upload</Text>
          </TouchableOpacity>
        </View>
      </View>


      <View className="flex-1 bg-white">
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
            <Text className="text-base font-bold text-black mb-2">Calories</Text>
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
    </View>
  );
}