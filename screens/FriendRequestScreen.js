import React from 'react';
import { View, Text, ScrollView, TouchableOpacity} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';

export default function FriendRequestScreen({ navigation }) {

  mockDataBase = [
    {
        "username" : "chuakaijies",
    }, 
    {
        "username" : "im_not_light"
    },
    {
        "username" : "chickenrice"
    }

    ]


  return (
    <View 
    className=""
    > 
    <View
    className="mt-12 items-center justify-center"
    > 
      <Text
      className="text-3xl font-bold font-nunito-bold"
      > 
        Friend Requests
      </Text>
    </View>

    <ScrollView
     className="w-full h-[420px] mt-4"
     showsVerticalScrollIndicator={true}
     indicatorStyle='black'
     contentContainerStyle={{ paddingVertical: 12 }}
    > 
    {mockDataBase.map((friend, index) => (
       <View
       key={index}
       className="justify-between flex-row bg-white py-4 rounded-xl shadow-md mb-3 w-3/4 self-center"
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
           {friend.username}
         </Text> 
         </View>
       </View> 
       
       <View
       className="flex-row"
       > 
 
       <TouchableOpacity
       className="mr-4 justify-center"
       >
         <View
         className="bg-red-500 px-4 rounded-xl"
         > 
           <Feather name="x" size={24} color="white" />

         </View>
       </TouchableOpacity>


       <TouchableOpacity
       className="mr-4 justify-center"
       >
         <View
         className="bg-green-600 px-4 rounded-xl"
         > 
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
