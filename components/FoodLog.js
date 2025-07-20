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
        setEntries(userLog || []);
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
            {entries.map((item) => (
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
                    <Text className="text-gray-600 text-sm font-medium">
                        {new Date(item.date).toLocaleDateString('en-GB', { 
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}
                    </Text>
                
                <Text className="text-gray-500 text-sm">
                  {item.time
                    ? new Date(`1970-01-01T${item.time}Z`).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : ""}
                </Text>
              </View>
              </View>


            ) )}

        </ScrollView>
  </View>
  );
}

export default FoodLog