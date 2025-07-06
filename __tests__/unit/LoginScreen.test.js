import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import LoginScreen from '../../screens/LoginScreen'

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
  }));
  
jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

const mockNavigation = {
    navigate: jest.fn(),
  };

const mockSignInWithOTP = jest.fn();
const mockGoogleSignIn = jest.fn();

beforeEach(() => {
    const mockNavigation = {
        navigation: jest.fn()
    }
    jest.clearAllMocks() 
    useAuth.mockReturnValue({
        signInWithOTP: mockSignInWithOTP,
        googleSignIn: mockGoogleSignIn
    })
    
})

it('Does not accept empty email placeholder', async () => {
    const { getByPlaceholderText, getAllByText, getByText } = render(
        <LoginScreen navigation={mockNavigation} /> 
    )

    const emailInput = getByPlaceholderText('Email')
    const loginDivisions = getAllByText('Login')
    const loginButton = loginDivisions[1]

    fireEvent.changeText(emailInput, '')
    fireEvent.press(loginButton)

    await waitFor(() => {
        expect(getByText("Please fill in all fields!")).toBeTruthy()
    })
})