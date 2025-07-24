import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import GardenScreen from "../../../screens/GardenScreen";
import { Dimensions } from "react-native";

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock("../../../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../../hooks/useDecorInventory", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../../hooks/useItemBank", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../../hooks/useLayoutData", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../../hooks/useItemInteraction", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../../hooks/useShovelInteraction", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@shopify/react-native-skia", () => ({
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

jest.mock("../../../services/gardenService", () => ({
  fetchPlants: jest.fn(),
  handleAssetConsumption: jest.fn(),
  insertToGarden: jest.fn(),
  retrieveDecorInventory: jest.fn(),
  removeFromGarden: jest.fn(),
  returnToInventory: jest.fn(),
  fetchDecorIdOnTile: jest.fn(),
  addtoDecorInventory: jest.fn(),
}));

// Imports after mocks
import { useAuth } from "../../../contexts/AuthContext";
import useDecorInventory from "../../../hooks/useDecorInventory";
import useItemBank from "../../../hooks/useItemBank";
import useLayoutData from "../../../hooks/useLayoutData";
import useItemInteraction from "../../../hooks/useItemInteraction";
import useShovelInteraction from "../../../hooks/useShovelInteraction";
import * as gardenService from "../../../services/gardenService";

const mockSession = { user: { id: "emerson" } };
const mockProfile = { id: "1697" };

const mockInventory = [
  { item_id: "durian", count: 1, type: "decor" },
  { item_id: "spider", count: 1, type: "decor" },
];

const mockItemBank = [
  { id: "durian", name: "Durian", image_url: "durian.png", type: "decor" },
  {
    id: "spider",
    name: "Spider Lily",
    image_url: "spiderlily.png",
    type: "decor",
  },
];

const mockGardenLayout = [
  {
    col: 0,
    row: 0,
    item: { id: "plant1", name: "Durian", image_url: "durian.png" },
  },
  {
    col: 1,
    row: 1,
    item: { id: "plant2", name: "Spider Lily", image_url: "spiderlily.png" },
  },
];

const mockHandleDragStart = jest.fn();
const mockHandleDragMove = jest.fn();
const mockHandleDragEnd = jest.fn();
const mockHandleShovelStart = jest.fn();
const mockHandleShovelMove = jest.fn();
const mockHandleShovelEnd = jest.fn();

const setupMocks = () => {
  useAuth.mockReturnValue({
    session: mockSession,
    profile: mockProfile,
  });

  // ✅ FIX: Must return decorInventory inside object
  useDecorInventory.mockReturnValue({ decorInventory: mockInventory });

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

test("User places and removes decor and inventory updates", async () => {
  const { getByTestId, getByText, getAllByTestId } = render(<GardenScreen />);
  console.log(getAllByTestId(/^drag-/).map((e) => e.props.testID));

  // ✅ Wait until item is rendered

  const item = await waitFor(() => getByTestId("drag-durian"));
  fireEvent.press(item);
  expect(mockHandleDragStart).toHaveBeenCalled();

  // Simulate item drop on tile
  fireEvent.press(getByTestId("tile-0-0"));
  expect(mockHandleDragEnd).toHaveBeenCalled();
  expect(gardenService.insertToGarden).toHaveBeenCalled();

  // Simulate shovel tool removal
  fireEvent.press(getByText("Shovel"));
  fireEvent.press(getByTestId("tile-0-0"));
  expect(mockHandleShovelStart).toHaveBeenCalled();
  expect(gardenService.fetchDecorIdOnTile).toHaveBeenCalled();
  expect(gardenService.removeFromGarden).toHaveBeenCalled();
  expect(gardenService.returnToInventory).toHaveBeenCalled();
});
