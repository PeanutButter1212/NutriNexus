import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput } from 'react-native';
import { supabase } from '../lib/supabase'; // make sure your Supabase client is set up correctly
import { LinearGradient } from "expo-linear-gradient";
import pointLogo from '../assets/Points.png'
import Ionicons from '@expo/vector-icons/Ionicons';
import AccessoryPopUp from '../components/AccessoryPopup';
import { updateUsername } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';
import useProfileData from '../hooks/useProfileData';

export default function UsernameScreen({ navigation }) {
  const [usernameInput, setUsernameInput] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const { session } = useAuth() 
  const userId = session?.user?.id 

  const { username } = useProfileData() 

  useEffect(() => {
    console.log("Username: " + username)
    if (username) {
      setUsernameInput(username);
    }
  }, [username]);
  

  const handleSubmitUsername = async () => {
    if (!username) {
        setErrorMessage("Please enter a username.");
        return;
    }
    try {
        await updateUsername(userId, usernameInput);
        navigation.replace("MainTabs")
      } catch (err) {
        setErrorMessage(err.message);
      }

  }

  return (

    <View className="items-center flex-1"> 

    <View
    className="mt-48"
    > 
    <Text className="text-4xl font-bold text-black text-center">
        Edit your username
     </Text>
    

    </View>
    

    <TextInput
        value={usernameInput}
        onChangeText={(text) => setUsernameInput(text)}
        placeholder="Username"
        autoCapitalize="none"
        className="w-[310px] border-2 border-gray-300 rounded-xl mt-4 px-4 py-3 text-base bg-white"
      />

    {/* Error Message */}
    {errorMessage ? (
    <Text className="text-red-500 font-semibold mt-4">
        {errorMessage}
    </Text>
    ) : null}



    <TouchableOpacity
        onPress={handleSubmitUsername}
        className="items-center justify-center bg-green-600 rounded-xl mt-6
        py-3 mt-3 px-[100px]"
      >
        <Text className="text-white text-base font-medium">Submit Changes</Text>
      </TouchableOpacity>


    <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="items-center justify-center bg-red-500 rounded-xl mt-6
        py-3 mt-3 px-[135px]"
      >
        <Text className="text-white text-base font-medium"> Back </Text>
      </TouchableOpacity>
    
</View>

   
  );
}