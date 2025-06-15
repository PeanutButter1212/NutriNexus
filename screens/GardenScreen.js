import { View, Text, Image, Dimensions, ImageBackground, ScrollView, UIManager, Pressable, findNodeHandle, TouchableWithoutFeedback} from 'react-native';
import React,  { useRef, useState, useEffect, useMemo } from 'react'
import gardenImage from '../assets/garden/garden.png'
import durianImage from '../assets/garden/plants/durian.png'
import bougainvillaImage from '../assets/garden/plants/bougainvilla.png'
import woodenBackground from '../assets/backgrounds/inventoryBackground.png'
import { useImage, Canvas, Path, Skia, Image as SkiaImage } from "@shopify/react-native-skia";
import { getCustomFonts } from '../utils/loadFonts'
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import InventoryColumn from '../components/InventoryColumn'
import DraggableItem from '../components/DraggableItem'
import { fetchPlants, handleSuccessfulPlacement, retrieveDecorInventory } from '../services/gardenService';
import { useAuth } from "../contexts/AuthContext";
import useDecorInventory from '../hooks/useDecorInventory';
import useSkiaImageMap from '../hooks/useSkiaImageMap';
import { drag } from 'd3';
import useItemBank from '../hooks/useItemBank';
import SkiaImageItem from '../components/skiaImageItem';

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

  const fonts = getCustomFonts();
  
  const itemBank = useItemBank()

  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemData, setDraggedItemData] = useState(null);

  const [placedPlants, setPlacedPlants] = useState([]);

  const [localInventory, setLocalInventory] = useState([]);

  const gardenAreaRef = useRef(null);
  const [gardenOffset, setGardenOffset] = useState({ x: 0, y: 0 });
  const [hoverTile, setHoverTile] = useState(null);

  const decorInventory = useDecorInventory();

  useEffect(() => {
    setLocalInventory(decorInventory); 
  }, [decorInventory])


  //create a ref of inventory slots so we can determine their coordinate at any time to spawn draggable item on click of any inventory items 
  const inventoryRefs = useMemo(() => {
    return localInventory.map(() => ({
      ref: React.createRef(),
    }));
  }, [localInventory]);

  // for display of inventory columns 
  const renderInventoryColumns = () => {
    const columns = [];

    if (localInventory.length == 0) {
      return [];
    } 

    for (let i = 0; i < localInventory.length; i += 2) {
      const topInv = localInventory[i];
      const bottomInv = localInventory[i + 1];
  
      const topInfo = itemBank.find(item => item.id === topInv.item_id);
      const bottomInfo = bottomInv ? itemBank.find(item => item.id === bottomInv.item_id) : null;


      const topRef = inventoryRefs[i]?.ref;
      const bottomRef = bottomInv ? inventoryRefs[i + 1]?.ref : null;
  
      columns.push(
        <InventoryColumn
          key={`column-${i}`}
          topItem={{
            count: topInv.count,
            children: (
              <Pressable
                ref={topRef}
                onPressIn={() => 
                  handlePressIn(topRef, topInv.item_id, topInfo.image_url, 7, 7) 
                  
                }
              >
                <Image
                  source={{ uri: topInfo?.image_url }}
                  className="w-20 h-20"
                />
              </Pressable>
            ),
            slotRef: topRef,
          }}
          bottomItem={
            bottomInv && bottomInfo
              ? {
                  count: bottomInv.count,
                  children: (
                    <Pressable
                      ref={bottomRef}
                      onPressIn={() => 
                        handlePressIn(bottomRef, bottomInv.item_id, bottomInfo.image_url, 0, 0) }
                    >
                      <Image
                        source={{ uri: bottomInfo.image_url }}
                        className="w-20 h-20"
                      />
                    </Pressable>
                  ),
                  slotRef: bottomRef,
                }
              : undefined
          }
        />
      );
    }
  
    return columns;
  };

//we have a local copy of inventory from what was received from our hook so that UI can render count changes quickly
  const decrementInventory = (plantId) => {
    setLocalInventory(prev => 
      prev 
      .map(
        item =>
          item.item_id === plantId 
          ? {...item, count: item.count - 1}
          : item
      )
      .filter(item => item.count > 0)

    )

  }
// when we click on inventory item, a draggable item will be spawned at the exact same location as the inventory slot
  const handlePressIn = (ref, plantId, imageUrl, offsetX, offsetY) => {
    setIsDragging(false);
    setDraggedItemData(null);

    
  
    setTimeout(() => {
      ref.current.measure((fx, fy, width, height, px, py) => {
        setDraggedItemData({
          startX: px + offsetX,
          startY: py + offsetY,
          plantId,
          image: { uri: imageUrl },
        });
        setIsDragging(true);
      });
    }, 0);

  }

  

  const handleDebug = () => {
    setPlacedPlants([]);
    console.log("Item Bank: " + JSON.stringify(placedPlants, null, 2));
  }

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




// run through gridview array, on any location help us determine which tile of the garden the location is closest to, if nearest tile
// is less than DIAMOND_SIZE (which is arbitarily set to 36) then set this tile as tile and continue, otherwise tile is null 
  const getClosestTile = ( screenX, screenY ) => {
    const relativeX = screenX
    const relativeY = screenY 

    let min_dist = Infinity;
    let tile = null;

    for (let i = 0; i < gridView.length; i++) {
      const xDisplacement = gridView[i].x - relativeX;
      const yDisplacement = gridView[i].y - relativeY; 
      const dist = Math.sqrt(xDisplacement * xDisplacement + yDisplacement * yDisplacement)

      if (dist <= DIAMOND_SIZE && dist < min_dist) {
        tile = gridView[i]
        min_dist = dist

      }
    }

    return tile; 
  }
  
//during movement of the drag, we use getClosestTile to determine which tile the location is closest to, that tile will be set
//to hovering state and displays a white translucent overlay 
  const handleDragMove = ({ x, y }) => {
    setHoverTile(getClosestTile(x, y));
  };
  
//upon end of drag motion of draggable item, if the point at which the drag end is near the tile, getClosestTile will return 
//the nearest tile and we will add this items to the placedplants array so that the item (plant) will be added to the garden 
  const handleDragEnd = async ({ dropX, dropY }) => {
    setIsDragging(false);
    setHoverTile(null);
    console.log("handleDragEnd")
    const tile = getClosestTile(dropX, dropY)

    console.log(draggedItemData.plantId)
    if (tile && draggedItemData?.plantId) {
      const item = itemBank.find(decor => decor.id === draggedItemData.plantId)

      if (!item) {
        console.log("Item not found")
      }


      setPlacedPlants(prev => [
        ...prev,
        {
          item: item,
          x: tile.x,
          y: tile.y,
        },
      ]);

      decrementInventory(draggedItemData.plantId)
      await handleSuccessfulPlacement(session.user.id, draggedItemData.plantId)
    
    }

   

  };
  

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
        {isDragging && gridView.map(({ path, col, row, x, y }, index) => (         
          <Path
            key={`tile-${col}-${row}`}
            path={path}
            style="fill"
            color="rgba(255, 100, 100, 0.4)"
            strokeWidth={1.5}
            strokeColor="#ff6666"
          />
        ))}
    

        {placedPlants.map((plant, idx) => (
          <SkiaImageItem
            key={`plant-${idx}`}
            item={plant.item}
            x={plant.x - IMAGE_WIDTH / 2}
            y={plant.y - IMAGE_HEIGHT * 0.75}
          />
        ))}

      {hoverTile && (
        <Path
          path={diamondView(hoverTile.x, hoverTile.y, DIAMOND_SIZE)}
          style="fill"
          color="rgba(255, 255, 255, 0.3)" // semi-transparent
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
          <ScrollView className="flex-row flex-wrap m-4" horizontal scrollEnabled={!isDragging}>
              {renderInventoryColumns()}
            </ScrollView>
              
              
    
          </SafeAreaView>

        </SafeAreaProvider>
        

  

        </ImageBackground>

      
        {isDragging && draggedItemData && (
          <DraggableItem
            image={draggedItemData.image}
            startX={draggedItemData.startX}
            startY={draggedItemData.startY}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
          />
        )}

    <Pressable onPress={() => handleDebug()}>
      <Text style={{ color: 'white', padding: 3, backgroundColor: 'red' }}>
        Clear Garden
      </Text>
    </Pressable>




    </View>
   
    </View>

  )
}