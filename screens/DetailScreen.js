import "../global.css";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal
} from "react-native";
import React, { useState, useEffect } from "react";
import Slider from "@react-native-community/slider";
import { useRoute } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import useProfileData from "../hooks/useProfileData"; 
import { useNavigation } from "@react-navigation/native";
import { updateProfileDetails } from "../services/profileService";
import { calculateRecommendedCalories } from "../utils/calculateRecommendedCalories";
import AccessoryPopUp from "../components/AccessoryPopup";
export default function DetailScreen() {
  const navigation = useNavigation()
  const { session, profile } = useAuth();
  const [weight, setWeight] = useState(80);
  const [height, setHeight] = useState(150);
  const [age, setAge] = useState(70);
  const [calories, setCalories] = useState(70);
  const [gender, setGender] = useState("Male");
  const TABS = ["Male", "Female"]
  const [demographicAdjusted, setDemographicAdjusted] = useState(false);

  const [showPopup, setShowPopup] = useState("false")
  const [loading, setLoading] = useState(false)

  const { calorieGoal, userDemographics } = useProfileData() 
  
  useEffect(() => {
    
    if (userDemographics && Object.keys(userDemographics).length > 0) {
      
      if (userDemographics.weight !== undefined) {
        setWeight(userDemographics.weight);
      }
      
      if (userDemographics.height !== undefined) {
        setHeight(userDemographics.height);
      }
      
      if (userDemographics.age !== undefined) {
        setAge(userDemographics.age);
      }
      
      if (userDemographics.gender !== undefined) {
        setGender(userDemographics.gender);
      } 
      
      if (calorieGoal !== undefined && calorieGoal !== null) {
      setCalories(calorieGoal);
    }

    }
  
  
  }, [userDemographics]); 

  useEffect(() => {
    if (demographicAdjusted) {
      const calculatedCalories = calculateRecommendedCalories(weight, height, age, gender);
      console.log("Calculated Calories: " + calculatedCalories);
      setCalories(calculatedCalories);
    }
  }, [weight, height, age, gender]);
  

  const handleSubmit = async () => {
    setLoading(true)
    if (!weight || !height || !age || !calories || !gender) {
      Alert.alert("Missing info", "Please fill in all fields.");
      setLoading(false)
      return;
    }

    const success = await updateProfileDetails(session, {
      weight: parseInt(weight),
      height: parseInt(height),
      age: parseInt(age),
      calories: parseInt(calories),
      gender, 
    });

    if (success) {
      setLoading(false)
      setShowPopup(true)
    } else {
      Alert.alert("Error", "error lol")
      setLoading(false)
    }
  };

    

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View className="items-center px-6 pt-32">
        {/* Details header */}
        <Text className="text-5xl font-bold text-black underline">Details</Text>

        {/* Slider Weight*/}
        <Text className="text-2xl font-semibold mb-4 text-black text-center pt-12">
          Weight: {weight} kg
        </Text>

        <View className="self-stretch px-6 mt-4">
          <Slider
            value={weight}
            onValueChange={(value) => {
              setWeight(value);
              setDemographicAdjusted(true); 
            }}
            minimumValue={50.0}
            maximumValue={250.0}
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
            <Text className="text-sm  text-gray-500">50 kg</Text>
            <Text className="text-sm text-gray-500">250 kg</Text>
          </View>
        </View>

        {/* Slider Height*/}
        <Text className="text-2xl font-semibold mb-4 text-black text-center pt-12">
          Height: {height} cm
        </Text>

        <View className="self-stretch px-6 mt-4">
          <Slider
            value={height}
            onValueChange={(value) => {
              setHeight(value);
              setDemographicAdjusted(true); 
            }}
            minimumValue={50}
            maximumValue={250}
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
            <Text className="text-sm text-gray-500">250 cm</Text>
          </View>
        </View>

        {/* Slider Age*/}
        <Text className="text-2xl font-semibold mb-4 text-black text-center pt-12">
          Age: {age}
        </Text>

        <View className="self-stretch px-6 mt-4">
          <Slider
            value={age}
            onValueChange={(value) => {
              setAge(value);
              setDemographicAdjusted(true); 
            }}
            minimumValue={18}
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
            <Text className="text-sm  text-gray-500">18</Text>
            <Text className="text-sm text-gray-500">100</Text>
          </View>
        </View>

        <View className="w-full">
          <Text className="text-2xl font-semibold mb-4 text-black text-center pt-12">
            Gender
          </Text>

          <View className="px-6 mt-4">
                <View
                className="bg-black flex-row rounded-lg overflow-hidden">
                    {TABS.map((tab) => (
                        <TouchableOpacity
                        key={tab}
                        className="flex-1 py-3"
                        onPress={() => setGender(tab)}
                        style={{
                            backgroundColor: gender == tab ? "#419e34" : "transparent"
                        }}
                        > 
                            <Text
                            className="text-center text-white text-xl"
                            style={{
                                fontFamily: gender == tab ? 'Nunito-ExtraBold' : 'Nunito-Bold'
                            }}
                            > 
                            {tab}
                            </Text>

                        </TouchableOpacity>
                    ))
                    
                    }

                </View>
            </View>
        </View>

        <View
        className="w-full bg-black h-px my-12"
      />


        {/* Slider Calories*/}
        <Text className="text-2xl font-semibold mb-4 text-black text-center">
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

     

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className="flex-row items-center justify-center w-full bg-green-600 rounded-xl mt-12 py-3 "
        >
          <Text className="text-white text-base font-medium font-bold">
            Submit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="items-center justify-center bg-red-500 w-full rounded-xl mt-6
        py-3 mt-3"
      >
        <Text className="text-white text-base font-medium">Back</Text>
      </TouchableOpacity>

      </View>

      <Modal
            visible={showPopup}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
              setShowPopup(true);
              navigation.replace("MainTabs");
            }}
            
        >
            <View 
            className="flex-1 bg-black/50"
            >
            <AccessoryPopUp 
            success={true}
            messageHeading={"Success!"}
            messageDescription={"Your profile details has been successfully updated"}
            onContinue={() => {
              setShowPopup(true);
              navigation.replace("MainTabs");
            }}/>
            </View>
        </Modal>


    </ScrollView>

      
  );
}