import { View, Text } from 'react-native'
import React from 'react'

const InventoryColumn = ({topItem, className}) => {
  return (
    <View className={`flex-col ${className || ""}`}> 
        <View
        className="bg-amber-500 w-36 h-36 justify-center items-center"
        >
            <View
            ref={topItem.slotRef} 
            className="bg-amber-900 w-28 h-28 justify-center items-center"> 
                <View
                >
                    {topItem.children}
                </View>
                <View
                className="bg-emerald-500 w-6 h-5 rounded-l justify-center bottom-0 right-0 absolute"
                >
                    <Text 
                    className="text-white text-center font-bold"
                    >
                        {topItem.count}
                    </Text>
                </View>
            </View>
        </View>  

    </View>  
  )
}

export default InventoryColumn