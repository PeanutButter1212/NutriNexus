import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../../screens/LoginScreen";

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

jest.mock("../../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";

const mockNavigation = {
  navigate: jest.fn(),
};

const mockSignInWithOTP = jest.fn();
const mockGoogleSignIn = jest.fn();

beforeEach(() => {
  const mockNavigation = {
    navigation: jest.fn(),
  };
  jest.clearAllMocks();
  useAuth.mockReturnValue({
    signInWithOTP: mockSignInWithOTP,
    googleSignIn: mockGoogleSignIn,
  });
});

// Test 1: If placeholder is empty, fill in all fields error shows up

it("Does not accept empty email placeholder", async () => {
  const { getByPlaceholderText, getAllByText, getByText } = render(
    <LoginScreen navigation={mockNavigation} />
  );

  const emailInput = getByPlaceholderText("Email");
  const loginDivisions = getAllByText("Login");
  const loginButton = loginDivisions[1];

  fireEvent.changeText(emailInput, "");
  fireEvent.press(loginButton);

  await waitFor(() => {
    expect(getByText("Please fill in all fields!")).toBeTruthy();
  });
});

//Test 2: Displays errror message when invalid email format is given
it("Displays error message for invalid credentials", async () => {
  const { getByPlaceholderText, getAllByText, getByText } = render(
    <LoginScreen navigation={mockNavigation} />
  );
  const emailInput = getByPlaceholderText("Email");
  const loginDivisions = getAllByText("Login");
  const loginButton = loginDivisions[1];

  fireEvent.changeText(emailInput, "test@gmail");

  const errorMessage = "Invalid Credentials";
  mockSignInWithOTP.mockResolvedValue(errorMessage);

  fireEvent.press(loginButton);

  await waitFor(() => {
    expect(getByText(errorMessage)).toBeTruthy();
  });
});

// Test 3: Sign in function should be called when valid email is given
it("Calls signInWithOTP when valid email is given", async () => {
  const { getByPlaceholderText, getAllByText, getByText } = render(
    <LoginScreen navigation={mockNavigation} />
  );

  const emailInput = getByPlaceholderText("Email");
  const loginDivisions = getAllByText("Login");
  const loginButton = loginDivisions[1];

  fireEvent.changeText(emailInput, "validemail@gmail.com");
  fireEvent.press(loginButton);

  await waitFor(() => {
    expect(mockSignInWithOTP).toHaveBeenCalledWith(
      "validemail@gmail.com",
      mockNavigation
    );
  });
});
