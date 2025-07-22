import { View, Text, Platform } from 'react-native'
import React from 'react'

const ShovelComponent = ({topItem, className}) => {
  return (
    <View className={`flex-col ${className || ""}`}> 
        <View
        className={`bg-stone-400 ${Platform.OS === "ios" ? "w-20 h-20" : "w-16 h-16"} justify-center items-center`}
        >
            <View
            ref={topItem.slotRef} 
            className={`bg-amber-900 ${Platform.OS === "ios" ? "w-16 h-16" : "w-12 h-12"} justify-center items-center`} 
            >
                <View>
                    {topItem.children}
                </View>
               
            </View>
        </View>  

    </View>  
  )
}

export default ShovelComponent