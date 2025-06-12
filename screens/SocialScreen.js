import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { supabase } from '../lib/supabase'; // make sure your Supabase client is set up correctly

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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {publicURL ? (
        <Image
          source={{ uri: publicURL }}
          style={{ width: 120, height: 120}}
          resizeMode="contain"
        />
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
}
