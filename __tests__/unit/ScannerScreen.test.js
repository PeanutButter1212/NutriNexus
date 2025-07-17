import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import ScannerScreen from "../../screens/ScannerScreen";
import { NavigationContainer } from "@react-navigation/native";
import { useCameraPermissions } from "expo-camera";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchFoodSuggestions,
  fetchCaloriesByFood,
  predictFoodFromImage,
} from "../../services/scannerService";

//mock camera
jest.mock("expo-camera", () => ({
  CameraView: () => null,
  useCameraPermissions: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
}));

//mock authenticated
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

//mock methods to test
jest.mock("../../services/scannerService", () => ({
  fetchFoodSuggestions: jest.fn(),
  fetchCaloriesByFood: jest.fn(),
  predictFoodFromImage: jest.fn(),
}));

//folder called ScannerScreen permission handling
describe("ScannerScreen permission handling", () => {
  //need auth if not wont work just like in screem
  beforeEach(() => {
    useAuth.mockReturnValue({
      session: {
        user: { id: "test-user-id" },
      },
    });
  });

  //Test 1: permission granted camera access
  it("requests camera permission on mount", async () => {
    useCameraPermissions.mockReturnValue([
      { granted: true, status: "granted" },
      jest.fn(),
    ]);

    render(
      <NavigationContainer>
        <ScannerScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(useCameraPermissions).toHaveBeenCalled();
    });
  });

  //Test 2: permission denied camera access
  it("shows permission denied message", async () => {
    useCameraPermissions.mockReturnValue([
      { granted: false, status: "denied" },
      jest.fn(),
    ]);

    const { getByText } = render(
      <NavigationContainer>
        <ScannerScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(
        getByText("We need your permission to show the camera")
      ).toBeTruthy();
    });
  });
});

//Test 3: Test display and selection of suggestions for manual input with calories

it("displays suggestions when manually input", async () => {
  useCameraPermissions.mockReturnValue([
    { granted: true, status: "granted" },
    jest.fn(),
  ]);

  fetchFoodSuggestions.mockResolvedValue([{ name: "NasiLemak" }]);
  fetchCaloriesByFood.mockResolvedValue(500);

  const { getByPlaceholderText, getByText, findByText } = render(
    <NavigationContainer>
      <ScannerScreen />
    </NavigationContainer>
  );

  const input = getByPlaceholderText("Take a photo or type to search");
  fireEvent.changeText(input, "NasiLemak");

  //user tapping on the suggestion
  const suggestion = await findByText("NasiLemak");
  fireEvent.press(suggestion);

  await waitFor(() => {
    expect(getByText("500 kcal")).toBeTruthy();
  });
});

//Test 4: Upload image to ML backend and return food type with calories
