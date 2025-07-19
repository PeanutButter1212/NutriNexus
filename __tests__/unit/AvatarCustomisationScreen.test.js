import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import AvatarCustomisationScreen from "../../screens/AvatarCustomisationScreen";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import useAccessoryInventory from "../../hooks/useAccessoryInventory";
import useEquippedItems from "../../hooks/useEquippedItems";
import useProfileData from "../../hooks/useProfileData";
import { saveEquippedItems } from "../../services/avatarService";

//mock the dependencies
jest.mock("../../hooks/useAccessoryInventory");
jest.mock("../../hooks/useEquippedItems");
jest.mock("../../hooks/useProfileData");
jest.mock("../../services/avatarService");

//auhenticated user
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("AvatarCustomisationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks

    //mock item
    useAccessoryInventory.mockReturnValue([
      {
        item_id: "item-123",
        image_url: "http://test.png",
        slot: "head",
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

    useAuth.mockReturnValue({
      session: { user: { id: "test-user-id" } },
    });

    saveEquippedItems.mockResolvedValue(true);
  });

  //Test 1: Load correct gender based on profile data
  it("renders correct avatar based on gender", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <AvatarCustomisationScreen></AvatarCustomisationScreen>
      </NavigationContainer>
    );

    const avatarImage = getByTestId("avatar-image"); //label image with testid so it picks up

    expect(avatarImage.props.source).toMatchObject(
      require("../../assets/FemaleEdited.png")
    );
  });

  //Test 2: Swtich accesorry tab when pressed

  it("switches accessory inventory type when pressed", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <AvatarCustomisationScreen />
      </NavigationContainer>
    );

    const handTab = getByTestId("tab-Hand"); //ensure that pressing hand will lead to hand tab activated
    fireEvent.press(handTab);

    expect(handTab).toBeTruthy();
  });

  //Test 3: equips/unequip accessory on press

  it("equips/unequips accessory on press", () => {
    const { getByTestId, queryByTestId } = render(
      <NavigationContainer>
        <AvatarCustomisationScreen />
      </NavigationContainer>
    );
    const accessoryButton = getByTestId("accessory-button-item-123");

    //user selects accessory
    fireEvent.press(accessoryButton);

    const equippedImage = getByTestId("equipped-item-123");
    expect(equippedImage).toBeTruthy();

    fireEvent.press(accessoryButton);

    expect(queryByTestId("test-123")).toBeNull();
  });

  //Test 4: calls savedEquippedItems when save is pressed and updates equipped items
  it("calls saveEquippedItems when Save is pressed", async () => {
    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <AvatarCustomisationScreen />
      </NavigationContainer>
    );

    const accessoryButton = getByTestId("accessory-button-item-123");
    fireEvent.press(accessoryButton);

    const saveButton = getByText("Save");
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(saveEquippedItems).toHaveBeenCalled();
      const equippedAccessory = getByTestId("equipped-item-123");
      expect(equippedAccessory).toBeTruthy();
    });
  });
});
