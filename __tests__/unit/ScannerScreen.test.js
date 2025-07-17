import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ScannerScreen from "../../screens/ScannerScreen";
import * as Camera from "expo-camera";

//mock camera
jest.mock("expo-camera", () => ({
  Camera: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
}));

//Test1: asking permission and setting state(approved)
it("requests camera permission on mount before setting the state correctly", async () => {
  Camera.requestCameraPermissionsAsync.mockResolvedValue({
    //pretend that camera is given permission
    status: "granted",
    granted: true,
  });

  const { getByTestId } = render(<ScannerScreen></ScannerScreen>);

  await waitFor(() => {
    expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
  });
});

//Test2: asking permission and setting state(denied)
it("display message when permission denied", async () => {
  Camera.requestCameraPermissionsAsync.mockResolvedValue({
    //pretend that camera is given permission
    status: "denied",
    granted: false,
  });

  const { getByTestId } = render(<ScannerScreen></ScannerScreen>);

  await waitFor(() => {
    expect(
      getByText("We need your permission to show the camera")
    ).toBeTruthy();
  });
});
