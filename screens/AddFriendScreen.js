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
import { sendFriendRequest, getFriendStatus } from "../services/socialService";

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

  useEffect(() => {
    const loadStatuses = async () => {
      if (searchResults.length === 0 || !currentId) return;

      const statuses = {};

      for (const target of searchResults) {
        const result = await getFriendStatus(currentId, target.user_id);
        console.log(`${target.username} (${target.user_id}) status:`, result);
        statuses[target.user_id] = result;
      }

      setUserStatuses(statuses);
    };

    loadStatuses();
  }, [searchResults, currentId]);

  return (
    <View>
      <View className="mt-12 items-center">
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
          searchResults.map((targetuser, index) => (
            <View
              key={index}
              className="justify-between flex-row bg-white py-4 rounded-xl shadow-md flex-1 self-center mb-3 w-[320px] px-4"
            >
              <View className="flex-row">
                <View className="rounded-full bg-blue-500 p-4 ml-5"></View>
                <View className="items-center justify-center ml-3">
                  <Text className="font-nunito-regular">
                    {targetuser.username}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                className="mr-8 justify-center"
                onPress={async () => {
                  /* if alr friend can remove*/
                  if (userStatuses[targetuser.user_id] === "accepted") {
                    Alert.alert(
                      "Remove Friend?",
                      `Remove ${targetuser.username} as a friend?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Remove",
                          style: "destructive",
                          onPress: () => {
                            setUserStatuses((prev) => ({
                              ...prev,
                              [targetuser.user_id]: null,
                            }));
                          },
                        },
                      ]
                    );
                    /* if pending can cancel request */
                  } else if (userStatuses[targetuser.user_id] === "pending") {
                    setUserStatuses((prev) => ({
                      ...prev,
                      [targetuser.user_id]: null,
                    }));
                  } else {
                    /* if sent request set to pending  */
                    const success = await sendFriendRequest(
                      currentId,
                      targetuser.user_id
                    );
                    if (success) {
                      setUserStatuses((prev) => ({
                        ...prev,
                        [targetuser.user_id]: "pending",
                      }));
                    } else {
                      Alert.alert("Error fail to send request");
                    }
                  }
                }}
              >
                <View
                  className={`flex-row  px-2 py-2 rounded-xl items-center justify-center ${
                    userStatuses[targetuser.user_id] === "accepted"
                      ? "bg-gray-200"
                      : userStatuses[targetuser.user_id] === "pending"
                      ? "bg-indigo-300"
                      : "bg-blue-500"
                  }`}
                >
                  <Feather
                    name={
                      userStatuses[targetuser.user_id] === "accepted"
                        ? "check"
                        : userStatuses[targetuser.user_id] === "pending"
                        ? "clock"
                        : "plus"
                    }
                    size={16}
                    color={
                      userStatuses[targetuser.user_id] === "accepted"
                        ? "black"
                        : "white"
                    }
                  />
                  <Text
                    className={
                      userStatuses[targetuser.user_id] === "accepted"
                        ? "text-black"
                        : "text-white"
                    }
                  >
                    {userStatuses[targetuser.user_id] === "accepted"
                      ? "Friends"
                      : userStatuses[targetuser.user_id] === "pending"
                      ? "Request Sent"
                      : "Add Friend"}
                  </Text>
                </View>
              </TouchableOpacity>
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
