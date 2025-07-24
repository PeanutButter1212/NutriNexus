import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ShopScreen from "../../../screens/ShopScreen";

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: jest.fn((callback) => callback()),
}));

jest.mock("../../../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../../hooks/useItemBank", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../../hooks/useProfileData", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../../services/shopService", () => ({
  __esModule: true,
  default: {
    fetchUserAccessories: jest.fn(),
    purchaseItem: jest.fn(),
  },
}));

jest.mock("../../../components/ShopRow", () => {
  return jest.fn(({ leftItem, rightItem, onGetPress }) => {
    const { View, Text, TouchableOpacity } = require("react-native");
    return (
      <View testID="shop-row">
        <TouchableOpacity
          testID={`get-button-${leftItem.item.id}`}
          onPress={() => onGetPress(leftItem.item)}
        >
          <Text>
            {leftItem.name} - {leftItem.cost}
          </Text>
          {leftItem.isOwned && leftItem.item.type === "Accessory" && (
            <Text testID={`owned-overlay-${leftItem.item.id}`}>OWNED</Text>
          )}
        </TouchableOpacity>
        {rightItem && (
          <TouchableOpacity
            testID={`get-button-${rightItem.item.id}`}
            onPress={() => onGetPress(rightItem.item)}
          >
            <Text>
              {rightItem.name} - {rightItem.cost}
            </Text>
            {rightItem.isOwned && rightItem.item.type === "Accessory" && (
              <Text testID={`owned-overlay-${rightItem.item.id}`}>OWNED</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  });
});

jest.mock("../../../components/ShopOrder", () => {
  return jest.fn(({ item, onConfirm, onCancel }) => {
    const { View, Text, TouchableOpacity } = require("react-native");
    return (
      <View testID="shop-order-modal">
        <Text testID="item-name">{item?.name}</Text>
        <Text testID="item-cost">{item?.cost}</Text>
        <TouchableOpacity testID="confirm-button" onPress={onConfirm}>
          <Text>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="cancel-button" onPress={onCancel}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  });
});

jest.mock("../../../components/AccessoryPopup", () => {
  return jest.fn(({ success, messageHeading, onContinue }) => {
    const { View, Text, TouchableOpacity } = require("react-native");
    return (
      <View testID={success ? "success-popup" : "error-popup"}>
        <Text testID="popup-heading">{messageHeading}</Text>
        <TouchableOpacity testID="continue-button" onPress={onContinue}>
          <Text>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  });
});

import { useAuth } from "../../../contexts/AuthContext";
import useItemBank from "../../../hooks/useItemBank";
import useProfileData from "../../../hooks/useProfileData";
import ShopService from "../../../services/shopService";

const mockSession = { user: { id: "dazhanhongtu" } };
const mockProfile = { id: "dazhanhongtu" };

const mockItemBank = [
  {
    id: "durian",
    name: "durian",
    cost: 1800,
    type: "Decor",
    image_url: "durian.png",
  },
  {
    id: "spider",
    name: "spider lily",
    cost: 1200,
    type: "Decor",
    image_url: "spiderlily.png",
  },
  {
    id: "sunglasses",
    name: "sunglasses",
    cost: 2000,
    type: "Accessory",
    image_url: "sungas.png",
  },
  {
    id: "airsm",
    name: "airism",
    cost: 3600,
    type: "Accessory",
    image_url: "arms.png",
  },
];

const mockNavigation = { goBack: jest.fn() };

const setupMocks = (points = 2500, ownedAccessories = []) => {
  useAuth.mockReturnValue({
    session: mockSession,
    profile: mockProfile,
  });
  useItemBank.mockReturnValue(mockItemBank);
  useProfileData.mockReturnValue({ points });
  ShopService.fetchUserAccessories.mockResolvedValue(ownedAccessories);
};

it("allows user to buy an accessory and updates UI accordingly", async () => {
  setupMocks(2500, []);
  ShopService.purchaseItem.mockResolvedValue({ success: true });

  ShopService.fetchUserAccessories.mockResolvedValue(["sunglasses"]);

  const { getByText, getByTestId, queryByTestId } = render(
    <ShopScreen navigation={mockNavigation} />
  );

  //show correct points
  expect(getByText("2500")).toBeTruthy();

  //click accessroy tab
  fireEvent.press(getByText("Accessory"));

  //able to buy glasses
  expect(getByTestId("get-button-sunglasses")).toBeTruthy();
  expect(queryByTestId("owned-overlay-sunglasses")).toBeNull();

  //buy and confirm glasses
  fireEvent.press(getByTestId("get-button-sunglasses"));
  fireEvent.press(getByTestId("confirm-button"));

  //show popup success
  await waitFor(() => {
    expect(getByTestId("success-popup")).toBeTruthy();
    //500 points left after purchase
    expect(getByText("500")).toBeTruthy();
  });

  fireEvent.press(getByTestId("continue-button"));

  //sunglasses now owned
  await waitFor(() => {
    expect(getByTestId("owned-overlay-sunglasses")).toBeTruthy();
  });

  expect(ShopService.purchaseItem).toHaveBeenCalledWith(
    "dazhanhongtu",
    expect.objectContaining({
      id: "sunglasses",
      type: "Accessory",
    })
  );
});
