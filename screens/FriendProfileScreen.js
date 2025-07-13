import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";

export default function FriendProfileScreen({ navigation }) {
  return (
    <ScrollView 
    className="flex-1"
    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
    > 
    <View className="items-center">
      <View
      className="bg-white rounded-xl flex-row  w-[320px] py-8 mt-4 shadow-md rounded-xl \"
      >
    <View
    className="justify-start flex-row items-center w-full ml-4 "
    > 
    <View
     className="rounded-full bg-green-300 p-12"
     >

    </View>

    <View
    className="flex-col ml-8"
    > 
    <View> 
    <Text
    className="font-nunito-extrabold text-2xl ml-1"
    > 
        Joh
    </Text>
    </View>

    <View
    className="flex-row"
    > 
    <View> 
    
        <Text> 12 </Text>
        <Text> Friends </Text>
    </View>

    <View className="ml-4"> 
    
        <Text> 20 </Text>
        <Text> Places </Text>
    </View>

    <View className="ml-4"> 
    
        <Text> 3200 </Text>
        <Text> Total</Text>
        <Text> Points </Text>
    </View>


    </View>

    </View>

    


    

    </View>
  
    
      </View>
    
    <View
    className="w-full bg-gray-500 h-px mt-8 mb-6"
    />
   
   <View
    className="flex-row justify-start self-start w-full"
    > 
    <Text 
    className="font-nunito-extrabold text-2xl ml-6"
    >
        Avatar 
    </Text> 

    <Text
    className=" ml-3 font-nunito-regular text-l mt-[4px]"
    >
       (Last updated 20m ago)
    </Text>
    </View>




    <View
    className="border-2 border-grey-300 h-[320px] w-full"
    > 
    <Text> Avatar here </Text>

    </View>

    <View
    className="flex-row justify-start self-start w-full"
    > 
    <Text 
    className="font-nunito-extrabold text-2xl mt-6 ml-6"
    >
        Garden 
    </Text> 

    <Text
    className=" ml-3 font-nunito-regular mt-[26px] text-l"
    >
       (Last updated 10m ago)
    </Text>
    </View>

    <View
    className="border-2 border-grey-300 h-[320px] w-full"
    > 
    <Text> Garden here </Text>

    </View>





    </View>
    </ScrollView>
  );
}
