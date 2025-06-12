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
import { fetchPlants } from '../services/gardenService';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height; 

const IMAGE_WIDTH = 56;
const IMAGE_HEIGHT = 64;

const DIAMOND_SIZE = 36; 
const SPACING = 41; 
const xStartOfGarden = SCREEN_WIDTH / 2 
const yStartOfGarden = 0.25 * SCREEN_HEIGHT; 

const mockInventory = [
  {
    id: 'durian',
    name: 'Durian',
    image_url: 'https://your-supa-url.com/durian.png',
    count: 5,
  },
  {
    id: 'bougainvilla',
    name: 'Bougainvilla',
    image_url: 'https://your-supa-url.com/bougainvilla.png',
    count: 3,
  },
]

const getIsometricPosition = (col, row) => {
  const alignmentX = (col - row) * (SPACING * 0.866); 
  const alignmentY = (col + row) * (SPACING * 0.5);

  return {
    x: xStartOfGarden + alignmentX, 
    y: yStartOfGarden + alignmentY 

  }

}

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

  const durian = useImage(durianImage); 
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemData, setDraggedItemData] = useState(null);
  const [placedPlants, setPlacedPlants] = useState([]);
  const gardenAreaRef = useRef(null);
  const [gardenOffset, setGardenOffset] = useState({ x: 0, y: 0 });
  const [hoverTile, setHoverTile] = useState(null);
  const [plantList, setPlantList] = useState([]);

  useEffect(() => {
    fetchPlants().then(setPlantList);
  }, []);


  useEffect(() => {
    setTimeout(() => {
      gardenAreaRef.current?.measure((fx, fy, width, height, px, py) => {
        setGardenOffset({ x: px, y: py });
      });
    }, 0);
  }, []);

  const plantImageMap = useMemo(() => {
    return Object.fromEntries(
      plantList.map(plant => [plant.id, useImage({ uri: plant.image_url})])
    )
  })

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
  const durianSlotRef = useRef();


  const handlePressIn = () => {
      durianSlotRef.current?.measure((fx, fy, width, height, px, py) => {
        setDraggedItemData({
          startX: px + 7,
          startY: py + 6, 
          image: durianImage,
        });
        setIsDragging(true);
      });
    };



    const getClosestTile = ( screenX, screenY ) => {
      const relativeX = screenX - gardenOffset.x
      const relativeY = screenY - gardenOffset.y 
  
  
  
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
  

  const handleDragMove = ({ x, y }) => {
    setHoverTile(getClosestTile(x, y));
  };
  

  const handleDragEnd = ({ dropX, dropY }) => {
    setIsDragging(false);
    setDraggedItemData(null);
    setHoverTile(null);

    const tile = getClosestTile(dropX, dropY)
    if (tile) {
      placedPlants.push({
        image: durian,
        x: tile.x,
        y: tile.y

      });
    }

    setPlacedPlants([...placedPlants]);
   

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
        {gridView.map(({ path, col, row, x, y }, index) => (
    
           
          <Path
            key={`tile-${col}-${row}`}
            path={path}
            style="fill"
            color="rgba(255, 100, 100, 0.4)"
            strokeWidth={1.5}
            strokeColor="#ff6666"
          />
        ))}


          {gridView.map(({ path, col, row, x, y }) => (
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
          <SkiaImage
            key={`plant-${idx}`}
            image={plant.image}
            x={plant.x - IMAGE_WIDTH / 2}
            y={plant.y - IMAGE_HEIGHT * 0.75}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            fit="contain"
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
              <InventoryColumn
                topItem={{
                  count: 5,
                  children: (
                    <Pressable onPressIn={handlePressIn} ref={durianSlotRef}>
                      <Image source={durianImage} className="w-20 h-20" />
                    </Pressable>
                  ),
                  slotRef: durianSlotRef,
                }}
                bottomItem={{
                  count: 3,
                  children: <Image source={require("../assets/garden/plants/bougainvilla.png")} className="w-20 h-20" />,
                }}
              />
              <InventoryColumn topItem={{ count: 4 }} />
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

    <Pressable onPress={() => setPlacedPlants([])}>
      <Text style={{ color: 'white', padding: 10, backgroundColor: 'red' }}>
        Clear Garden
      </Text>
    </Pressable>




    </View>
   
    </View>

  )
}