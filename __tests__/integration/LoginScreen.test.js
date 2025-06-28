import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../../screens/LoginScreen';
import OTPScreen from '../../screens/OTPScreen';

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signInWithOTP: jest.fn().mockImplementation(async (email, navigation) => {
      
      navigation.navigate('OTP', { email });
      return null; 
    }),
    googleSignIn: jest.fn(),
  }),
}));

const Stack = createNativeStackNavigator();

const TestApp = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OTP" component={OTPScreen} options={{ headerShown: true }} />
    </Stack.Navigator>
  </NavigationContainer>
);




beforeEach(() => {
  jest.clearAllMocks();
});


describe ('Login Screen navigation flow testing', () => {
  it('should navigate from Login to OTP screen when valid email is entered', async () => {
    const { getByPlaceholderText, getAllByText, getByText, queryByText } = render(<TestApp />);

    expect(getByText('NutriNexus')).toBeTruthy();

    
    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'test@example.com');

    const loginButton = getAllByText('Login')[1]; 
    fireEvent.press(loginButton);

    
    await waitFor(() => {
      expect(queryByText('NutriNexus')).toBeFalsy(); 
      expect(getByText('Enter the 6-digit code sent to your Email')).toBeTruthy(); 
    }, { timeout: 3000 });
  });

})