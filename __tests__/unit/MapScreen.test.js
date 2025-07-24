//mock hook
jest.mock("../../contexts/DistanceTrackingContext", () => ({
  useDistance: jest.fn(),
}));

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MapScreen from "../../screens/MapScreen";
import { useDistance as mockUseDistance } from "../../contexts/DistanceTrackingContext";
import useProfileData from "../../hooks/useProfileData";

//mock navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

//mock modules and data
const mockSetVisited = jest.fn();

const mockHandleFirstVisit = jest.fn(() => Promise.resolve());

jest.mock("../../services/profileService", () => ({
  handleFirstVisit: (...args) => mockHandleFirstVisit(...args), //take in same arguments
}));

//mock profile and demo so should give 3189 steps based on method
jest.mock("../../hooks/useProfileData", () => () => ({
  visited: ["visited-id"], //user alr visited this marker
  setVisited: mockSetVisited, //test if mark new place as visited after tapping marker
  userDemographics: {
    height: 170,
    gender: "male",
  },
}));

//mock coords for alr visited one and one in radius to test
jest.mock("../../hooks/useCoords", () => () => ({
  coords: [
    {
      id: "visited-id",
      latitude: 1.3,
      longitude: 103.8,
    },
    {
      id: "new-id",
      latitude: 1.30001,
      longitude: 103.80001,
    },
  ],
  loading: false,
}));

//mock auethenticate
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    session: {
      user: { id: "marcus" },
    },
  }),
}));

describe("MapScreen", () => {
  //Test 1: show loading when location not given permission/disabled
  it("shows loading when location not enabled", () => {
    //no location so set to null override the mockUseDistance
    mockUseDistance.mockImplementationOnce(() => ({
      location: null,
      distance: 2.25,
    }));

    const { getByText } = render(<MapScreen></MapScreen>);
    expect(getByText("Getting location please wait...")).toBeTruthy();
  });

  //Test 2: Displays steps and distance correctly
  it("displays steps and distance correctly", () => {
    mockUseDistance.mockImplementation(() => ({
      location: { latitude: 1.3, longitude: 103.8 },
      distance: 2250,
    }));
    const { getByText } = render(<MapScreen />);
    expect(getByText("3189")).toBeTruthy();
    expect(getByText("2250 m")).toBeTruthy();
  });

  //Test 3: Navigate to locationScreen when marker is pressed and within radius

  it("navigates to Location Details when marker is pressed and within radius", async () => {
    const { getAllByTestId } = render(<MapScreen />);

    const markers = getAllByTestId(/^marker-/); //find all with testid markers-
    expect(markers.length).toBeGreaterThan(0); //ensure that have at least 1

    fireEvent.press(markers[1]); //second marker which is the new one

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("Location Details", {
        locationrow: expect.objectContaining({ id: "new-id" }),
      });
    });
    expect(mockSetVisited).toHaveBeenCalledWith(expect.any(Function));
  });
});
