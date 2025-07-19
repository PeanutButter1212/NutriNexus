// GardenScreen.test.js
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import GardenScreen from '../../screens/GardenScreen'
import { Dimensions } from 'react-native'

import { getIsometricPosition } from '../../utils/getIsometricPosition'

import {
    isTileOccupied, 
    getClosestTile

} from '../../utils/tileUtils.js'
// Mock dependencies
jest.mock('@react-navigation/native', () => ({
    useFocusEffect: jest.fn(),
}));

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../hooks/useDecorInventory', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('../../hooks/useItemBank', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('../../hooks/useLayoutData', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('../../hooks/useItemInteraction', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('../../hooks/useShovelInteraction', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@shopify/react-native-skia', () => ({
    useImage: jest.fn(),
    Canvas: ({ children }) => children,
    Path: ({ children }) => children,
    Skia: {
        Path: {
            Make: () => ({
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                close: jest.fn(),
            }),
        },
    },
    Image: ({ children }) => children,
}));

// Mock services
jest.mock('../../services/gardenService', () => ({
    fetchPlants: jest.fn(),
    handleAssetConsumption: jest.fn(),
    insertToGarden: jest.fn(),
    retrieveDecorInventory: jest.fn(),
    removeFromGarden: jest.fn(),
    returnToInventory: jest.fn(),
    fetchDecorIdOnTile: jest.fn(),
    addtoDecorInventory: jest.fn(),
}));

import { useAuth } from '../../contexts/AuthContext';
import useDecorInventory from '../../hooks/useDecorInventory';
import useItemBank from '../../hooks/useItemBank';
import useLayoutData from '../../hooks/useLayoutData';
import useItemInteraction from '../../hooks/useItemInteraction';
import useShovelInteraction from '../../hooks/useShovelInteraction';
import { PlaceholderAlignment } from '@shopify/react-native-skia';

const mockSession = { user: { id: 'emerson' } };
const mockProfile = { id: '1697' };

const mockInventory = [
    { item_id: 'durian', count: 3, type: 'decor' },
    { item_id: 'spider', count: 1, type: 'decor' },
];

const mockItemBank = [
    { id: 'durian', name: 'Durian', image_url: 'durian.png', type: 'decor' },
    { id: 'spider', name: 'Spider Lily', image_url: 'spiderlily.png', type: 'decor' },
];

const mockGardenLayout = [
    { col: 0, row: 0, item: { id: 'plant1', name: 'Durian', image_url: 'durian.png' } },
    { col: 1, row: 1, item: { id: 'plant2', name: 'Spider Lily', image_url: 'spiderlily.png' } },
];

const mockHandleDragStart = jest.fn();
const mockHandleDragMove = jest.fn();
const mockHandleDragEnd = jest.fn();
const mockHandleShovelStart = jest.fn();
const mockHandleShovelMove = jest.fn();
const mockHandleShovelEnd = jest.fn();

// Setup function that can be reused
const setupMocks = () => {
    useAuth.mockReturnValue({
        session: mockSession,
        profile: mockProfile,
    });

    useDecorInventory.mockReturnValue(mockInventory);
    useItemBank.mockReturnValue(mockItemBank);
    useLayoutData.mockReturnValue(mockGardenLayout);
    
    useItemInteraction.mockReturnValue({
        handleDragStart: mockHandleDragStart,
        handleDragMove: mockHandleDragMove,
        handleDragEnd: mockHandleDragEnd,
    });

    useShovelInteraction.mockReturnValue({
        handleShovelStart: mockHandleShovelStart,
        handleShovelMove: mockHandleShovelMove,
        handleShovelEnd: mockHandleShovelEnd,
    });
};

beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
});

// Test 1: getIsometricPosition returns correct coordinates for the four edges of the garden 
it('tests correct coordinates returned by getIsometricPosition', () => {

    const topLeft = getIsometricPosition(0, 0);
    const topRight = getIsometricPosition(4, 0);
    const bottomLeft = getIsometricPosition(0, 4);
    const bottomRight = getIsometricPosition(4, 4);
    
    expect(topLeft.x).toBe(215)
    expect(topLeft.y).toBe(233)
    
    expect(topRight.x).toBeCloseTo(215 + 4 * 35.506, 2)
    expect(topRight.y).toBeCloseTo(233 + 4 * 20.5, 2)

    expect(bottomLeft.x).toBeCloseTo(215 - 4 * 35.506, 2)
    expect(bottomLeft.y).toBeCloseTo(233 + 4 * 20.5, 2)

    expect(bottomRight.x).toBe(215)
    expect(bottomRight.y).toBeCloseTo(233 + 8 * 20.5, 2)



    


})

//Test 2: Collision detection (tiles cannpot be planted on tiles that are already planted)

it('isTileOccupied checks for occupied tiles correctly', () => {
    const mockPlacedPlants = { current: mockGardenLayout };


    expect(isTileOccupied(0, 0, mockPlacedPlants)).toBe(true)
    expect(isTileOccupied(1, 1, mockPlacedPlants)).toBe(true)
    expect(isTileOccupied(1, 2, mockPlacedPlants)).toBe(false)
})


// Test 3: Count of Item decreases successfully after item placement 
it('Count of item decreases by one after placed in the garden', () => {
    const decrementInventoryCount = (inventory, itemId) => {
        return inventory.map(plant => plant.item_id === itemId ? 
            { ...plant, count: plant.count - 1 }
            : plant)
            .filter(item => item.count > 0)
    }

    //Check for removal of plants with count greater than 1 
    const updatedInventory = decrementInventoryCount(mockInventory, 'durian')

    expect(updatedInventory[0].count).toBe(2)
    expect(updatedInventory[1].count).toBe(1)

    //Check for removal of plants with count of 1

    const updatedInventory2 = decrementInventoryCount(mockInventory, 'spider')
    expect(mockInventory.length).toBe(2)
    expect(updatedInventory2.length).toBe(1)
    expect(updatedInventory[0].item_id).toBe('durian')
     
  

})

//Test 4: Count of item increase successfully after item removal 
it('Count of item increase by one after removed from the garden', () => {

    const returnToInventory = (inventory, itemId) => {
        const itemExists = inventory.find(item => item.item_id === itemId)
        if (itemExists) {
          return inventory.map(item =>
                item.item_id === itemId
                ? {...item, count: item.count + 1}
                : item
            )
        } else {
          return ([...inventory, { item_id: itemId, count: 1 }])
        }}

    const updatedInventory = returnToInventory(mockInventory, 'durian')

    expect(updatedInventory[0].count).toBe(4)


} )

//Test 5: Detects closest tile based on cursor coordinate
it ('getClosestTile detects closest tile successfully', () => {
    const mockGridView = [
        { col: 0, row: 0, x: 215, y: 233 },
        { col: 1, row: 0, x: 250.506, y: 253.5 },
        { col: 0, row: 1, x: 179.494, y: 253.5 },
        { col: 1, row: 1, x: 215, y: 274 },
    ];

    //coordinates are that of an exact tile
    const grid1 = getClosestTile(215, 233, mockGridView)
    expect(grid1).toEqual({ col: 0, row: 0, x: 215, y: 233 })

    //coordinates within range to a tile 
    const grid2 = getClosestTile(250, 251, mockGridView)
    expect(grid2).toEqual({ col: 1, row: 0, x: 250.506, y: 253.5})

    //coordinates are not within range to any time 
    const grid3 = getClosestTile(2, 25, mockGridView)
    expect(grid3).toEqual(null)
})