import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import AvatarCustomisationScreen from "../../../screens/AvatarCustomisationScreen";
import useAccessoryInventory from "../../../hooks/useAccessoryInventory";
import useEquippedItems from "../../../hooks/useEquippedItems";
import useProfileData from "../../../hooks/useProfileData";
import { saveEquippedItems } from "../../../services/avatarService";

jest.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => ({
    session: {
      user: { id: "marcus" },
    },
  }),
}));

jest.mock("../../../hooks/useAccessoryInventory", () => jest.fn());

jest.mock("../../../hooks/useEquippedItems", () => jest.fn());

jest.mock("../../../hooks/useProfileData", () => jest.fn());

jest.mock("../../../services/avatarService", () => ({
  saveEquippedItems: jest.fn(),
}));

describe("AvatarCustomisationScreen: Full Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useAccessoryInventory.mockReturnValue([
      {
        item_id: "socks",
        image_url: "http://test.png",
        slot: "hand",
        position: {
          topPct: 0.1,
          leftPct: 0.1,
          widthPct: 0.5,
          heightPct: 0.5,
        },
      },
    ]);

    useEquippedItems.mockReturnValue({
      head: null,
      body: null,
      hand: null,
    });

    useProfileData.mockReturnValue({
      userDemographics: { gender: "Female" },
    });

    saveEquippedItems.mockResolvedValue(true);
  });

  it("loads avatar, switches tab, equips item and saves", async () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <AvatarCustomisationScreen />
      </NavigationContainer>
    );

    //Load correct gender avatar
    const avatarImage = getByTestId("avatar-image");
    expect(avatarImage.props.source).toMatchObject(
      require("../../../assets/FemaleEdited.png")
    );

    //users switches between tabs
    const headTab = getByTestId("tab-Head");
    fireEvent.press(headTab);

    const handTab = getByTestId("tab-Hand");
    fireEvent.press(handTab);

    //Equip item from hand tab
    const accessoryBtn = getByTestId("accessory-button-socks");
    fireEvent.press(accessoryBtn);
    const equippedItem = getByTestId("equipped-socks");
    expect(equippedItem).toBeTruthy();

    //Press save button
    const saveBtn = getByText("Save");
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(saveEquippedItems).toHaveBeenCalled();
    });
  });
});
