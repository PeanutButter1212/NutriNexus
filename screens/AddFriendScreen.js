// AddFriendScreen.js
import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useEffect, useState } from "react";
export default function AddFriendScreen({ navigation }) {

    const mockDatabase = [
        { username: "chuakaijies" },
        { username: "im_not_light" },
        { username: "chickenrice" },
        { username: "tofu_kween" },
        { username: "secrettiger" },
        ];

    const [searchTerm, setSearchTerm] = useState('');
    const [friendList, setFriendList] = useState(["chuakaijies", "chickenrice"]);

    const [pendingRequests, setPendingRequests] = useState(["tofu_kween"]);

    const filteredResults = mockDatabase.filter(user =>
            user.username.toLowerCase().startsWith(searchTerm.toLowerCase())
          );
          

  return (
    <View> 
    <View
    className="mt-12 items-center"
    > 
      <Text
      className="text-3xl font-bold font-nunito-bold"
      > 
        Add Friends
      </Text>
    </View>
    <View className="w-3/4 flex-row items-center border border-gray-300 rounded-xl mt-6 px-4 py-3 self-center">


    <Feather name="search" size={20} color="gray" className="mr-2" />
    <TextInput 
    placeholder="Search username..."
    className="flex-1 text-base"
    autoCapitalize={false}
    onChangeText={(text) => setSearchTerm(text)}
    >
     
    </TextInput> 
    
    </View>

    <ScrollView
    className="w-full h-[420px] mt-4" 
    contentContainerStyle={{ paddingVertical: 12 }}
    >
        {searchTerm !== "" && filteredResults.map((user, index) => (
             <View
             key={index}
              className="justify-between flex-row bg-white py-4 rounded-xl shadow-md flex-1 self-center mb-3 w-[320px] px-4"
             > 
             <View
             className="flex-row"
             >
               <View
               className="rounded-full bg-blue-500 p-4 ml-5"
               > 
       
               </View>
               <View
               className="items-center justify-center ml-3"
               > 
               <Text
               className="font-nunito-regular"
               > 
                 {user.username}
               </Text> 
               </View>
             </View> 
       
             <TouchableOpacity
             className="mr-8 justify-center"
             onPress={() => {
                if (friendList.includes(user.username)) {
                    Alert.alert('Remove Friend?',
                        `Remove ${user.username} as a friend?`,
                        [{ text: 'Cancel', style: 'cancel' },
                        { text: 'Remove' , style: 'destructive',
                            onPress: () => {
                                setFriendList(friendList.filter(name => name !== user.username))
                            }
                        }]
                    )
                }
                else if (pendingRequests.includes(user.username)) {
                    setPendingRequests(pendingRequests.filter(name => name !== user.username))
                } else {
                    setPendingRequests([...pendingRequests, user.username])
                }
             }}
             > 
             <View
              className={`flex-row  px-2 py-2 rounded-xl items-center justify-center ${
                friendList.includes(user.username)
                ? 'bg-gray-200'
                : pendingRequests.includes(user.username)
                ? 'bg-indigo-300'
                : 'bg-blue-500'
              }`}
             >
                <Feather
                     name={
                        friendList.includes(user.username)
                          ? 'check'
                          : pendingRequests.includes(user.username)
                          ? 'clock'
                          : 'plus'
                      }
                    size={16}
                    color={friendList.includes(user.username) ? 'black' : 'white'}
                    />
                <Text
                    className = {friendList.includes(user.username) ? "text-black" : "text-white"}
                > 
                    {friendList.includes(user.username)
                        ? 'Friends'
                        : pendingRequests.includes(user.username)
                        ? 'Request Sent'
                        : 'Add Friend'}
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
