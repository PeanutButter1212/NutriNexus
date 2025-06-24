import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase'; // make sure your Supabase client is set up correctly
import { LinearGradient } from "expo-linear-gradient";
import pointLogo from '../assets/Points.png'

export default function SocialScreen() {
  const [publicURL, setPublicURL] = useState(null);

  useEffect(() => {
    const fetchPublicURL = async () => {
      const { data, error } = supabase
        .storage
        .from('item-images') // bucket name
        .getPublicUrl('durian2.png'); // file path relative to bucket root

      if (data?.publicUrl) {
        console.log('✅ URL:', data.publicUrl);
        setPublicURL(data.publicUrl);
      } else {
        console.error('❌ Error getting public URL:', error);
      }
    };

    fetchPublicURL();
  }, []);

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
       
        <Image source={require("../assets/Logo.png")} className="w-20 h-20" />
         <Text> NutriNexus Login </Text>

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
                    1000
                  </Text>

            </View>


        </View>
    
        </View>   
        
        <View
        className="flex-row w-64 justify-between mt-4"
        > 

        <TouchableOpacity
        className="bg-red-500 px-12 py-3 rounded-l"
        > 
          <Text
          className="text-center"
          > 
          No
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
        className="bg-green-500 px-12 py-3 rounded-l"
        > 
          <Text
          className="text-center"
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