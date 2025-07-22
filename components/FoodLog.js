import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useAuth } from "../contexts/AuthContext";
import { fetchActivityLog } from "../services/profileService";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const FoodLog = () => {
  const [entries, setEntries] = useState([]);
  const { session, refreshFlag } = useAuth();

  useEffect(() => {
    const loadEntries = async () => {
      const userId = session?.user?.id;
    
      if (!userId) {
        console.log("HELP!");
        return;
      }
      try {
        const userLog = await fetchActivityLog(userId);
    
        const sorted = (userLog || []).sort((a, b) => {
          const dateTimeA = new Date(`${a.date}T${a.time || "00:00"}+08:00`);
          const dateTimeB = new Date(`${b.date}T${b.time || "00:00"}+08:00`);
          return dateTimeB - dateTimeA; 
        });
    
        setEntries(sorted);
      } catch (err) {
        console.error("error from fetchActivityLog: " + err.message);
      }
    };
    loadEntries();
  }, [refreshFlag, session]);
  
  //whenever the refresh flag changes(ie when updated table then it updates log)

  const getFoodEmoji = (foodName) => {
    const food = foodName.toLowerCase();
    
    if (food.includes('blackcarrotcake')) return '🍰';
    if (food.includes('chickenrice')) return '🍗';
    if (food.includes('hokkiennoodle')) return '🍜';
    if (food.includes('icekachang')) return '🍧';
    if (food.includes('laksa')) return '🍲';
    if (food.includes('nasilemak')) return '🍛';
    if (food.includes('prata')) return '🥞';
    if (food.includes('wontonnoodles')) return '🥟';
    
    return '🍽️';
  };


  return (
    <View style={{height: 450}} className="bg-white px-4 py-4">
     <ScrollView 
        className="px-2"
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        bounces={false}

      >
        {entries.length === 0 ? (
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-6xl mb-4">🍽️</Text>
            <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
              No Food Entries Yet
            </Text>
            <Text className="text-base text-gray-600 text-center px-4">
              Start logging your meals to track your nutrition and calories!
            </Text>
            <Text className="text-sm text-gray-500 text-center mt-2 px-4">
              Tap on the scan or search features to add your first meal.
            </Text>
          </View>) : (
            entries.map((item) => (
                                <View
                                key={item.id}
                                className="bg-white rounded-2xl p-4 mb-3 shadow-lg flex-row items-center justify-between mt-2"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 8,
                                    elevation: 6,
                                  }}
                              >
                                <View className="flex-row items-center flex-1">
                                    <Text className="text-4xl mr-4"> 
                                        {getFoodEmoji(item.food)}
                                    </Text>
                                    <Text 
                                    className="text-base font-bold text-gray-800 "
                                    numberOfLines={2}
                                  
                                    > 
                                        {item.food}
                                    </Text>
                                </View>
                                
                                <View className="bg-red-500 rounded-full px-3 py-1 mx-2">
                                    <Text className="text-white fond-bold items-center"> {item.calories} </Text>
                                    <Text className="text-white text-xs text-center"> kcal </Text>
                                </View>
                            
                                <View className="items-end"> 
                                  {/* Date */}
                                  <Text className="text-gray-600 text-sm font-medium">
                                  {new Date(item.date).toLocaleDateString()}
                                  </Text>

                                  {/* Time */}
                                  <Text className="text-gray-500 text-sm">
                                    {item.time ? (() => {
                                      const cleanTime = item.time.split('.')[0];
                                      return new Date(`${item.date}T${cleanTime}Z`).toLocaleTimeString('en-SG', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                        timeZone: 'Asia/Singapore',
                                      });
                                    })() : ''}
                                  </Text>
                                </View>
                              </View>
                
                
                            ) ))} 
            

        </ScrollView>
  </View>
  );
}

export default FoodLog