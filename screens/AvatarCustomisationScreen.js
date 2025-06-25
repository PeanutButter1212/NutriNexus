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
import useAccessoryInventory from "../hooks/useAccessoryInventory";
import { useEffect, useState } from "react";

import SimpleInventorySlot from "../components/SimpleInventorySlot";

export default function AvatarCustomisationScreen({ navigation }) {
  //const [accessories, setAccessories] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [equipped, setEquipped] = useState({
    head: null,
    body: null,
    hand: null,
  });
  const [accessoryPosition, setAccessoryPosition] = useState(null);

  //to be deleted once im done testing positions
  const getAccessoryStyle = (item) => {
    if (item.name === "Sunglasses") {
      return { top: 65, left: 43, width: 120, height: 60 };
    }
    if (item.name === "Airsm") {
      return { top: 90, left: -23, width: 250, height: 125 };
    }
    if (item.name === "MajongTile") {
      return { top: 170, left: -25, width: 180, height: 90 };
    }
    if (item.name === "Airpods") {
      return { top: 85, left: 55, width: 50, height: 25 };
    }
  };

  const accessories = useAccessoryInventory();
  /* accessories should look sth like this
  id: .....
  name: "Sunglasses"
  image_url: "https://..."
  slot: "head"  
}*/

  /*useEffect(() => {
    const loadAccessories = async () => {
      const data = await fetchAccessory();
      console.log("Loaded accessories:", data);
      setAccessories(data);
    };

    loadAccessories();
  }, []);*/

  return (
    <View className="flex-1 m-0 p-0 bg-black">
      <ImageBackground
        source={backgroundImage}
        resizeMode="cover" //contain can help keep original size
        className="flex-1 justify-start items-center"
      >
        {/* Avatar view*/}
        <View className="w-56 h-96 mt-28 relative items-center justify-center">
          <Image source={avatarImage} className="w-full h-full absolute" />
          {/* for each equppied item we render image onto avatar*/}
          {Object.values(equipped).map((item, index) =>
            item ? (
              <Image
                key={index}
                source={{ uri: item.image_url }}
                className="w-full h-full absolute"
                resizeMode="contain"
                style={{
                  position: "absolute",
                  top: item.position?.top,
                  left: item.position?.left,
                  width: item.position?.width,
                  height: item.position?.height,
                }}
              />
            ) : null
          )}
        </View>
      </ImageBackground>

      <View className="h-16 w-full">
        <Image source={inventoryImage} className="w-full h-full mt-2" />
      </View>

      <ImageBackground
        source={inventoryBackground}
        resizeMode="cover"
        className="flex-1 justify-start items-center"
      >
        {/* accessory array contains all supabase columns so we map to render a slot(press to equip press agin to unequip) and set to equip*/}
        <View className="flex-row flex-wrap justify-center gap-4">
          {accessories.map((item, index) => (
            <SimpleInventorySlot
              key={index}
              selected={equipped[item.slot]?.id === item.id}
              onPress={() => {
                const slot = item.slot; //store position(head,hand) etc)

                setEquipped((prev) => ({
                  ...prev,
                  [slot]: prev[slot]?.id === item.id ? null : item, //if same item alr equip set to null so basically remove else equip
                }));
              }}
            >
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
