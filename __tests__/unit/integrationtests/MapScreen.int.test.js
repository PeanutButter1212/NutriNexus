import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MapScreen from "../../../screens/MapScreen";
import { Alert } from "react-native";

const mockNavigate = jest.fn();
const mockSetVisited = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => ({ session: { user: { id: "marcus" } } }),
}));

//mock location
jest.mock("../../../contexts/DistanceTrackingContext", () => ({
  useDistance: () => ({
    location: { latitude: 1.3, longitude: 103.8 },
    distance: 150,
  }),
}));

//mock markers
jest.mock("../../../hooks/useCoords", () => () => ({
  coords: [
    { id: "in-radius", latitude: 1.30001, longitude: 103.80001 },
    { id: "out-radius", latitude: 1.31, longitude: 103.81 },
  ],
  loading: false,
}));

jest.mock("../../../hooks/useProfileData", () => () => ({
  visited: [],
  setVisited: mockSetVisited,
}));

jest.mock("../../../services/profileService", () => ({
  handleFirstVisit: jest.fn(() => Promise.resolve()),
}));

describe("MapScreen integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Users interacts with 2 markers, one in radius and one out of radius", async () => {
    // mock Alert
    jest.spyOn(Alert, "alert").mockImplementation(() => {});

    const { getAllByTestId, getByText } = render(<MapScreen />);

    //users see correct distance/steps
    expect(getByText("200")).toBeTruthy();
    expect(getByText("150 m")).toBeTruthy();

    const markers = await waitFor(() => getAllByTestId(/^marker-/));
    expect(markers.length).toBe(2);

    // In radius marker go to new screen and set to visted
    fireEvent.press(markers[0]);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("Location Details", {
        locationrow: expect.objectContaining({ id: "in-radius" }),
      });
      expect(mockSetVisited).toHaveBeenCalledWith(expect.any(Function));
    });

    // Out of radius marker trigegr alert
    fireEvent.press(markers[1]);
    expect(Alert.alert).toHaveBeenCalledWith(
      "Too far please move closer to interact"
    );
  });
});
