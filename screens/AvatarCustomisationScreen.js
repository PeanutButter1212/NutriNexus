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
import useAccessoryInventory from "../hooks/useAccesoryInventory";
import { useEffect, useState } from "react";

import SimpleInventorySlot from "../components/SimpleInventorySlot";
import { fetchAccessory } from "../services/avatarService";

export default function AvatarCustomisationScreen({ navigation }) {
  const [accessories, setAccessories] = useState([]);

  useEffect(() => {
    const loadAccessories = async () => {
      const data = await fetchAccessory();
      console.log("Loaded accessories:", data);
      setAccessories(data);
    };

    loadAccessories();
  }, []);
  return (
    <View className="flex-1 m-0 p-0 bg-black">
      <ImageBackground
        source={backgroundImage}
        resizeMode="cover" //contain can help keep original size
        className="flex-1 justify-start items-center"
      >
        <Image source={avatarImage} className="w-56 h-96 mt-28" />
      </ImageBackground>

      <View className="h-16 w-full">
        <Image source={inventoryImage} className="w-full h-full mt-2" />
      </View>

      <ImageBackground
        source={inventoryBackground}
        resizeMode="cover"
        className="flex-1 justify-start items-center"
      >
        <View className="flex-row flex-wrap justify-center gap-4">
          {accessories.map((item, index) => (
            <SimpleInventorySlot key={index}>
              <Image
                source={{ uri: item.image_url }}
                className="w-16 h-16"
                resizeMode="contain"
              ></Image>
            </SimpleInventorySlot>
          ))}
        </View>

        <TouchableOpacity className="bg-white rounded-xl p-4 shadow-md">
          <Text className="text-black text-base font-medium">Save</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}
