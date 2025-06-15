import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const data = [
  { label: "Steps", val: "Steps" },
  { label: "Calories", val: "Calories" },
];

const DropdownComponent = ({ value, onChange }) => {

  return (
    <Dropdown
      style={styles.dropdown}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={data}
      search
      maxHeight={300}
      labelField="label"
      valueField="val"
      placeholder="Select item"
      searchPlaceholder="Search..."
      value={value}
      onChange={(item) => {
        onChange(item.val);
      }}
      renderLeftIcon={() => {
        const selectedItem = data.find((item) => item.val === value);
        return selectedItem?.val === "Steps" ? (
          <Ionicons name="footsteps-sharp" size={24} color="#ba4a00" />
        ) : (
          <FontAwesome5 name="fire" size={20} color="#FF7F50" />
        );
      }}
    />
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
