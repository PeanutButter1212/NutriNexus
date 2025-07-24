//i included the flow from login -> OTP -> welcome page for first time or profile for not

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../../../screens/LoginScreen";
import OtpScreen from "../../../screens/OTPScreen";
import { useAuth } from "../../../contexts/AuthContext";
import useProfileData from "../../../hooks/useProfileData";

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(() => mockNavigation),
}));

jest.mock("../../../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../../hooks/useProfileData", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockNavigation = { navigate: jest.fn() };
const mockSignInWithOTP = jest.fn();
const mockVerifyOTP = jest.fn();
const mockSetProfile = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({
    signInWithOTP: mockSignInWithOTP,
    verifyOtp: mockVerifyOTP,
    session: { user: { id: "Marcus" } },
    setProfile: mockSetProfile,
  });
});

it("logs in and navigates to WelcomeScreen if first time", async () => {
  //Login
  const login = render(<LoginScreen navigation={mockNavigation} />);
  const emailInput = login.getByPlaceholderText("Email");
  const loginButton = login.getAllByText("Login")[1];

  fireEvent.changeText(emailInput, "Marcus@gmail.com");

  mockSignInWithOTP.mockImplementation(async (email, navigation) => {
    navigation.navigate("OTP");
    return null;
  });

  fireEvent.press(loginButton);

  await waitFor(() => {
    expect(mockSignInWithOTP).toHaveBeenCalled();
    expect(mockNavigation.navigate).toHaveBeenCalledWith("OTP");
  });

  //OTP
  const route = { params: { email: "Marcus@gmail.com" } };

  useAuth.mockReturnValue({
    verifyOtp: mockVerifyOTP,
    session: { user: { id: "Marcus" } },
    setProfile: mockSetProfile,
  });

  //set to first time so should go login
  useProfileData.mockReturnValueOnce({
    profile: { is_first_time: true },
    loading: false,
  });

  const otp = render(<OtpScreen navigation={mockNavigation} route={route} />);

  const otpInput = otp.getByPlaceholderText("6 digit code");

  const confirmButton = otp.getByText("Authenticate");

  fireEvent.changeText(otpInput, "123456");

  mockVerifyOTP.mockImplementation((email, otp, navigation) => {
    navigation.navigate("WelcomeScreen");
    return null;
  });

  fireEvent.press(confirmButton);

  await waitFor(() => {
    expect(mockVerifyOTP).toHaveBeenCalledWith(
      "Marcus@gmail.com",
      "123456",
      mockNavigation
    );
    //after success go welcome
    expect(mockNavigation.navigate).toHaveBeenCalledWith("WelcomeScreen");
  });
});

it("logs in and navigates to ProfileScreen if not first time", async () => {
  const route = { params: { email: "Marcus@gmail.com" } };

  useAuth.mockReturnValue({
    verifyOtp: mockVerifyOTP,
    session: { user: { id: "Marcus" } },
    setProfile: mockSetProfile,
  });

  //not first time so should go profile straight
  useProfileData.mockReturnValueOnce({
    profile: { is_first_time: false },
    loading: false,
  });

  const otp = render(<OtpScreen navigation={mockNavigation} route={route} />);

  const otpInput = otp.getByPlaceholderText("6 digit code");

  const confirmButton = otp.getByText("Authenticate");

  fireEvent.changeText(otpInput, "654321");

  mockVerifyOTP.mockImplementation((email, otp, navigation) => {
    navigation.navigate("ProfileScreen");
    return null;
  });

  fireEvent.press(confirmButton);

  await waitFor(() => {
    expect(mockVerifyOTP).toHaveBeenCalledWith(
      "Marcus@gmail.com",
      "654321",
      mockNavigation
    );
    expect(mockNavigation.navigate).toHaveBeenCalledWith("ProfileScreen");
  });
});
