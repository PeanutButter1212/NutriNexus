//test the flow, specific method calling and testing is done in unit test

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ScannerScreen from "../../../screens/ScannerScreen";
import * as scannerService from "../../../services/scannerService";
import { NavigationContainer } from "@react-navigation/native";
import { predictFoodFromImage } from "../../../services/scannerService";

//mock stuff
jest.mock("../../../components/AccessoryPopup", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return ({ messageHeading }) => <Text>{messageHeading}</Text>;
});

jest.mock("../../../services/scannerService", () => ({
  fetchCaloriesByFood: jest.fn(),
  fetchFoodSuggestions: jest.fn(),
  insertFoodEntry: jest.fn(),
  predictFoodFromImage: jest.fn(),
}));

jest.mock("../../../services/profileService", () => ({
  fetchProfileCalories: jest.fn(),
  updateCaloriesConsumed: jest.fn(),
  fetchWeeklyCalories: jest.fn(),
}));

jest.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => ({
    session: {
      user: { id: "marcus" },
    },
  }),
}));

//mock camera permission granted

jest.mock("expo-camera", () => ({
  CameraView: () => null,
  useCameraPermissions: () => [
    { granted: true, status: "granted" }, // ✅ simulate granted permission
    jest.fn(), // requestPermission
  ],
}));

//mock photo
const mockCameraRef = {
  current: {
    takePictureAsync: jest.fn(() => Promise.resolve({ uri: "mock-photo.jpg" })),
    resumePreview: jest.fn(),
  },
};

test("User accepts camera access, maunually type food, select suggestion, showing calories and then submitting", async () => {
  scannerService.fetchFoodSuggestions.mockResolvedValue([
    { name: "IceKachang" },
  ]);
  scannerService.fetchCaloriesByFood.mockResolvedValue("257");
  scannerService.insertFoodEntry.mockResolvedValue({ error: null });

  const { getByPlaceholderText, getByText, findByText } = render(
    <NavigationContainer>
      <ScannerScreen></ScannerScreen>
    </NavigationContainer>
  );

  const input = getByPlaceholderText("Take a photo or type to search");

  //user types input partially
  fireEvent.changeText(input, "Ice");

  //should show list of suggestions
  const suggestion = await findByText("IceKachang");

  //user press on suggestion
  fireEvent.press(suggestion);

  //calories load
  await findByText("257 kcal");

  //Submit button pressed
  fireEvent.press(getByText("Submit"));
  //this also triggers the profile service methods to update circular graphbar graph and activity log

  //Popp appears showing successful update
  const success = await findByText("Update Success");
  expect(success).toBeTruthy();
});

test("User accepts camera access, uses camera to take photo, uploads, select suggestion, showing calories and then submitting", async () => {
  scannerService.predictFoodFromImage.mockResolvedValue({
    detections: ["WontonNoodles"],
  });
  scannerService.fetchCaloriesByFood.mockResolvedValue(425);
  scannerService.insertFoodEntry.mockResolvedValue({ error: null });

  const { getByText, findByText } = render(
    <NavigationContainer>
      <ScannerScreen cameraRef={mockCameraRef}></ScannerScreen>
    </NavigationContainer>
  );

  //user presses uplaod button of photo
  fireEvent.press(getByText("Upload"));

  //photo taken and uplaoded to ML
  await waitFor(() => {
    expect(mockCameraRef.current.takePictureAsync).toHaveBeenCalled();
    expect(predictFoodFromImage).toHaveBeenCalledWith({
      uri: "mock-photo.jpg",
    });
  });

  //calories load
  await findByText("425 kcal");

  //Submit button pressed
  fireEvent.press(getByText("Submit"));

  //Popp appears showing successful update
  expect(await findByText("Update Success")).toBeTruthy();
});
