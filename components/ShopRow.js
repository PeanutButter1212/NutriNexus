import { View, Text, Image, TouchableOpacity, Modal } from 'react-native'
import React from 'react'
import pointLogo from '../assets/Points.png'

const ShopRow = ({topItem, bottomItem, onGetPress}) => {

    const outerBoxWidth = 140
    const innerBoxWidth = 130

   
    return (
    <View className="flex-column">
         <View className="flex-row justify-between">
          <View
          className="bg-amber-900 ml-4 mt-2 justify-center items-center border-[0.75vw] border-amber-500 p-4 rounded-2xl"
          style= {{
            width: outerBoxWidth,
            minHeight: outerBoxWidth,
          }}
          >
             
                  <View
                  className="flex-column items-center justify-center"
                  >
                      {topItem.children}
                      <View className="items-center justify-center"> 
                        <Text
                        className="text-white font-nunito-bold mb-3 text-xl"
                        >
                        {topItem.name}
                        </Text>
                      </View>
                      
                      <View className="bg-gray-800 border-2 border-yellow-500 rounded-xl px-4 py-2 mb-4">
                      
                            <View className="justify-center items-center flex-row min-w-16">
                                 <Image
                                 source={pointLogo}
                                 className="h-8 w-8"
                                 />
                                 <Text className="font-nunito-extrabold text-orange-400"> 
                                    {topItem.cost}
                                 </Text>
                
                            </View>


                        </View>

                        <TouchableOpacity
                        className="bg-blue-500 px-6 rounded-xl py-2"
                        onPress={() => onGetPress?.(topItem.item)}
                        >
                            <Text
                            className="text-white font-bold"
                            >
                            GET
                            </Text>
                                
                      </TouchableOpacity>
                  </View>
                  
        
          </View>  
  
          {bottomItem && (
             <View
             className="bg-amber-900 mr-4 mt-2 justify-center items-center border-[0.75vw] border-amber-500 p-4 rounded-2xl"
             style= {{
               width: outerBoxWidth,
               minHeight: outerBoxWidth,
             }}
             >
        
                <View
                className="flex-column items-center justify-center"
                >
                    {bottomItem.children}
                    <Text
                        className="text-white font-nunito-bold mb-3 text-xl"
                        >
                        {bottomItem.name}
                        </Text>
                    <View className="bg-gray-800 border-2 border-yellow-500 rounded-xl px-4 py-2 mb-4">
                    
                        <View className="justify-center items-center flex-row min-w-16">
                            <Image
                            source={pointLogo}
                            className="h-8 w-8"
                            />
                            <Text className="font-nunito-extrabold text-orange-400"> 
                                {bottomItem.cost}
                            </Text>
            
                        </View>


                    </View>

                    <TouchableOpacity
                        className="bg-blue-500 px-6 rounded-xl py-2"
                        onPress={() => onGetPress?.(bottomItem.item)}
                        >
                            <Text
                            className="text-white font-bold"
                            >
                            GET
                            </Text>
                                
                      </TouchableOpacity>
                </View>
        
             </View>  
            


          )} 
      </View>  



    </View>
     
    )
  }
  
  export default ShopRow