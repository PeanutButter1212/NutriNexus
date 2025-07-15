import { View, Text, Image, Dimensions, ImageBackground, TouchableOpacity, Animated, ScrollView, UIManager, Pressable, findNodeHandle, TouchableWithoutFeedback} from 'react-native';
import React,  { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import gardenImage from '../assets/garden/garden.png'
import woodenBackground from '../assets/backgrounds/inventoryBackground.png'
import { useImage, Canvas, Path, Skia, Image as SkiaImage } from "@shopify/react-native-skia";
import { getCustomFonts } from '../utils/loadFonts'
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import InventoryColumn from '../components/InventoryColumn'
import DraggableItem from '../components/DraggableItem'
import { fetchPlants, handleAssetConsumption, insertToGarden, retrieveDecorInventory, removeFromGarden, returnToInventory, fetchDecorIdOnTile, addtoDecorInventory } from '../services/gardenService';
import { useAuth } from "../contexts/AuthContext";
import useDecorInventory from '../hooks/useDecorInventory';
import useItemBank from '../hooks/useItemBank';
import SkiaImageItem from '../components/skiaImageItem';
import useLayoutData from '../hooks/useLayoutData';
import ShovelComponent from '../components/ShovelComponent';
import DraggableShovel from '../components/DraggableShovel';
import { useFocusEffect } from '@react-navigation/native';
import { Platform } from 'react-native';
import useItemInteraction from '../hooks/useItemInteraction';
import useShovelInteraction from '../hooks/useShovelInteraction';





const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height; 

const IMAGE_WIDTH = 56;
const IMAGE_HEIGHT = 64;

const DIAMOND_SIZE = 36; 
const SPACING = 41; 
const xStartOfGarden = SCREEN_WIDTH / 2 
const yStartOfGarden = 0.25 * SCREEN_HEIGHT; 



// we set a starting point with 0, 0 then the further we are from this 0, 0, we will increment by x and y by a standardised amount 
// so that spacing between diamond views are standardised as well 

const getIsometricPosition = (col, row) => {
  const alignmentX = (col - row) * (SPACING * 0.866); 
  const alignmentY = (col + row) * (SPACING * 0.5);

  return {
    x: xStartOfGarden + alignmentX, 
    y: yStartOfGarden + alignmentY 

  }

}

// render diamond view, centerx centery size control location and size of the view 
const diamondView = (centerX, centerY, size) => {
  const diamondPen = Skia.Path.Make() 

  const radius = size/2 
  const top = {x: centerX, y: centerY - radius }
  const right = {x: centerX + size, y: centerY}
  const left = {x: centerX - size, y: centerY}
  const bottom = {x: centerX, y: centerY + radius }

  diamondPen.moveTo(top.x, top.y)
  diamondPen.lineTo(right.x, right.y)
  diamondPen.lineTo(bottom.x, bottom.y)
  diamondPen.lineTo(left.x, left.y)
  diamondPen.close() 

  return diamondPen; 



};





export default function GardenScreen() {
  const { session, profile } = useAuth()

  
  const itemBank = useItemBank()

  const gardenLayout = useLayoutData()

  const [placedPlants, setPlacedPlants] = useState([]);
  const placedPlantsRef = useRef([]);

  const [localInventory, setLocalInventory] = useState([]);
  const decorInventory = useDecorInventory();

  const gardenAreaRef = useRef(null);
  const [hoverTile, setHoverTile] = useState(null);

  const [isDraggingShovel, setIsDraggingShovel] = useState(false)
  const [showPlantTiles, setShowPlantTiles] = useState(false)

  const floatingDragRef = useRef(null);
  const draggedItemRef = useRef(null);
  const [renderTrigger, setRenderTrigger] = useState(0);

  useEffect(() => {
    placedPlantsRef.current = placedPlants;
  }, [placedPlants]);


  useEffect(() => {
    if (gardenLayout && gardenLayout.length > 0) {
      setPlacedPlants(gardenLayout);
  }
}, [gardenLayout]);

useEffect(() => {
  if (decorInventory && Array.isArray(decorInventory)) {
    setLocalInventory(decorInventory);
  }
}, [decorInventory]);

  // 5 x 5 grid so run the loop 25 times to generate 25 diamond tiles that have consistent spacing throughout the garden 
  const tileArray = () => {
    const views = []; 

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const {x, y} = getIsometricPosition(col, row)
        const path = diamondView(x, y, DIAMOND_SIZE)
         views.push({
          path,
          col,
          row,
          x,
          y,

        })
      }

    }

    return views; 
  };

  const gridView = tileArray();



  const { handleDragStart, handleDragMove, handleDragEnd } = useItemInteraction({
    placedPlantsRef, 
    setHoverTile,
    setPlacedPlants,
    setLocalInventory,
    setRenderTrigger,
    floatingDragRef,
    draggedItemRef,
    itemBank,
    gridView
  });

  const {
    handleShovelStart,
    handleShovelMove,
    handleShovelEnd,
  } = useShovelInteraction({
    session,
    placedPlantsRef,
    setPlacedPlants,
    setLocalInventory, 
    setHoverTile,
    setIsDraggingShovel,
    setRenderTrigger,
    setShowPlantTiles,
    floatingDragRef,
    draggedItemRef,
    gridView
  });

  const isTileOccupied = (col, row) => {
    return placedPlantsRef.current.some(decor => decor.row === row && decor.col === col);
  };
  
  


  

  let shouldShowHoverTile = false;
  let shouldShowHoverTileForRemoval = false; 
  
 

  if (hoverTile) {
    const occupied = isTileOccupied(hoverTile.col, hoverTile.row);
    
    if (isDraggingShovel) {
      if (occupied) {
        shouldShowHoverTileForRemoval = true;
      }
    } else {
      if (!occupied) {
        shouldShowHoverTile = true;
      }
    }
  }
 

  

  // for display of inventory columns 
  const renderInventoryColumns = () => {
    const columns = [];

    if (localInventory.length == 0 || !itemBank || itemBank.length === 0) {
      return [];
    } 

    for (let i = 0; i < localInventory.length; i += 1) {
      const topInv = localInventory[i];

      const topInfo = itemBank.find(item => item.id === topInv.item_id);

      columns.push(
        <InventoryColumn
          key={`column-${topInv.item_id} || 'empty'}`} 
          className={i === 0 ? "" : "ml-3"}
          topItem={{
            count: topInv.count,
            children: (
              <DraggableItem
                key={`draggable-${topInv.item_id}`} 
                item={topInv}
                itemInfo={topInfo}
                draggedItemData={draggedItemRef.current}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                size = {80}
              />
            ),
          }}
        />
      );
  
    
  };
  return columns;
  }

  const renderShovel = () => {
    const shovelItem = {
      item_id: 'shovel',
      count: 1, 
      type: 'tool'
    }

    const shovelItemInfo = {
      id: 'shovel',
      name: 'Shovel',
      image_url: "https://rkrdnsnujizdskzbdwlp.supabase.co/storage/v1/object/public/item-images//Shovel.png",
      type: 'tool'
    }

    return (
      <View
      className="ml-8 mb-6"
      >
      <ShovelComponent
      topItem={{
        children: (
          <DraggableItem
              item={shovelItem}
              itemInfo={shovelItemInfo}
              draggedItemData={draggedItemRef.current}
              onDragStart={handleShovelStart}
              onDragMove={handleShovelMove}
              onDragEnd={handleShovelEnd}
              size={50}
              className="mt-2 mr-2"
          />
      ),

      }}
      />
    </View>
    )

  }


const incrementInventory = (plantId) => {
  setLocalInventory(prev => {
  console.log("plantId: " + plantId)
  const itemExists = prev.find(item => item.item_id === plantId)
  if (itemExists) {
    return prev.map(item =>
          item.item_id === plantId 
          ? {...item, count: item.count + 1}
          : item
      )
  } else {
    return ([...prev, { item_id: plantId, count: 1 }])
  }
})}


 


 
  return (
    <View
    ref={gardenAreaRef}
    style={{ flex: 1, position: 'relative' }}
    >
    <View className="flex-1 relative flex-col">
      <View style={{ height: '65%', width: '100%' }}>
        <Image 
        source={gardenImage} 
        style={{
          width: '100%',
          height: '100%',
        }}
        resizeMode="stretch"
        /> 
       </View>

       <Canvas
       style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
       }}
       > 
      {draggedItemRef.current && !isDraggingShovel && gridView.map(({ path, col, row }) => {
        if (isTileOccupied(col, row)) return null;
        return (
          <Path
            key={`tile-${col}-${row}`}
            path={path}
            style="fill"
            color="rgba(255, 100, 100, 0.4)"
            strokeWidth={1.5}
            strokeColor="#ff6666"
          />
        );
      })}
    

        {placedPlants.map((plant, idx) => {
          const { x, y } = getIsometricPosition(plant.col, plant.row);
          return (
          <SkiaImageItem
          key={`plant-${plant.row}-${plant.col}-${plant.item.id}`}
          item={plant.item}
          x={x - IMAGE_WIDTH / 2}
          y={y - IMAGE_HEIGHT * 0.75}
          />
          )
          
       
})}
      
      

      {shouldShowHoverTileForRemoval && (
        <Path
          path={diamondView(hoverTile.x, hoverTile.y, DIAMOND_SIZE)}
          style="fill"
          color="rgba(255, 255, 255, 0.3)" 
          strokeWidth={2}
          strokeColor="#ffffff"
        />
      )}

      {showPlantTiles && placedPlantsRef.current.map((plant, idx) => {
        const {x, y} = getIsometricPosition(plant.col, plant.row)
        path = diamondView(x, y, DIAMOND_SIZE)
        return (
        <Path
        key={`plant-path-${plant.row}-${plant.col}`}
        path={path}
        style="fill"
        color="rgba(255, 100, 100, 0.4)"
        strokeWidth={1}
        strokeColor="#ffffff"
        />
      )
      })

      }


      {shouldShowHoverTile && (
        <Path
          path={diamondView(hoverTile.x, hoverTile.y, DIAMOND_SIZE)}
          style="fill"
          color="rgba(255, 255, 255, 0.3)" 
          strokeWidth={2}
          strokeColor="#ffffff"
        />
      )}





       </Canvas>


       



 
        <ImageBackground
        source={woodenBackground}
        resizeMode="cover"
        className="flex-1">
      
        <Text style=
        {{ fontFamily: 'pixel-font',
          letterSpacing: 3
        }} 
        className="text-yellow-300 text-center pb-0 p-5 text-2xl">  
          INVENTORY

        </Text>

        <SafeAreaProvider> 
          <SafeAreaView>
          <ScrollView className="flex-row flex-wrap m-4" horizontal scrollEnabled={!draggedItemRef.current}>
              {renderInventoryColumns()}
            </ScrollView>
              
              
    
          </SafeAreaView>

        </SafeAreaProvider>

        <View>
          {renderShovel()}
        </View>
{/**   <TouchableOpacity
        onPress={handleDebug}
        className="bg-red-200"
        >
          <Text>
            Button
          </Text>
        </TouchableOpacity>

        
*/}
      </ImageBackground>
      

    </View>
     {floatingDragRef.current && (
      <>   
      <View
        style={{
            position: 'absolute',
            left: floatingDragRef.current.x,
            top:  floatingDragRef.current.y,
            zIndex: 9999,
            elevation: 9999,
            pointerEvents: 'none',
        }}
    >
        <Image
            source={{ uri: floatingDragRef.current.itemInfo?.image_url }}
            style={{
                width: 70,
                height: 70,
                opacity: 0.8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            }}
        />
    </View>
    
    </>
    
  
)}


      
      </View>


);
}