import React from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const BottomTabNav = ({ activeTab, onTabChange }) => {
    return (
        <View className="bg-white border-1 border-gray-200">
            <View className="flex-row">
            <TouchableOpacity 
                className={`flex-1 py-4 items-center ${activeTab === 'statistics' ? 'bg-blue-50' : ''}`}
                onPress={() => onTabChange('statistics')}
                >

                <Ionicons 
                    name="bar-chart" 
                    size={24} 
                    color={activeTab === 'statistics' ? '#3B82F6' : '#6B7280'} 
                />
                <Text className={`text-sm mt-1 ${activeTab === 'statistics' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                    Statistics
                </Text>


            </TouchableOpacity>

        <TouchableOpacity 
          className={`flex-1 py-4 items-center ${activeTab === 'foodlog' ? 'bg-orange-50' : ''}`}
          onPress={() => onTabChange('foodlog')}
        >
            <FontAwesome5 
                name="utensils" 
                size={20} 
                color={activeTab === 'foodlog' ? '#F97316' : '#6B7280'} 
            />
            <Text className={`text-sm mt-1 ${activeTab === 'foodlog' ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
                Food Log
            </Text>
        
        </TouchableOpacity>
        </View>
    </View>

    ) 
} 

export default BottomTabNav;