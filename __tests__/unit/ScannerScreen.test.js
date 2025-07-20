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
  insertFoodEntry,
} from "../../services/scannerService";
import {
  updateCaloriesConsumed,
  fetchProfileCalories,
  fetchWeeklyCalories,
} from "../../services/profileService";
//Mocks to simulate screen

//camera
jest.mock("expo-camera", () => ({
  CameraView: () => null,
  useCameraPermissions: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
}));

//auhenticated user
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

//methods used
jest.mock("../../services/scannerService", () => ({
  fetchFoodSuggestions: jest.fn(),
  fetchCaloriesByFood: jest.fn(),
  predictFoodFromImage: jest.fn(),
  insertFoodEntry: jest.fn(),
}));

//shared cameraref
const mockCameraRef = {
  current: {
    takePictureAsync: jest.fn(() =>
      Promise.resolve({ uri: "file://mock.jpg" })
    ),
    resumePreview: jest.fn(),
  },
};

//mock profile service to test activity log
jest.mock("../../services/profileService", () => ({
  updateCaloriesConsumed: jest.fn(),
  fetchProfileCalories: jest.fn(),
  fetchWeeklyCalories: jest.fn(),
}));

describe("ScannerScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useAuth.mockReturnValue({
      session: { user: { id: "marcus" } },
    });

    useCameraPermissions.mockReturnValue([
      { granted: true, status: "granted" },
      jest.fn(),
    ]);
    insertFoodEntry.mockResolvedValue({ error: null }); //return success
  });

  //Test 1: permission granted camera access
  it("requests camera permission on mount", async () => {
    render(
      <NavigationContainer>
        <ScannerScreen cameraRef={mockCameraRef} />
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

    expect(
      await waitFor(() =>
        getByText("We need your permission to show the camera")
      )
    ).toBeTruthy();
  });

  //Test 3: Test display and selection of suggestions for manual input with calories
  it("displays suggestions and updates calories when food is selected", async () => {
    fetchFoodSuggestions.mockResolvedValue([{ name: "NasiLemak" }]);
    fetchCaloriesByFood.mockResolvedValue(500);

    const { getByPlaceholderText, findByText, getByText } = render(
      <NavigationContainer>
        <ScannerScreen />
      </NavigationContainer>
    );

    fireEvent.changeText(
      getByPlaceholderText("Take a photo or type to search"),
      "NasiLemak"
    );
    //user taps on suggestion from dropdown list
    const suggestion = await findByText("NasiLemak");
    fireEvent.press(suggestion);

    await waitFor(() => {
      expect(getByText("500 kcal")).toBeTruthy();
    });
  });

  //Test 4: Upload image to ML backend and return food type with calories
  it("takes photo and updates food + calories", async () => {
    predictFoodFromImage.mockResolvedValue({ detections: ["NasiLemak"] });
    fetchCaloriesByFood.mockResolvedValue(500);

    const { getByText, findByText } = render(
      <NavigationContainer>
        <ScannerScreen cameraRef={mockCameraRef} />
      </NavigationContainer>
    );

    fireEvent.press(getByText("Upload"));

    await waitFor(() => {
      expect(mockCameraRef.current.takePictureAsync).toHaveBeenCalled();
      expect(predictFoodFromImage).toHaveBeenCalledWith({
        uri: "file://mock.jpg",
      });
      expect(fetchCaloriesByFood).toHaveBeenCalledWith("NasiLemak");
    });

    expect(await findByText("500 kcal")).toBeTruthy();
  });

  //Test 5: No food detected by ML
  it("shows text popup when no food is detected", async () => {
    //return blank result from ml model
    predictFoodFromImage.mockResolvedValue({ detections: [] });

    const { getByText, findByText } = render(
      <NavigationContainer>
        <ScannerScreen cameraRef={mockCameraRef} />
      </NavigationContainer>
    );

    fireEvent.press(getByText("Upload"));

    expect(await findByText("No detected food found")).toBeTruthy();
  });

  //Test 6: Entry added to activity log after uplaod clicked
  it("inserts food entry into activity_log after upload", async () => {
    predictFoodFromImage.mockResolvedValue({ detections: ["NasiLemak"] });
    fetchCaloriesByFood.mockResolvedValue(500);

    const { getByText, findByText } = render(
      <NavigationContainer>
        <ScannerScreen cameraRef={mockCameraRef} />
      </NavigationContainer>
    );

    fireEvent.press(getByText("Upload"));

    await findByText("500 kcal");

    fireEvent.press(getByText("Submit"));

    await waitFor(() => {
      expect(insertFoodEntry).toHaveBeenCalledWith({
        userId: "marcus",
        food: "NasiLemak",
        calories: 500,
      });
    });
    expect(updateCaloriesConsumed).toHaveBeenCalledWith("marcus");
    expect(fetchProfileCalories).toHaveBeenCalledWith("marcus");
    expect(fetchWeeklyCalories).toHaveBeenCalledWith("marcus");
  });
});
