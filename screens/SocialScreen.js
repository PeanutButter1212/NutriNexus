import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase'; // make sure your Supabase client is set up correctly
import { LinearGradient } from "expo-linear-gradient";
import pointLogo from '../assets/Points.png'
import Ionicons from '@expo/vector-icons/Ionicons';
import AccessoryPopUp from '../components/AccessoryPopup';

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
    className="justify-center items-center flex-1"
    > 
    <Text
    className="text-xl font-bold"
    > 
      Coming to you in a month
    </Text>
    </View>
  );
}