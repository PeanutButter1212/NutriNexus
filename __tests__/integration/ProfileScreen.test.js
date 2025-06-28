import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';

const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (typeof args[0] === 'string' && (
            args[0].includes('act(') || 
            args[0].includes('wrapped in act') ||
            args[0].includes("Can't access .root") ||
            args[0].includes('Warning: An update to')
        )) return;
        originalError.call(console, ...args);
    };
});
afterAll(() => { console.error = originalError; });


jest.mock('../../contexts/AuthContext', () => ({
    AuthProvider: ({ children }) => children,
    useAuth: () => ({
        session: { 
            user: { 
                id: '1', 
                email: 'flying@dragon.com' 
            } 
        },
        profile: { 
            id: '1', 
            username: 'fatbolster', 
            email: 'flying@dragon.com', 
            calorie_goal: 2000, 
            is_first_time: false 
        }
    })
}));

jest.mock('../../services/profileService', () => ({
    fetchPoints: jest.fn(() => Promise.resolve(150)),
    fetchProfileCalories: jest.fn(() => Promise.resolve({
        calories_consumed: 1000,
        calorie_goal: 2000
    })),
    fetchWeeklyCalories: jest.fn(() => Promise.resolve([
        { day: "MON", value: 300 },
        { day: "TUES", value: 450 },
        { day: "WED", value: 200 },
        { day: "THURS", value: 600 },
        { day: "FRI", value: 350 },
        { day: "SAT", value: 400 },
        { day: "SUN", value: 250 }
    ])),
    fetchVisited1: jest.fn(() => Promise.resolve(false)),
    fetchClaimedCheckboxes: jest.fn(() => Promise.resolve([]))
}));

jest.mock('../../contexts/DistanceTrackingContext', () => ({
    DistanceProvider: ({ children }) => children,
    useDistance: () => ({
        distance: 3000 
    })
}));


jest.mock('@shopify/react-native-skia', () => ({
    Canvas: 'Canvas',
    Group: 'Group',
    Rect: 'Rect',
    Path: 'Path',
    Line: 'Line',
    Circle: 'Circle',
    Text: 'Text',
    useFont: () => null,
    Skia: {
        Path: {
            Make: () => ({
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                close: jest.fn(),
            })
        }
    }
}));

jest.mock('expo-linear-gradient', () => ({
    LinearGradient: 'LinearGradient'
}));

jest.mock('react-native-circular-progress-indicator', () => ({
    __esModule: true,
    CircularProgress: 'CircularProgress',
    default: 'CircularProgress'
}));

jest.mock('d3', () => {
    const mockScale = jest.fn(() => 0);
    mockScale.domain = jest.fn(() => mockScale);
    mockScale.range = jest.fn(() => mockScale);
    mockScale.bandwidth = jest.fn(() => 10);
    mockScale.padding = jest.fn(() => mockScale);
    mockScale.paddingInner = jest.fn(() => mockScale);
    mockScale.paddingOuter = jest.fn(() => mockScale);
    mockScale.step = jest.fn(() => 10);
    mockScale.call = jest.fn();
    
    return {
        scaleLinear: jest.fn(() => mockScale),
        scaleBand: jest.fn(() => mockScale),
        scalePoint: jest.fn(() => mockScale),
        scaleOrdinal: jest.fn(() => mockScale),
        max: jest.fn(() => 100),
        min: jest.fn(() => 0),
        extent: jest.fn(() => [0, 100]),
        line: jest.fn(() => ({
            x: jest.fn(() => ({
                y: jest.fn(() => ({
                    curve: jest.fn(),
                    defined: jest.fn()
                }))
            }))
        })),
        curveBasis: 'curveBasis',
        curveLinear: 'curveLinear'
    };
});

jest.mock('../../components/BarPath', () => () => null);
jest.mock('../../components/XAxisText', () => () => null);

jest.mock('@expo/vector-icons/Ionicons', () => 'MockIonicons');
jest.mock('@expo/vector-icons/FontAwesome5', () => 'MockFontAwesome5');

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: jest.fn() })
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn(() => Promise.resolve(true)),
        signIn: jest.fn(() => Promise.resolve({ user: { email: 'test@example.com' } })),
        signOut: jest.fn(() => Promise.resolve()),
        isSignedIn: jest.fn(() => Promise.resolve(false)),
        getCurrentUser: jest.fn(() => Promise.resolve(null)),
        getTokens: jest.fn(() => Promise.resolve({ accessToken: 'mock-token' }))
    },
    statusCodes: {
        SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
        IN_PROGRESS: 'IN_PROGRESS',
        PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE'
    }
}));

jest.mock('../../lib/supabase', () => ({
    supabase: {
        auth: {
            signOut: jest.fn(() => Promise.resolve()),
            getUser: jest.fn(() => Promise.resolve({ data: { user: null } }))
        }
    }
}));

jest.mock('../../utils/generateUniqueUsername', () => ({
    generateUniqueUsername: jest.fn(() => 'mockUsername123')
}));


import { AuthProvider } from '../../contexts/AuthContext';
import { DistanceProvider } from '../../contexts/DistanceTrackingContext';
import ProfileScreen from '../../screens/ProfileScreen';


const NutriNexusMockApp = ({ children }) => (
    <AuthProvider>
        <DistanceProvider>
        {children}
        </DistanceProvider>
    </AuthProvider>
);

beforeEach(() => {
    jest.clearAllMocks();
  });

it('Profile dashboard should display points from useProfileData hook', async () => {
    render(
        <NutriNexusMockApp>
        <ProfileScreen />
        </NutriNexusMockApp>
    );
     
    await waitFor(() => {
        expect(screen.getByText('Welcome Back, fatbolster!')).toBeTruthy() 
    }, { timeout: 3000 })

    await waitFor(() => {
        expect(screen.getByText('150')).toBeTruthy(); 
        expect(screen.getByText('Points')).toBeTruthy();
      }, { timeout: 3000 });

    const profileService = require('../../services/profileService');
    expect(profileService.fetchPoints).toHaveBeenCalledWith('1');



})

it('Profile dashboard should display steps from distance context', async () => {
    render(
        <NutriNexusMockApp>
          <ProfileScreen />
        </NutriNexusMockApp>
    );

    const expectedSteps = Math.floor(3000/0.75)
    await waitFor(() => {
        expect(screen.getByText(expectedSteps.toString())).toBeTruthy() 
    })

})

