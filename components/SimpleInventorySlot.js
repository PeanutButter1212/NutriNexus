import React from "react";
import { View } from "react-native";

const SimpleInventorySlot = ({ children, className }) => {
  return (
    <View
      className={`bg-amber-500 w-28 h-28 justify-center items-center ${
        className || ""
      }`}
    >
      {children}
    </View>
  );
};

export default SimpleInventorySlot;
