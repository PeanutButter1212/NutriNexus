import React from "react";
import { View, TouchableOpacity } from "react-native";

const SimpleInventorySlot = ({ children, selected, onPress }) => {
  return (
    <View className="bg-amber-500 w-28 h-28 justify-center items-center">
      <TouchableOpacity
        onPress={onPress}
        className={`
          w-24 h-24 justify-center items-center 
          ${selected ? "border-4 border-emerald-400" : ""}
          bg-amber-900
        `}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
};

export default SimpleInventorySlot;
