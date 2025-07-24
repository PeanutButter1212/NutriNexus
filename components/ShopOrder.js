import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import pointLogo from '../assets/Points.png'

export default function ShopOrder({item, onConfirm, onCancel}) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    console.log("set shop order loading to true")
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };


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
            <View className="w-64 bg-yellow-300 flex-column rounded-xl items-center justify-center p-3"> 
           
            <Image source={{ uri: item?.image_url }} className="w-20 h-20" />
             <Text> {item?.name} </Text>
    
            </View>
    
            <View
            className="bg-white w-64 justify-center items-center p-3 rounded-xl mt-4"
            > 
    
            <Text> 
              Confirm Purchase? 
            </Text>
    
            <View className="bg-gray-800 border-2 border-yellow-500 rounded-xl px-4 py-2">
                          
                <View className="justify-center items-center flex-row">
                      <Image
                      source={pointLogo}
                      className="h-8 w-8"
                      />
                      <Text className="font-nunito-extrabold text-orange-400"> 
                        {item?.cost}
                      </Text>
    
                </View>
    
    
            </View>
        
            </View>   
            
            <View
            className="flex-row w-64 justify-between mt-4"
            > 
    
            <TouchableOpacity
            className="bg-red-500 px-12 py-3 rounded-l"
            onPress={onCancel}
            disabled={loading}
            > 
              <Text
              className="text-center text-bold text-white"
              > 
              No
              </Text>
            </TouchableOpacity>
    
            <TouchableOpacity
            className="bg-green-500 px-12 py-3 rounded-l"
            onPress={handleConfirm}
            disabled={loading}
            > 
              <Text
              className="text-center text-bold text-white"
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