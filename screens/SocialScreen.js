import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  TextInput,
} from "react-native";
import { supabase } from "../lib/supabase"; // make sure your Supabase client is set up correctly
import { LinearGradient } from "expo-linear-gradient";
import pointLogo from "../assets/Points.png";
import Ionicons from "@expo/vector-icons/Ionicons";
import AccessoryPopUp from "../components/AccessoryPopup";
import stoneImage from "../assets/stone_texture.png";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import { filter } from "d3";
import {
  fetchApprovedRequests,
  fetchUsernameByIds,
} from "../services/socialService";
import { useAuth } from "../contexts/AuthContext";

export default function SocialScreen({ navigation }) {
  const { user } = useAuth();
  const currentId = user?.id;

  const [friendList, setFriendList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadFriends = async () => {
      console.log("hi");
      const rawFriends = await fetchApprovedRequests(currentId);
      console.log(rawFriends);

      const friendIds = rawFriends.map(
        (f) => (f.user_id === currentId ? f.friend_id : f.user_id) //obtain either ids based on who the user/friend is
      );

      const usernames = await fetchUsernameByIds(friendIds);
      setFriendList(usernames);
    };
    loadFriends();
  }, [currentId]);

  const filteredResults = friendList.filter((user) =>
    user.username.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  return (
    <View className="items-center">
      <View className="mt-24">
        <Text className="text-3xl font-bold font-nunito-bold">
          Friends List
        </Text>
      </View>

      <View className="w-3/4 flex-row items-center border border-gray-300 rounded-xl mt-6 px-4 py-3 self-center">
        <Feather name="search" size={20} color="gray" className="mr-2" />
        <TextInput
          placeholder="Search username..."
          className="flex-1 text-base"
          autoCapitalize={false}
          onChangeText={(text) => setSearchTerm(text)}
        ></TextInput>
      </View>

      <ScrollView
        className="w-full h-[350px] mt-4"
        showsVerticalScrollIndicator={true}
        indicatorStyle="black"
        contentContainerStyle={{ paddingVertical: 12 }}
      >
        {filteredResults.map((friend, index) => (
          <View
            key={index}
            className="justify-between flex-row bg-white py-4 rounded-xl shadow-md mb-3 w-3/4 self-center"
          >
            <View className="flex-row">
              <View className="rounded-full bg-blue-500 p-4 ml-5"></View>
              <View className="items-center justify-center ml-3">
                <Text className="font-nunito-regular">{friend.username}</Text>
              </View>
            </View>

            <TouchableOpacity
              className="mr-8 justify-center"
              onPress={() =>
                navigation.navigate("Friend Profile", {
                  friendId: friend.user_id,
                })
              }
            >
              <View className="bg-blue-500 px-4 rounded-xl">
                <Entypo name="controller-play" size={24} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        className="items-center justify-center bg-green-600 w-3/4 rounded-xl mt-6 py-3"
        onPress={() => {
          navigation.navigate("Add Friends");
        }}
      >
        <Text className="text-white text-base font-medium">Add Friends</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="items-center justify-center bg-blue-500 w-3/4 rounded-xl mt-6 py-3"
        onPress={() => {
          navigation.navigate("Friend Requests");
        }}
      >
        <Text className="text-white text-base font-medium">
          View Friend Requests
        </Text>
      </TouchableOpacity>
    </View>
  );
}
