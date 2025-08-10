import { View, Text, Platform } from "react-native";
import React from "react";

const InventoryColumn = ({ topItem, className }) => {
  return (
    <View
      className={`flex-col ${className || ""}`}
      testID={`inventory-container-${topItem.item_id}`}
    >
        <View
          ref={topItem.slotRef}
          className={`bg-amber-900 border-8 border-amber-500 "w-28 h-28"
          justify-center items-center`}
        >
          <View>{topItem.children}</View>
          <View
            className="bg-emerald-500 absolute right-0 bottom-0 p-1"
            style={{
              borderTopLeftRadius: 10,
            }}
          >
            <Text className="text-white text-center font-bold">
              {topItem.count}
            </Text>
          </View>
      </View>
    </View>
  );
};

export default InventoryColumn;
