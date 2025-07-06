import { View, Text, Image, TouchableOpacity, Modal } from 'react-native'
import React from 'react'
import pointLogo from '../assets/Points.png'

const ShopRow = ({leftItem, rightItem, onGetPress}) => {

    const outerBoxWidth = 140

    const renderItemBox = (item) => (
     <View
     className="bg-amber-900 mt-2 justify-center items-center border-[0.75vw] border-amber-500 p-4 rounded-2xl"
     style= {{
       width: outerBoxWidth,
       minHeight: outerBoxWidth,
     }}
     >
        
             <View
             className="flex-column items-center justify-center"
             >
                 {item.children}
                 <View className="items-center justify-center"> 
                   <Text
                   className="text-white font-nunito-bold mb-3 text-xl"
                   >
                   {item.name}
                   </Text>
                 </View>
                 
                 <View className="bg-gray-800 border-2 border-yellow-500 rounded-xl px-4 py-2 mb-4">
                 
                       <View className="justify-center items-center flex-row min-w-16">
                            <Image
                            source={pointLogo}
                            className="h-8 w-8"
                            />
                            <Text className="font-nunito-extrabold text-orange-400"> 
                               {item.cost}
                            </Text>
           
                       </View>


                   </View>

                   <TouchableOpacity
                   className="bg-blue-500 px-6 rounded-xl py-2"
                   onPress={() => onGetPress?.(item.item)}
                   >
                       <Text
                       className="text-white font-bold"
                       >
                       GET
                       </Text>
                           
                 </TouchableOpacity>
             </View>
             
             {item.isOwned && item.item?.type === "Accessory" && (
            <View style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 16,
            }}>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>OWNED</Text>
            </View>
            )}
   
     </View> 
        )
    return (
        <View className="flex-row justify-between">
            <View className="ml-5">
                {renderItemBox(leftItem)}
            </View>
            
            {/* Right item with consistent spacing */}
            {rightItem && (
                <View className="mr-5">
                    {renderItemBox(rightItem)}
                </View>
            )}
        </View>
    )
  }
  
  export default ShopRow