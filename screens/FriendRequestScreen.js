import React, { use } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Entypo } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  fetchIncomingFriendRequests,
  fetchUsernameByIds,
  acceptFriendRequest,
  deleteFriendRequest,
} from "../services/socialService";
import { Image as ExpoImage } from "expo-image";

export default function FriendRequestScreen({ navigation }) {
  const { user } = useAuth();
  const currentId = user?.id;

  const [requests, setRequests] = useState([]);

  //fetches list on load
  useEffect(() => {

    const loadRequests = async () => {
      try {
        //console.log("Calling fetchIncomingFriendRequests...");
        const pending = await fetchIncomingFriendRequests(currentId);
        //console.log("Pending raw:", pending);
        const senderIds = pending.map((req) => req.user_id); //extract out just the ids no header
        console.log("Sender IDs:", senderIds);
        const usernames = await fetchUsernameByIds(senderIds);
        console.log("Fetched usernames:", usernames);
        setRequests(usernames);
      } catch (err) {
        console.log(error);
      }
    };

    loadRequests();
  }, [currentId]);

  return (
    <View className="">
      <View className="mt-24 items-center justify-center">
        <Text className="text-3xl font-bold font-nunito-bold">
          Friend Requests
        </Text>
      </View>

      <ScrollView
        className="w-full h-[420px] mt-4"
        showsVerticalScrollIndicator={true}
        indicatorStyle="black"
        contentContainerStyle={{ paddingVertical: 12 }}
      >
        {requests.map((friend, index) => (
          <View
            key={index}
            className="justify-between flex-row bg-white py-4 rounded-xl shadow-md mb-3 px-3 w-[360px] self-center"
          >
            <View className="flex-row">
              <ExpoImage
                source={friend.profile_pic_url}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 9999
                }}
                contentFit="cover"
                transition={300}
                placeholder="blur"
                cachePolicy="memory-disk"
              />
              <View className="items-center justify-center ml-3">
                <Text className="font-nunito-regular">{friend.username}</Text>
              </View>
            </View>

            <View className="flex-row">
              <TouchableOpacity
                className="mr-3 justify-center"
                onPress={async () => {
                  const success = await deleteFriendRequest(
                    friend.user_id,
                    currentId
                  );
                  if (success) {
                    setRequests((prev) =>
                      prev.filter((req) => req.user_id !== friend.user_id)
                    );
                  } else {
                    Alert.alert("Error failed to delete friend :(");
                  }
                }}
              >
                <View className="bg-red-500 px-4 rounded-xl ml-3">
                  <Feather name="x" size={24} color="white" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="mr-4 justify-center"
                testID="acceptFriendRequestButton"
                onPress={async () => {
                  const success = await acceptFriendRequest(
                    friend.user_id,
                    currentId
                  );
                  if (success) {
                    setRequests((prev) =>
                      prev.filter((req) => req.user_id !== friend.user_id)
                    );
                  } else {
                    Alert.alert("Error failed to add friend :(");
                  }
                }}
              >
                <View className="bg-green-600 px-4 rounded-xl">
                  <Feather name="check" size={24} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="self-center items-center justify-center bg-red-600 rounded-xl py-3 px-16"
      >
        <Text className="text-white text-base font-medium font-bold">Back</Text>
      </TouchableOpacity>
    </View>
  );
}
