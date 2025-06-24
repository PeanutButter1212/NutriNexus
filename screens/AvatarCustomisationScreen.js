import React from "react";
import {
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";
import backgroundImage from "../assets/CustomisationBackground.png";
import avatarImage from "../assets/MaleCharacter.png";
import inventoryImage from "../assets/InventorySign.png";
import inventoryBackground from "../assets/Background.png";

export default function AvatarCustomisationScreen({ navigation }) {
  return (
    <View className="flex-1 m-0 p-0 bg-black">
      <ImageBackground
        source={backgroundImage}
        resizeMode="cover" //contain can help keep original size
        className="flex-[1] justify-start items-center"
      >
        <Image source={avatarImage} className="w-56 h-96 mt-52" />
      </ImageBackground>
      <Image source={inventoryImage} className="w-full h-16" />

      <ImageBackground
        source={inventoryBackground}
        resizeMode="cover"
        className="flex-[2] justify-start items-center"
      >
        <TouchableOpacity className="bg-white rounded-xl p-4 shadow-md">
          <Text className="text-black text-base font-medium">Save</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}
