import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import pointLogo from '../assets/Points.png'
import { Image as ExpoImage } from "expo-image";

export default function DeleteFriend({username, onConfirm, onCancel, profilePic}) {
    return (
        <View
        className="flex-1 items-center justify-center"
        >
          <LinearGradient
          colors={['#F9B856','#F1893E']}
          style={{
            borderRadius: 12
          }}
          >

      
          <View
          className="w-80 min-h-80 items-center justify-center border-yellow-300 border-4 rounded-xl flex-column p-5"
          >
            <Text className="text-3xl font-bold text-green-700 mb-4">Delete Friend?</Text>
            <View className="w-64 bg-yellow-300 flex-column rounded-xl items-center justify-center p-3"> 
            <ExpoImage
              source={profilePic}
              style={{
                width: 48,
                height: 48,
                borderRadius: 9999,
                padding: 48,
              }}
              contentFit="cover"
              transition={300}
              placeholder="blur"
              cachePolicy="memory-disk"
            />


             <Text> {username} </Text>
    
            </View>
    
    
            <View
            className="flex-row w-64 justify-between mt-4"
            > 
    
            <TouchableOpacity
            className="bg-red-500 px-12 py-3 rounded-l"
            onPress={onCancel}
            > 
              <Text
              className="text-center font-bold text-white"
              > 
              No
              </Text>
            </TouchableOpacity>
    
            <TouchableOpacity
            className="bg-green-500 px-12 py-3 rounded-l"
            onPress={onConfirm}
            > 
              <Text
              className="text-center font-bold text-white"
              > 
              Yes
              </Text>
            </TouchableOpacity>
    
    
            </View>
    
          </View>
    
          </LinearGradient>
    
        </View>
    );
}