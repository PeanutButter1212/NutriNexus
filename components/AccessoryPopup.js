import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import pointLogo from '../assets/Points.png'
import { Ionicons } from '@expo/vector-icons';
import stripePattern from '../assets/backgrounds/AvatarPopup.png'
import woodBackground from '../assets/backgrounds/shopBackground.png'
export default function AccessoryPopUp({ success, messageHeading, messageDescription, onContinue }) {
    return (
        <View
        className="flex-1 items-center justify-center"
        >  

        <LinearGradient
                colors={['#D9AE7B', '#C18D5F', '#A46F44']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                    borderRadius: 20,
                }}
        >
        <View style={{ position: 'relative', borderRadius: 20, overflow: 'hidden' }}>
        <ImageBackground
            source={stripePattern}
            resizeMode="stretch"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
              }}
            imageStyle={{ opacity: 0.1 }}
        />
          
        
       
    
          <View
          className="items-center justify-center border-[#8C4F24] border-8 rounded-[22px] flex-column p-4"
          >
          <View
          className="border-[#FFECC6] border-[3px] p-4 rounded-xl items-center min-h-72 justify-center"
          >
          <View
          className="border-[#FFFFFF]/80 border-2 rounded-full"
          > 
        {success ?
        (<LinearGradient
            colors={['#76F593', '#35D74F', '#1E9E3A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 9999,
              justifyContent: "center",
              alignItems: "center",
    
            }}
          >
          <Ionicons name="checkmark" size={32} color="black" />
        </LinearGradient>) : (<LinearGradient
              colors={['#FF6B6B', '#FF4757', '#FF3742']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 9999,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="close" size={36} color="white" />
            </LinearGradient>)

          }
    
          </View>
          
          
    
           <LinearGradient
            colors={['#FFDF80', '#FFB347', '#DAA520']}
            style={{
              marginTop: 12,
              padding: 15, 
              justifyContent: 'center',  // Centers vertically
              alignItems: 'center',   
              borderRadius: 12,
              maxWidth: 250
            }}
          >
            <Text
            className="text-orange-800 font-bold text-2xl text-center"
            > 
              {messageHeading}
            </Text>
    
            <Text
            className="text-orange-900 text-center"
            >
              {messageDescription}
            </Text>
            </LinearGradient>
    
            <TouchableOpacity 
            className="rounded-xl overflow-hidden shadow-lg mt-[14px] border-[#5B3C1D] border-2"
            onPress={onContinue}
            >
        
            <LinearGradient
              colors={['#34C94A', '#1D962F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 35,
        
              }}
    
            >
              <Text className="text-white font-bold text-lg">Continue</Text>
              </LinearGradient>
          
          </TouchableOpacity>
          </View>
            
            
    
          </View>
          
    
          </View>
    
         
        
          </LinearGradient> 

       
        
        </View>
    );
}