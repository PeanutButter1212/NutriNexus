import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function WelcomeScreen({ navigation }) {

    const { session, setProfile } = useAuth() 

    const handleNext = async () => {
        try {
          if (session?.user?.id) {
            await supabase
              .from('profile_page')
              .update({ is_first_time: false })
              .eq('id', session.user.id);
        
            setProfile(prev => ({ ...prev, is_first_time: false }));
          }
        } catch (error) {
          console.error('Error updating first time flag:', error);
          setProfile(prev => ({ ...prev, is_first_time: false }));
        }
      };
    
  return (
    <LinearGradient
      colors={["#2E8B57", "#90EE90", "#006400"]}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
    >
      <View style={{ alignItems: 'center' }}>
        <Text style={{ 
          fontSize: 32, 
          fontWeight: 'bold', 
          color: 'white', 
          textAlign: 'center', 
          marginBottom: 40 
        }}>
          Welcome My G!!!
        </Text>
        
        <TouchableOpacity 
          onPress={handleNext}
          style={{
            backgroundColor: '#FF7A00',
            paddingHorizontal: 40,
            paddingVertical: 15,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
          }}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}