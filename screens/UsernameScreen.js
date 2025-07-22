import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase'; // make sure your Supabase client is set up correctly
import { LinearGradient } from "expo-linear-gradient";
import pointLogo from '../assets/Points.png'
import Ionicons from '@expo/vector-icons/Ionicons';
import AccessoryPopUp from '../components/AccessoryPopup';
import { updateUsername } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';
import useProfileData from '../hooks/useProfileData';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { uploadProfileImage } from '../services/profileService.js';
import defaultProfilePic from '../assets/Green_Background.png';
import { Image as ExpoImage } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProfilePicture } from '../services/publicDetailsService';



export default function UsernameScreen({ navigation }) {
  const [usernameInput, setUsernameInput] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const { session } = useAuth() 
  const userId = session?.user?.id 

  

  const { username, profilePic } = useProfileData() 



  const [showUsernamePopup, setShowUsernamePopup] = useState(false)
  const [showProfilePicPopup, setShowProfilePicPopup] = useState(false)

  const [loading, setLoading] = useState(false);



  const [imageUri, setImageUri] = useState(null);

  const [cachedPic, setCachedPic] = useState(null);




  const [currentDisplayImage, setCurrentDisplayImage] = useState(null);

  const getCacheKey = (userId) => `cachedProfilePic_${userId}`;

  useEffect(() => {
    const loadCachedImage = async () => {
      if (!userId) return;

      try {
        const key = getCacheKey(userId);
        const cachedImage = await AsyncStorage.getItem(key);
        
        if (cachedImage) {
          console.log("Loading cached image immediately:", cachedImage);
          setCurrentDisplayImage(cachedImage);
        }
      } catch (error) {
        console.error("Error loading cached image:", error);
      }
    };

    loadCachedImage();
  }, [userId]);

  useEffect(() => {
    const updateWithFreshData = async () => {
      if (!userId) return;

      if (username) {
        setUsernameInput(username);
      }

      if (profilePic) {
        console.log("Updating with fresh profilePic:", profilePic);
        setCurrentDisplayImage(profilePic);
        
        try {
          const key = getCacheKey(userId);
          await AsyncStorage.setItem(key, profilePic);
          console.log("Cache updated with fresh data");
        } catch (error) {
          console.error("Error updating cache:", error);
        }
      }
    };

    updateWithFreshData();
  }, [userId, username, profilePic]);



  const handleChangePhoto = async () => {
    try {
      
      setLoading(true)

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
  
  
  
      if (result.canceled || result.cancelled) {
        console.log("User cancelled");
        return;
      }
  

      let selectedUri = null;
      
      if (result.assets && result.assets.length > 0) {
        selectedUri = result.assets[0].uri;
      } else if (result.uri) {
        selectedUri = result.uri;
        console.log("Got URI from result:", selectedUri);
      }
      
      if (!selectedUri) {
        alert("Could not get image. Please try again.");
        return;
      }

      const currentPicUrl = await fetchProfilePicture(userId)
      const defaultUrl =  "https://rkrdnsnujizdskzbdwlp.supabase.co/storage/v1/object/public/profile-pictures//Green_Background.png";

  
      if (currentPicUrl !== defaultUrl) {


        const match = currentPicUrl.match(/\/profile-pictures\/public\/(.+?)(?:\?|$)/);
        const fileName = match?.[1];

    
        if (fileName) {
          const { data: deleteData, error: deleteError } = await supabase
          .storage
          .from("profile-pictures")
          .remove([`public/${fileName}`]);
        

          if (deleteError) {
            console.error("Failed to delete old profile pic: " + deleteError)
          } 
        }
      }
  
   
      setCurrentDisplayImage(selectedUri);

      const publicUrl = await uploadProfileImage(userId, selectedUri);
      
      const { error } = await supabase
        .from('username')
        .update({ profile_pic_url: publicUrl })
        .eq('user_id', userId);
  
      if (error) {
        console.error("Database error:", error);
        alert("Failed to save image to database");
        return;
      }

      const key = getCacheKey(userId);
      await AsyncStorage.setItem(key, publicUrl);
      setCachedPic(publicUrl);
      setCurrentDisplayImage(publicUrl);
      setLoading(false)
      setShowProfilePicPopup(true);
      setErrorMessage('');
      
    } catch (err) {
      alert("Upload failed: " + err.message);
      setErrorMessage("Failed to upload image.");
      setLoading(false)
    }
  };

  const handleSubmitUsername = async () => {
    if (!username) {
        setErrorMessage("Please enter a username.");
        return;
    }
    if (usernameInput.length > 18) {
      setErrorMessage("Username cannot be longer than 16 characters.");
      return;
    }
    try {
        setLoading(true)
        await updateUsername(userId, usernameInput);
        setLoading(false)
        setShowUsernamePopup(true)
      } catch (err) {
        setErrorMessage(err.message);
        setLoading(false)
      }

  }

  return (

    <View className="items-center flex-1"> 

    <View
    className="mt-48"
    > 
    <Text className="text-4xl font-bold text-black text-center">
        Edit Profile Information
     </Text>
    

    </View>

    <Text
    className="text-3xl font-bold mt-8"
    >
      Profile Picture
    </Text>

  
    <ExpoImage
        source={
          currentDisplayImage 
            ? currentDisplayImage
            : "https://rkrdnsnujizdskzbdwlp.supabase.co/storage/v1/object/public/profile-pictures//Green_Background.png"
  }
  style={{ width: 128, height: 128, borderRadius: 64, marginTop: 32 }}
  contentFit="cover"
  placeholder="blur"
/>

      
      <TouchableOpacity 
      disabled={loading}
      onPress={handleChangePhoto}>
      <Text className="mt-2 underline text-sky-700 text-base">Change Photo</Text>
      </TouchableOpacity>

    <Text
    className="text-3xl font-bold mt-4"
    >
     Username 
    </Text>
    

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
        disabled={loading}
        className="items-center justify-center bg-green-600 rounded-xl mt-6
        py-3 mt-3 px-[100px]"
      >
        <Text className="text-white text-base font-medium">Submit Changes</Text>
      </TouchableOpacity>


    <TouchableOpacity
        onPress={() => navigation.goBack()}
        disabled={loading}
        className="items-center justify-center bg-red-500 rounded-xl mt-6
        py-3 mt-3 px-[135px]"
      >
        <Text className="text-white text-base font-medium"> Back </Text>
      </TouchableOpacity>

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
            visible={showUsernamePopup}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
              setShowUsernamePopup(false);
            }}
            
        >
            <View 
            className="flex-1 bg-black/50"
            >
            <AccessoryPopUp 
            success={true}
            messageHeading={"Success!"}
            messageDescription={"Your username has been successfully updated"}
            onContinue={() => {
              setShowUsernamePopup(false);
            }}/>
            </View>
        </Modal>

        <Modal
            visible={showProfilePicPopup}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
              setShowProfilePicPopup(false)
            }}
            
        >
            <View 
            className="flex-1 bg-black/50"
            >
            <AccessoryPopUp 
            success={true}
            messageHeading={"Success!"}
            messageDescription={"Your Profile Picture has been successfully updated"}
            onContinue={() => {
              setShowProfilePicPopup(false);
            }}/>
            </View>
        </Modal>
    
</View>

   
  );
}