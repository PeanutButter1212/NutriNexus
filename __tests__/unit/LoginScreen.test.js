import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../screens/LoginScreen';
import { useAuth } from '../../contexts/AuthContext';



jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));
  
jest.mock('expo-status-bar', () => ({ StatusBar: 'StatusBar' }));
jest.mock('@expo/vector-icons', () => ({ AntDesign: 'AntDesign' }));

const mockNavigation = {
    navigate: jest.fn(),
    replace: jest.fn(),
  };
const mockSignInWithOTP = jest.fn();
const mockGoogleSignIn = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
        signInWithOTP: mockSignInWithOTP,
        googleSignIn: mockGoogleSignIn,
        loading: false,
        user: null,
    });
});

describe('Login Buttons render correctly', () => {
    it('Login Screen should render all UI elements correctly', () => {
        const { getByText, getByPlaceholderText, getAllByText } = render(
          <LoginScreen navigation={mockNavigation} />
        );
  
        expect(getByText('NutriNexus')).toBeTruthy();
        const loginElements = getAllByText('Login');
        expect(loginElements).toHaveLength(2);
        expect(loginElements[0]).toBeTruthy(); 
        expect(loginElements[1]).toBeTruthy(); 
        expect(getByPlaceholderText('Email')).toBeTruthy();

      });

    it('Login Screen should not show error message initially', () => {
        const { queryByText } = render(
            <LoginScreen navigation={mockNavigation} />
        );

        expect(queryByText("Please fill in all fields!")).toBeNull();
    });
});

describe('User Email Interactions', () => {
    it('Email input is updated when user types', () => {
        const { getByPlaceholderText } = render( 
            <LoginScreen navigation={mockNavigation} /> 
        );

        const emailPlaceholder = getByPlaceholderText('Email')
        fireEvent.changeText(emailPlaceholder, "emerson@singapore.com")
        
        expect(emailPlaceholder.props.value).toBe('emerson@singapore.com')

    } )

})

describe('Login Functionality', () => {
    it('Error message should show when user input empty error', async () => {
        const { getAllByText, getByText } = render(
            <LoginScreen navigation={mockNavigation}/> 
        ) ;

        const loginButtons = getAllByText('Login')
        const loginButton = loginButtons[1]
        fireEvent.press(loginButton)

        await waitFor(() => {
            expect(getByText('Please fill in all fields!')).toBeTruthy();
            expect(mockSignInWithOTP).not.toHaveBeenCalled();
        })
    }) 

    it('Login Button should call signInWithOTP when valid email is provided', async () => {
        mockSignInWithOTP.mockResolvedValue(undefined);

        const { getByPlaceholderText, getAllByText, queryByText } = render(
            <LoginScreen navigation={mockNavigation} />
        );

        const emailPlaceholder = getByPlaceholderText('Email');
        const loginButtons = getAllByText('Login')
        const loginButton = loginButtons[1]

        fireEvent.changeText(emailPlaceholder, 'emersonchua111@gmail.com')
        fireEvent.press(loginButton)

        await waitFor(() => {
            expect(mockSignInWithOTP).toHaveBeenCalledWith('emersonchua111@gmail.com', mockNavigation);
            expect(queryByText("Please fill in all fields!")).toBeNull();
        }
    )
        
    })
})