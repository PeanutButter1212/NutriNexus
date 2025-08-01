import "../global.css";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Button,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import {
  fetchProfileCalories,
  fetchWeeklyCalories,
  updateCaloriesConsumed,
} from "../services/profileService";
import { CameraView, useCameraPermissions } from "expo-camera";
import { AntDesign } from "@expo/vector-icons";
import {
  predictFoodFromImage,
  fetchCaloriesByFood,
  insertFoodEntry,
  fetchFoodSuggestions,
} from "../services/scannerService";
import { useIsFocused } from "@react-navigation/native";
import AccessoryPopUp from "../components/AccessoryPopup";

export default function ScannerScreen({ cameraRef: externalRef }) {
  const internalRef = useRef(null);
  const cameraRef = externalRef || internalRef; //to enable mock for testing
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  //const cameraRef = useRef(null);
  const { session } = useAuth();
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("0");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const userId = session?.user?.id;
  const isFocused = useIsFocused(); //to make camera remount when come back to screen
  const [showNoFoodDetectedPopup, setShowNoFoodDetectedPopup] = useState(false);
  const [showFoodDetectedPopup, setShowFoodDetectedPopup] = useState(false);
  const [showSubmittedPopup, setShowSubmittedPopup] = useState(false);
  const [showNoPhotoPopup, setShowNoPhotoPopup] = useState(false);
  //load suggestions
  useEffect(() => {
    const load = async () => {
      if (query.length === 0) return setSuggestions([]);
      const results = await fetchFoodSuggestions(query);
      setSuggestions(results);
    };
    load();
  }, [query]);

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
      const options = {
        quality: 1,
        base64: true,
        exif: false,
      };

      if (!cameraRef.current) {
        throw new Error("Camera not ready");
      }

      const takenPhoto = await cameraRef.current.takePictureAsync(options);
      const foodDetected = await predictFoodFromImage(takenPhoto);

      if (__DEV__ && userId == "3049f10a-7516-4234-af44-9aff4bafdffb") {
        setFood("chicken rice");
        setCalories("600");
        setShowFoodDetectedPopup(true);
        return;
      }

      const detectedName = foodDetected?.detections?.[0];

      setFood(detectedName);

      if (detectedName === undefined) {
        throw new Error("Error detecting food");
      }

      const foodCalories = await fetchCaloriesByFood(detectedName);
      setCalories(foodCalories);

      setShowFoodDetectedPopup(true);

      /*await logActivity({
        userId: session.user.id,
        food: foodDetected,
        calories,
      });*/
    } catch (err) {
      if (err.message === "Error detecting food") {
        setShowNoFoodDetectedPopup(true);
      } else {
        console.error("General error:", err.message);
      }
    } finally {
      setLoading(false);
      await cameraRef.current.resumePreview(); //reset camera to prevent black screen
    }
  };

  const handleSubmit = async () => {
    console.log("Submit pressed", { food, calories });

    setLoading(true);

    if (!food || !calories || calories === "0") {
      setShowNoPhotoPopup(true);
      setLoading(false);
      return;
    }

    if (!session || !session.user) {
      console.error("Not authenticated");
      Alert.alert("Error", "You must be logged in.");
      setLoading(false);
      return;
    }

    const userId = session.user.id;

    const { error } = await insertFoodEntry({ userId, food, calories });

    if (error) {
      console.error(error);
      Alert.alert("Error", "Could not log activity.");
      setLoading(false);
    } else {
      setShowSubmittedPopup(true);
      setFood("");
      setCalories("0");
    }

    await updateCaloriesConsumed(userId);
    await fetchProfileCalories(userId);
    await fetchWeeklyCalories(userId);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-gray-50">
          {/* Camera Section - Square with margins */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 8,
              paddingTop: 70,
              marginTop: 15,
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
              {isFocused && (
                <CameraView style={{ flex: 1 }} type={facing} ref={cameraRef} />
              )}

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
                disabled={loading}
              >
                <Text className="text-white text-base font-semibold">
                  Upload
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-1 bg-white mt-20">
            <View className="px-5 flex-1">
              <View className="mb-4">
                <Text className="text-base font-bold text-black mb-2">
                  Food
                </Text>
                <View className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-100">
                  <TextInput
                    className="text-base text-gray-700"
                    placeholder="Take a photo or type to search"
                    value={food}
                    onChangeText={(text) => {
                      setFood(text);
                      setQuery(text);
                      setCalories("0");
                    }}
                  />
                </View>
                {suggestions.length > 0 && (
                  <View
                    style={{
                      maxHeight: 120,
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      elevation: 4, // Android shadow
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      marginTop: 6,
                      overflow: "hidden",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <FlatList
                      data={suggestions}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={async () => {
                            setFood(item.name);
                            setQuery("");
                            setSuggestions([]);

                            const cals = await fetchCaloriesByFood(item.name);
                            setCalories(cals);
                          }}
                          className="py-2"
                        >
                          <Text className="text-base text-gray-700">
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </View>

              <View className="mb-6">
                <Text className="text-base font-bold text-black mb-2">
                  Calories
                </Text>
                <View className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-100">
                  <Text className="text-base text-gray-700">
                    {calories} kcal
                  </Text>
                </View>
              </View>

              {/* Submit Button */}
              <View className="items-center">
                <TouchableOpacity
                  className="w-32 bg-green-600 rounded-xl py-4 items-center"
                  disabled={loading}
                  onPress={() => {
                    handleSubmit();
                    //updateCaloriesConsumed(userId);
                  }}
                >
                  <Text className="text-white text-base font-semibold">
                    Submit
                  </Text>
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

          <Modal
            visible={showNoFoodDetectedPopup}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowNoFoodDetectedPopup(false)}
          >
            <View className="flex-1 bg-black/50">
              <AccessoryPopUp
                success={false}
                messageHeading={"No detected food found"}
                messageDescription={
                  "We could not identify the food taken in your picture! :("
                }
                onContinue={() => setShowNoFoodDetectedPopup(false)}
              />
            </View>
          </Modal>

          <Modal
            visible={showFoodDetectedPopup}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowFoodDetectedPopup(false)}
          >
            <View className="flex-1 bg-black/50">
              <AccessoryPopUp
                success={true}
                messageHeading={"Food Detected!"}
                messageDescription={
                  <Text>
                    We successfully detected:{" "}
                    <Text className="text-2xl font-black text-green-600">
                      {food}
                    </Text>
                  </Text>
                }
                onContinue={() => setShowFoodDetectedPopup(false)}
              />
            </View>
          </Modal>

          <Modal
            visible={showSubmittedPopup}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowSubmittedPopup(false)}
          >
            <View className="flex-1 bg-black/50">
              <AccessoryPopUp
                success={true}
                messageHeading={"Update Success"}
                messageDescription={
                  "This food entry has been successfully logged!"
                }
                onContinue={() => setShowSubmittedPopup(false)}
              />
            </View>
          </Modal>

          <Modal
            visible={showNoPhotoPopup}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowNoPhotoPopup(false)}
          >
            <View className="flex-1 bg-black/50">
              <AccessoryPopUp
                success={false}
                messageHeading={"No food or entry keyed in!"}
                messageDescription={
                  "Please take a photo first to identify the food or key in a manual food entry first before submitting!"
                }
                onContinue={() => setShowNoPhotoPopup(false)}
              />
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
