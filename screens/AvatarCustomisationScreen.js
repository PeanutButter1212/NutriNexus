import {
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from "react-native";
import backgroundImage from "../assets/CustomisationBackground.png";
import maleAvatarImage from "../assets/MaleCharacter.png";
import femaleAvatarImage from "../assets/FemaleEdited.png";
import inventoryImage from "../assets/InventorySign.png";
import inventoryBackground from "../assets/Background.png";
import useAccessoryInventory from "../hooks/useAccessoryInventory";
import { useEffect, useState } from "react";
import { saveEquippedItems } from "../services/avatarService";
import { useAuth } from "../contexts/AuthContext";
import useEquippedItems from "../hooks/useEquippedItems";
import { useNavigation } from "@react-navigation/native";
import SimpleInventorySlot from "../components/SimpleInventorySlot";
import { Ionicons } from "@expo/vector-icons";
import AccessoryPopUp from "../components/AccessoryPopup";
import useProfileData from "../hooks/useProfileData";

export default function AvatarCustomisationScreen() {
  //const [accessories, setAccessories] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const { session } = useAuth();
  const userId = session?.user?.id;
  const navigation = useNavigation();
  const [showPopup, setShowPopup] = useState(false);
  const [currentTab, setCurrentTab] = useState("Head");
  const { userDemographics } = useProfileData();

  const avatarImage =
    userDemographics.gender === "Female" ? femaleAvatarImage : maleAvatarImage;

  const TABS = ["Head", "Body", "Hand"];

  //3 different kinda accessories
  const [equipped, setEquipped] = useState({
    head: null,
    body: null,
    hand: null,
  });
  const [accessoryPosition, setAccessoryPosition] = useState(null);

  const accessories = useAccessoryInventory();

  /* accessories should look sth like this
  item_id: .....
  user_id
  item_name: "Sunglasses"
  image_url: "https://..."
  slot: "head"  
  position:
}*/

  const equippedFromDB = useEquippedItems();

  const handleSave = async () => {
    const success = await saveEquippedItems(userId, equipped);
    if (success) {
      setShowPopup(true);
    }
  };
  useEffect(() => {
    setEquipped(equippedFromDB);
  }, [equippedFromDB]);

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
                  //i converted position to percenatges and store in backend so it will not be misaligned for different device sizes
                  position: "absolute",
                  top: item.position?.topPct * 384,
                  left: item.position?.leftPct * 224,
                  width: item.position?.widthPct * 224,
                  height: item.position?.heightPct * 384,
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
        <View className="flex-row px-6 rounded-2xl mt-6">
          <View className="bg-[#C4A484] flex-row flex-1 rounded-2xl">
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                className="flex-1 py-3 rounded-2xl"
                onPress={() => setCurrentTab(tab)}
                style={{
                  backgroundColor:
                    currentTab == tab ? "#419e34" : "transparent",
                }}
              >
                <Text
                  className="text-center text-white text-xl"
                  style={{
                    fontFamily:
                      currentTab == tab ? "Nunito-ExtraBold" : "Nunito-Bold",
                    color: currentTab == tab ? "black" : "#5C4033",
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* accessory array contains all supabase columns so we map to render a slot(press to equip press agin to unequip) and set to equip*/}
        <View className="flex-row flex-wrap justify-center gap-4 mt-8">
          {accessories
            .filter(
              (item) => item.slot.toLowerCase() === currentTab.toLowerCase()
            )
            .map((item, index) => (
              <SimpleInventorySlot
                key={index}
                selected={equipped[item.slot]?.item_id === item.item_id}
                onPress={() => {
                  console.log("Item pressed:", item);
                  const slot = item.slot;

                  if (!slot) {
                    console.error("Slot is missing for item:", item);
                    return; // prevent further execution if slot is invalid
                  }

                  setEquipped((prev) => ({
                    ...prev,
                    [slot]: prev[slot]?.item_id === item.item_id ? null : item,
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
        {/* Save Button */}
        <TouchableOpacity
          className="bg-white rounded-xl px-8 shadow-md mt-8 py-4"
          onPress={handleSave}
        >
          <Text className="text-black text-base font-medium">Save</Text>
        </TouchableOpacity>
        {/* Back Button */}
        <TouchableOpacity
          className="bg-white rounded-xl p-4 shadow-md absolute bottom-8 left-4 mb-8"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </ImageBackground>

      <Modal
        visible={showPopup}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowPopup(false)}
      >
        <View className="flex-1 bg-black/50">
          <AccessoryPopUp
            success={true}
            messageHeading={"Avatar Saved!"}
            messageDescription={"Your chtaracter has been updated"}
            onContinue={() => setShowPopup(false)}
          />
        </View>
      </Modal>
    </View>
  );
}
