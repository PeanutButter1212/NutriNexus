import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import maleAvatarImage from "../assets/MaleCharacter.png";
import femaleAvatarImage from "../assets/FemaleEdited.png";
import { useEffect, useCallback, useState, useRef } from "react";
import { useRoute, useFocusEffect } from "@react-navigation/native";

import useProfileData from "../hooks/useProfileData";
import { fetchEquippedItems } from "../services/avatarService";
import { fetchUserInfo } from "../services/profileService";
import gardenImage from "../assets/garden/garden.png";
import { retrieveGardenLayout } from "../services/gardenService";
import SkiaImageItem from "../components/skiaImageItem";
import { Canvas } from "@shopify/react-native-skia";
import { fetchPlants } from "../services/gardenService";
import { fetchPoints } from "../services/profileService";
import { fetchUsername } from "../services/profileService";
import {
  fetchNumberVisited,
  fetchNumberofFriends,
  removeFriend,
} from "../services/socialService";
import { useAuth } from "../contexts/AuthContext";
import backgroundImage from "../assets/CustomisationBackground.png";

export default function FriendProfileScreen({ navigation }) {
  const [equipped, setEquipped] = useState({
    head: null,
    body: null,
    hand: null,
  });

  console.log("equipped:", equipped);

  const { user } = useAuth();
  const currentId = user?.id;

  const route = useRoute();
  const { friendId } = route.params;
  const [gender, setGender] = useState(null);
  const [friendGarden, setFriendGarden] = useState([]); //for layout
  const [plantItems, setPlantItems] = useState({}); //for url of plant images
  const [points, setPoints] = useState();
  const [username, setUsername] = useState();
  const [numfriends, setNumFriends] = useState();
  const [numloc, setNumLoc] = useState();

  const gardenAreaRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const fresh = await fetchEquippedItems(friendId);
        //console.log(fresh);
        setEquipped(fresh);

        const info = await fetchUserInfo(friendId);
        setGender(info?.gender);

        const userPoints = await fetchPoints(friendId);
        setPoints(userPoints);

        const username = await fetchUsername(friendId);
        setUsername(username);

        const numberFriends = await fetchNumberofFriends(friendId);
        console.log(numberFriends);
        setNumFriends(numberFriends);

        const numberLocations = await fetchNumberVisited(friendId);
        console.log(numberLocations);
        setNumLoc(numberLocations);

        const layout = await retrieveGardenLayout(friendId);
        //console.log("Garden layout raw:", layout);

        const plants = await fetchPlants();

        const plantLookup = {};
        //lookup each palant for respective pic
        plants.forEach((plant) => {
          plantLookup[plant.id] = plant;
        });
        setPlantItems(plantLookup);
        setFriendGarden(layout || []);
      };

      loadData();
    }, [friendId])
  );

  const avatarImage = gender === "Female" ? femaleAvatarImage : maleAvatarImage;

  //for garden

  const SCREEN_WIDTH = Dimensions.get("window").width;
  const SCREEN_HEIGHT = Dimensions.get("window").height;

  const IMAGE_WIDTH = 56;
  const IMAGE_HEIGHT = 64;

  const DIAMOND_SIZE = 36;
  const SPACING = 41;
  const xStartOfGarden = SCREEN_WIDTH / 2;
  const yStartOfGarden = 0.26 * SCREEN_HEIGHT;

  const getIsometricPosition = (col, row) => {
    const alignmentX = (col - row) * (SPACING * 0.866);
    const alignmentY = (col + row) * (SPACING * 0.5);

    return {
      x: xStartOfGarden + alignmentX,
      y: yStartOfGarden + alignmentY,
    };
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
    >
      <View className="items-center">
        <View className="bg-white rounded-xl flex-row  w-[320px] py-8 mt-4 shadow-md rounded-xl \">
          <View className="justify-start flex-row items-center w-full ml-4 ">
            <View className="rounded-full bg-green-300 p-12"></View>

            <View className="flex-col ml-8">
              <View>
                <Text className="font-nunito-extrabold text-2xl ml-1">
                  {username}
                </Text>
              </View>

              <View className="flex-row">
                <View>
                  <Text> {numfriends} </Text>
                  <Text> Friends </Text>
                </View>

                <View className="ml-4">
                  <Text> {numloc} </Text>
                  <Text> Places </Text>
                </View>

                <View className="ml-4">
                  <Text> {points} </Text>
                  <Text> Total</Text>
                  <Text> Points </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="w-full bg-gray-500 h-px mt-8 mb-6" />

        <View className="flex-row justify-start self-start w-full">
          <Text className="font-nunito-extrabold text-2xl ml-6">Avatar</Text>

          {/*<Text className=" ml-3 font-nunito-regular text-l mt-[4px]">
            (Last updated 20m ago)
          </Text> */}
        </View>

        <View className="border-2 border-grey-300 w-full">
          {/* Avatar view*/}
          <ImageBackground
            source={backgroundImage}
            resizeMode="cover"
            className="w-full h-[384px] items-center justify-center"
          >
            <View className="w-56 h-96 relative items-center justify-center">
              <Image source={avatarImage} className="w-full h-full absolute" />
              {/* for each equppied item we render image onto avatar*/}

              {Object.values(equipped).map((item, index) => {
                if (!item || typeof item !== "object" || !item.image_url)
                  return null;
                return (
                  //check if both item and url exists cause there was a error when item is null
                  <Image
                    key={index}
                    source={{ uri: item.image_url }}
                    className="w-full h-full absolute"
                    resizeMode="contain"
                    style={{
                      //i converted position to percenatges and store in backend so it will not be misaligned for different device sizes
                      position: "absolute",
                      top: (item.position?.topPct ?? 0) * 384,
                      left: (item.position?.leftPct ?? 0) * 224,
                      width: (item.position?.widthPct ?? 0) * 224,
                      height: (item.position?.heightPct ?? 0) * 384,
                    }}
                  />
                );
              })}
            </View>
          </ImageBackground>
        </View>

        <View className="flex-row justify-start self-start w-full">
          <Text className="font-nunito-extrabold text-2xl mt-6 ml-6">
            Garden
          </Text>

          {/* <Text className=" ml-3 font-nunito-regular mt-[26px] text-l">
            (Last updated 10m ago)
          </Text> */}
        </View>

        <View
          className="w-full mt-4 mr-8"
          style={{ height: 0.65 * SCREEN_HEIGHT }}
        >
          <View
            ref={gardenAreaRef}
            style={{
              flex: 1,
              position: "relative",
              height: "100%",
              width: SCREEN_WIDTH,
            }}
          >
            <Image
              source={gardenImage}
              style={{
                width: "100%",
                height: "100%",
              }}
              resizeMode="stretch"
            />
            {friendGarden.map((plant, index) => {
              const plantItem = plantItems[plant.decor_id];

              if (!plantItem?.image_url) {
                console.log(`Plant ${index} has no image_url, skipping`);
                return null;
              }

              const { x, y } = getIsometricPosition(plant.col, plant.row);
              return (
                <Image
                  key={index}
                  source={{ uri: plantItem.image_url }}
                  style={{
                    position: "absolute",
                    left: x - 28,
                    top: y - 48,
                    width: 56,
                    height: 64,
                  }}
                  resizeMode="contain"
                />
              );
            })}
          </View>
        </View>
      </View>
      <TouchableOpacity
        className="ml-14 items-center justify-center bg-red-600 w-3/4 rounded-xl mt-6 py-3 mt-8 mb-24"
        onPress={async () => {
          await removeFriend(currentId, friendId);
          navigation.navigate("MainTabs", { screen: "Social" });
        }}
      >
        <Text className="text-white text-base font-medium">Remove Friend</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
