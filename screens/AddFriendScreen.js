// AddFriendScreen.js
import React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useEffect, useState } from "react";
import { searchUsers } from "../services/socialService";
import { useAuth } from "../contexts/AuthContext";
import {
  sendFriendRequest,
  getFriendStatus,
  deleteFriendRequest,
} from "../services/socialService";
import { Image as ExpoImage } from "expo-image";

export default function AddFriendScreen({ navigation }) {
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const [userStatuses, setUserStatuses] = useState({});

  const currentId = user?.id;

  //ensure changing to results when search
  useEffect(() => {
    const runSearch = async () => {
      if (searchTerm === "") {
        setSearchResults([]);
        return;
      }

      const results = await searchUsers(searchTerm);
      setSearchResults(results);
    };

    runSearch();
  }, [searchTerm]); //run everytime searchTerm changes (when we type)

  //this is to update the status everytime search
  useEffect(() => {
    const loadStatuses = async () => {
      if (searchResults.length === 0 || !currentId) return;

      const statuses = {}; //hashmap where key is userid and value is status

      for (const target of searchResults) {
        const result = await getFriendStatus(currentId, target.user_id);
        //console.log(`${target.username} (${target.user_id}) status:`, result);
        statuses[target.user_id] = result;
      }

      setUserStatuses(statuses);
    };

    loadStatuses();
  }, [searchResults, currentId]);

  //toggle between 3 modes, alr friends - nth happens, pending - option to cancel, add friends - option to add
  const getButtonConfig = (status) => {
    switch (status) {
      case "accepted":
        return {
          text: "Friends",
          icon: "check",
          bgColor: "bg-green-200",
          textColor: "text-black",
          iconColor: "black",
          width:"",
          disabled: true,
        };
      case "pending":
        return {
          text: "Cancel Request",
          icon: "x",
          bgColor: "bg-red-500 ",
          textColor: "text-white text-sm",
          iconColor: "white",
          disabled: false,
        };
      case "self":
        return {
          text: "You",
          icon: "user",
          bgColor: "bg-gray-300",
          textColor: "text-black",
          iconColor: "black",
          disabled: true,
        };
      default:
        return {
          text: "Add Friend",
          icon: "plus",
          bgColor: "bg-blue-500",
          textColor: "text-white",
          iconColor: "white",
          width:"w-40",
          disabled: false,
        };
    }
  };

  //handle action based on 3 modes
  const handleFriendAction = async (targetUserId) => {
    const currentStatus = userStatuses[targetUserId];

    if (currentStatus == "accepted") {
      return;
    } else if (currentStatus == "self") {
      return;
    } else if (currentStatus == "pending") {
      try {
        await deleteFriendRequest(currentId, targetUserId);
        setUserStatuses((prev) => {
          const newStatuses = { ...prev };
          delete newStatuses[targetUserId];
          return newStatuses;
        });
      } catch (error) {
        Alert.alert("Error", "Failed to cancel friend request");
      }
    } else {
      try {
        const success = await sendFriendRequest(currentId, targetUserId);
        if (success) {
          setUserStatuses((prev) => ({
            ...prev,
            [targetUserId]: "pending",
          }));
        } else {
          Alert.alert("Error failed to add");
        }
      } catch (error) {
        Alert.alert("Error", error);
      }
    }
  };

  return (
    <View>
      <View className="mt-24 items-center">
        <Text className="text-3xl font-bold font-nunito-bold">Add Friends</Text>
      </View>
      <View className="w-3/4 flex-row items-center border border-gray-300 rounded-xl mt-6 px-4 py-3 self-center">
        <Feather name="search" size={20} color="gray" className="mr-2" />
        <TextInput
          placeholder="Search username..."
          className="flex-1 text-base"
          autoCapitalize="none"
          onChangeText={(text) => setSearchTerm(text)}
        ></TextInput>
      </View>

      <ScrollView
        className="w-full h-[420px] mt-4"
        contentContainerStyle={{ paddingVertical: 12 }}
      >
        {searchTerm !== "" &&
          searchResults.map((targetuser, index) => {
            const status = userStatuses[targetuser.user_id];
            const buttonConfig = getButtonConfig(status);

            return (
              <View
                key={index}
                className="justify-between flex-row bg-white py-4 rounded-xl shadow-md flex-1 self-center mb-3 w-[360px]"
              >
                <View className="flex-row">
                  <ExpoImage
                    source={targetuser.profile_pic_url}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 9999,
                      marginLeft: 20,
                    }}
                    contentFit="cover"
                    transition={300}
                    placeholder="blur"
                    cachePolicy="memory-disk"
                  />
                  <View className="items-center justify-center ml-3">
                    <Text className="font-nunito-regular">
                      {targetuser.username}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  className="mr-8 justify-center"
                  disabled={buttonConfig.disabled}
                  onPress={() => handleFriendAction(targetuser.user_id)}
                >
                  <View
                    className={`flex-row w-32 py-2 rounded-xl items-center justify-center ${buttonConfig.bgColor}`}
                  >
                    <Feather
                      name={buttonConfig.icon}
                      size={16}
                      color={buttonConfig.iconColor}
                    />
                    <Text className={`${buttonConfig.textColor} ml-1`}>
                      {buttonConfig.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
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
